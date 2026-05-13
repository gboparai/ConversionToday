import { createPandocInstance } from 'pandoc-wasm/src/core.js';
import { ISOWriter } from '@gcu/iso9660';

const AUDIO_MIME_TYPE_BY_EXT = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    aac: 'audio/aac',
    m4a: 'audio/mp4',
    opus: 'audio/ogg; codecs=opus',
    webm: 'audio/webm',
    wma: 'audio/x-ms-wma',
    alac: 'audio/alac',
    ape: 'audio/ape',
};

const VIDEO_MIME_TYPE_BY_EXT = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    '3gp': 'video/3gpp',
    mpeg: 'video/mpeg',
    ts: 'video/mp2t',
    ogv: 'video/ogg',
};

const ARCHIVE_MIME_TYPE_BY_EXT = {
    zip: 'application/zip',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    'tar.gz': 'application/gzip',
    'tar.bz2': 'application/x-bzip2',
    'tar.xz': 'application/x-xz',
    iso: 'application/x-iso9660-image',
};

const SEVEN_ZIP_SUPPORTED_OUTPUTS = new Set(['7z', 'zip', 'tar']);
const SEVEN_ZIP_SUPPORTED_STREAM_CODECS = new Set(['gz', 'bz2', 'xz']);
const COMPOUND_EXTENSION_CONFIG = {
    'tar.gz': { archiveExtension: 'tar', streamExtension: 'gz' },
    'tar.bz2': { archiveExtension: 'tar', streamExtension: 'bz2' },
    'tar.xz': { archiveExtension: 'tar', streamExtension: 'xz' },
};

let processQueue = Promise.resolve();
let ffmpegInstance = null;
let ffmpegScriptLoaded = false;
let activeProgressRange = null;
let pandocPromise = null;
let sevenZipPromise = null;

function emitProgress(id, fraction, message) {
    if (id === null || id === undefined) return;
    const safe = Math.max(0, Math.min(1, Number(fraction) || 0));
    postMessage({
        status: 'progress',
        id,
        progress: Math.round(safe * 100),
        message: message || '',
    });
}

function mapFfmpegProgress(progress) {
    if (!activeProgressRange || activeProgressRange.id === null || activeProgressRange.id === undefined) return;
    const safe = Math.max(0, Math.min(1, Number(progress) || 0));
    const mapped = activeProgressRange.start + ((activeProgressRange.end - activeProgressRange.start) * safe);
    emitProgress(activeProgressRange.id, mapped, activeProgressRange.message);
}

function getExtension(name) {
    const lower = String(name || '').toLowerCase();
    const parts = lower.split('.');
    return parts.length > 1 ? parts.pop() : '';
}

function getCompoundExtension(name) {
    const lower = String(name || '').toLowerCase();
    return Object.keys(COMPOUND_EXTENSION_CONFIG).find((extension) => lower.endsWith(`.${extension}`)) || '';
}

function getBaseName(name) {
    const raw = String(name || 'merged');
    const compoundExtension = getCompoundExtension(raw);
    if (compoundExtension) {
        return raw.slice(0, -(compoundExtension.length + 1)) || 'merged';
    }
    return raw.replace(/\.[^.]+$/, '') || 'merged';
}

function buildMergedOutputName(files, outputExtension) {
    const base = files && files.length ? getBaseName(files[0].name) : 'merged';
    return `${base}-merged.${outputExtension}`;
}

function normalizeExtension(extension) {
    return String(extension || '').toLowerCase().replace(/^\./, '');
}

function createUniqueToken() {
    const bytes = new Uint8Array(8);
    self.crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function sanitizePath(path) {
    const normalized = String(path || '')
        .replace(/\\/g, '/')
        .split('/')
        .map((segment) => segment.trim())
        .filter((segment) => segment && segment !== '.' && segment !== '..');
    return normalized.join('/') || 'file';
}

function splitFileName(path) {
    const clean = sanitizePath(path);
    const slashIndex = clean.lastIndexOf('/');
    const dir = slashIndex >= 0 ? clean.slice(0, slashIndex + 1) : '';
    const fileName = slashIndex >= 0 ? clean.slice(slashIndex + 1) : clean;
    const compoundExtension = getCompoundExtension(fileName);
    if (compoundExtension) {
        return {
            dir,
            base: fileName.slice(0, -(compoundExtension.length + 1)) || 'file',
            extension: compoundExtension,
        };
    }
    const dotIndex = fileName.lastIndexOf('.');
    return {
        dir,
        base: dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName || 'file',
        extension: dotIndex > 0 ? fileName.slice(dotIndex + 1) : '',
    };
}

function createUniqueEntryPath(path, usedPaths) {
    const clean = sanitizePath(path || 'file');
    if (!usedPaths.has(clean)) {
        usedPaths.add(clean);
        return clean;
    }
    const { dir, base, extension } = splitFileName(clean);
    let index = 2;
    let candidate = '';
    do {
        candidate = `${dir}${base}-${index}${extension ? `.${extension}` : ''}`;
        index++;
    } while (usedPaths.has(candidate));
    usedPaths.add(candidate);
    return candidate;
}

function ensureFfmpegScriptLoaded() {
    if (ffmpegScriptLoaded) return;

    if (!self.__ffmpegDocumentShimLoaded) {
        const shimCode = [
            'var document = {',
            '  baseURI: self.location.href,',
            '  currentScript: { src: self.location.href },',
            '  getElementsByTagName: function () { return []; }',
            '};',
        ].join('');
        self.importScripts(`data:application/javascript,${encodeURIComponent(shimCode)}`);
        self.__ffmpegDocumentShimLoaded = true;
    }

    self.importScripts(`${self.location.origin}/vendor/ffmpeg/ffmpeg.js`);
    ffmpegScriptLoaded = true;
}

async function fetchFileData(file) {
    if (file instanceof Uint8Array) return file;
    if (file instanceof ArrayBuffer) return new Uint8Array(file);
    if (file && typeof file.arrayBuffer === 'function') {
        return new Uint8Array(await file.arrayBuffer());
    }
    return new Uint8Array();
}

async function loadFfmpeg() {
    if (ffmpegInstance) return ffmpegInstance;

    ensureFfmpegScriptLoaded();
    const FFmpegClass = self.FFmpegWASM && self.FFmpegWASM.FFmpeg;
    if (!FFmpegClass) throw new Error('Unable to resolve FFmpeg class from UMD runtime');

    const ff = new FFmpegClass();
    const classWorkerURL = `${self.location.origin}/ffmpeg-class-worker.js`;
    const baseURL = `${self.location.origin}/vendor/ffmpeg-core-esm`;

    await ff.load({
        classWorkerURL,
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });

    ff.on('progress', ({ progress }) => mapFfmpegProgress(progress));

    ffmpegInstance = { ff, fetchFile: fetchFileData };
    return ffmpegInstance;
}

function resolveAudioVideoMimeType(family, config, outputExtension) {
    if (config && config.format && config.format.mimeType) return config.format.mimeType;
    const byFamily = family === 'audio' ? AUDIO_MIME_TYPE_BY_EXT : VIDEO_MIME_TYPE_BY_EXT;
    return byFamily[outputExtension] || `${family}/${outputExtension}`;
}

async function getPandoc() {
    if (!pandocPromise) {
        pandocPromise = fetch(`${self.location.origin}/vendor/pandoc/pandoc.wasm`)
            .then((response) => {
                if (!response.ok) throw new Error(`Failed to fetch pandoc.wasm: ${response.status}`);
                return response.arrayBuffer();
            })
            .then((binary) => createPandocInstance(binary));
    }
    return pandocPromise;
}

async function getPandocOutput(result, outputFileName, mimeType) {
    let outputBlob = result.files && result.files[outputFileName];
    if (!outputBlob || (outputBlob instanceof Blob && outputBlob.size === 0)) {
        if (result.stdout && result.stdout.length > 0) {
            outputBlob = new Blob([result.stdout], { type: mimeType || 'text/plain' });
        }
    }
    if (!outputBlob || (outputBlob instanceof Blob && outputBlob.size === 0)) {
        throw new Error('Pandoc returned empty output');
    }
    if (outputBlob instanceof Blob) return outputBlob;
    return new Blob([outputBlob], { type: mimeType || 'text/plain' });
}

async function getDocumentAst(pandoc, item, index) {
    const inputFormat = item.inputFormat;
    if (!inputFormat) throw new Error(`Missing input format for document ${index + 1}`);
    const inputExtension = item.inputExtension || getExtension(item.name) || 'txt';
    const inputFileName = `input-${index}.${inputExtension}`;
    const outputFileName = `output-${index}.json`;
    const result = await pandoc.convert({
        from: inputFormat,
        to: 'json',
        'output-file': outputFileName,
        'input-files': [inputFileName],
    }, null, {
        [inputFileName]: new Blob([await item.file.arrayBuffer()]),
    });
    const output = await getPandocOutput(result, outputFileName, 'application/json');
    return JSON.parse(await output.text());
}

async function mergeDocumentFiles(files, config, id) {
    if (!config || !config.format || !config.format.name || !config.format.extension) {
        throw new Error('Incomplete document merge config');
    }

    const pandoc = await getPandoc();
    const mergedAst = {
        'pandoc-api-version': null,
        meta: {},
        blocks: [],
    };

    for (let i = 0; i < files.length; i++) {
        emitProgress(id, 0.08 + (0.5 * ((i + 1) / files.length)), `Preparing ${i + 1} of ${files.length}`);
        const ast = await getDocumentAst(pandoc, files[i], i);
        if (!mergedAst['pandoc-api-version'] && ast['pandoc-api-version']) {
            mergedAst['pandoc-api-version'] = ast['pandoc-api-version'];
        }
        if (ast.meta && Object.keys(mergedAst.meta).length === 0) {
            mergedAst.meta = ast.meta;
        }
        if (Array.isArray(ast.blocks) && ast.blocks.length) {
            mergedAst.blocks.push(...ast.blocks);
        }
    }

    emitProgress(id, 0.72, 'Merging');
    const outputExtension = config.format.extension;
    const outputFileName = `merged.${outputExtension}`;
    const mergedInput = new Blob([JSON.stringify(mergedAst)], { type: 'application/json' });
    const result = await pandoc.convert({
        from: 'json',
        to: config.format.name,
        'output-file': outputFileName,
        'input-files': ['merged.json'],
    }, null, {
        'merged.json': mergedInput,
    });
    emitProgress(id, 0.95, 'Finalizing');
    const outputBlob = await getPandocOutput(result, outputFileName, config.format.mimeType);
    return {
        blob: outputBlob,
        outputName: buildMergedOutputName(files, outputExtension),
    };
}

async function getSevenZip() {
    if (!sevenZipPromise) {
        sevenZipPromise = import(
            /* webpackIgnore: true */ `${self.location.origin}/vendor/7z/7zz.es6.js`
        ).then((module) => {
            const SevenZipFactory = module.default || module;
            return SevenZipFactory({
                print: () => { },
                printErr: () => { },
                locateFile: (url) => {
                    if (url === '7zz.wasm') {
                        return `${self.location.origin}/vendor/7z/7zz.wasm`;
                    }
                    return url;
                },
            });
        });
    }
    return sevenZipPromise;
}

function sevenZipCallMain(module, args) {
    try {
        module.callMain(args);
    } catch (err) {
        if (typeof err === 'number') {
            throw new Error(`7z-wasm failed with code ${err}`);
        }
        if (!(err && err.name === 'ExitStatus' && err.status === 0)) {
            throw err;
        }
    }
}

function ensureSevenZipDir(fs, dirPath) {
    if (!dirPath || dirPath === '/') return;
    const parts = sanitizePath(dirPath).split('/').filter(Boolean);
    let current = '';
    parts.forEach((part) => {
        current += `/${part}`;
        try {
            fs.stat(current);
        } catch (e) {
            fs.mkdir(current);
        }
    });
}

function removeSevenZipPath(fs, targetPath) {
    let stat;
    try {
        stat = fs.stat(targetPath);
    } catch (e) {
        return;
    }
    if (fs.isDir(stat.mode)) {
        fs.readdir(targetPath)
            .filter((entry) => entry !== '.' && entry !== '..')
            .forEach((entry) => removeSevenZipPath(fs, `${targetPath}/${entry}`));
        fs.rmdir(targetPath);
    } else {
        fs.unlink(targetPath);
    }
}

async function blobToUint8Array(blob) {
    return new Uint8Array(await blob.arrayBuffer());
}

async function compressWithBrowserGzip(inputData) {
    if (typeof self.CompressionStream !== 'function') {
        throw new Error('This browser does not support native gzip compression. Please try a different browser or choose another archive output format.');
    }
    const stream = new Blob([inputData]).stream().pipeThrough(new self.CompressionStream('gzip'));
    return blobToUint8Array(await new Response(stream).blob());
}

async function compressSingleFileWithSevenZip(inputData, sourceName, outputExtension) {
    if (!SEVEN_ZIP_SUPPORTED_STREAM_CODECS.has(outputExtension)) {
        throw new Error(`Unsupported 7z stream compression format: ${outputExtension}`);
    }
    const sevenZip = await getSevenZip();
    const fs = sevenZip.FS;
    const root = `/stream-create-${createUniqueToken()}`;
    const sourcePath = `${root}/${sourceName}`;
    const outputPath = `${root}/${sourceName}.${outputExtension}`;
    const formatArgByExtension = {
        gz: '-tgzip',
        bz2: '-tbzip2',
        xz: '-txz',
    };
    ensureSevenZipDir(fs, root);
    const previousCwd = fs.cwd();
    try {
        fs.writeFile(sourcePath, inputData);
        fs.chdir(root);
        sevenZipCallMain(sevenZip, ['a', outputPath, formatArgByExtension[outputExtension], sourceName]);
        return new Uint8Array(fs.readFile(outputPath));
    } finally {
        try {
            fs.chdir(previousCwd);
        } catch (e) {
            // Best-effort cwd restore; cleanup still runs below.
        }
        removeSevenZipPath(fs, root);
    }
}

async function createWithSevenZip(entries, outputExtension, outputName) {
    if (!SEVEN_ZIP_SUPPORTED_OUTPUTS.has(outputExtension)) {
        throw new Error('Unsupported extension for 7z-wasm output');
    }
    const sevenZip = await getSevenZip();
    const fs = sevenZip.FS;
    const root = `/create-${createUniqueToken()}`;
    const sourceRoot = `${root}/src`;
    const outputPath = `${root}/${outputName}`;
    const formatArgByExtension = {
        '7z': '-t7z',
        zip: '-tzip',
        tar: '-ttar',
    };
    ensureSevenZipDir(fs, sourceRoot);
    const previousCwd = fs.cwd();
    try {
        entries.forEach((entry) => {
            const cleanPath = sanitizePath(entry.path);
            const fullPath = `${sourceRoot}/${cleanPath}`;
            const parts = cleanPath.split('/');
            parts.pop();
            if (parts.length) ensureSevenZipDir(fs, `${sourceRoot}/${parts.join('/')}`);
            fs.writeFile(fullPath, entry.data);
        });
        fs.chdir(sourceRoot);
        const formatArg = formatArgByExtension[outputExtension];
        const args = ['a', outputPath];
        if (formatArg) args.push(formatArg);
        args.push('.');
        sevenZipCallMain(sevenZip, args);
        const out = fs.readFile(outputPath);
        return new Uint8Array(out);
    } finally {
        try {
            fs.chdir(previousCwd);
        } catch (e) {
            // Best-effort cwd restore; cleanup still runs below.
        }
        removeSevenZipPath(fs, root);
    }
}

async function createWithIso9660(entries) {
    const writer = new ISOWriter({ volumeId: 'CONVERSIONTODAY' });
    entries.forEach((entry) => {
        writer.add(sanitizePath(entry.path), entry.data);
    });
    return writer.toUint8Array();
}

async function createArchive(entries, outputExtension, baseFileName) {
    const baseName = getBaseName(baseFileName);
    const outputName = `${baseName}.${outputExtension}`;

    if (COMPOUND_EXTENSION_CONFIG[outputExtension]) {
        const tarData = await createWithSevenZip(entries, 'tar', `${baseName}.tar`);
        return {
            data: COMPOUND_EXTENSION_CONFIG[outputExtension].streamExtension === 'gz'
                ? await compressWithBrowserGzip(tarData)
                : await compressSingleFileWithSevenZip(
                    tarData,
                    'archive.tar',
                    COMPOUND_EXTENSION_CONFIG[outputExtension].streamExtension
                ),
            outputName,
        };
    }

    if (outputExtension === 'iso') {
        return { data: await createWithIso9660(entries), outputName };
    }

    if (SEVEN_ZIP_SUPPORTED_OUTPUTS.has(outputExtension)) {
        return { data: await createWithSevenZip(entries, outputExtension, outputName), outputName };
    }

    throw new Error(`Unsupported output archive format: ${outputExtension}`);
}

async function mergeArchiveFiles(files, config, id) {
    if (!config || !config.format || !config.format.extension) {
        throw new Error('Incomplete archive merge config');
    }

    const entries = [];
    const usedPaths = new Set();
    for (let i = 0; i < files.length; i++) {
        emitProgress(id, 0.08 + (0.45 * ((i + 1) / files.length)), `Preparing ${i + 1} of ${files.length}`);
        entries.push({
            path: createUniqueEntryPath(files[i].name, usedPaths),
            data: new Uint8Array(await files[i].file.arrayBuffer()),
        });
    }

    emitProgress(id, 0.68, 'Merging');
    const outputExtension = normalizeExtension(config.format.extension);
    const created = await createArchive(entries, outputExtension, buildMergedOutputName(files, outputExtension));
    emitProgress(id, 0.95, 'Finalizing');
    return {
        blob: new Blob([created.data], {
            type: config.format.mimeType || ARCHIVE_MIME_TYPE_BY_EXT[outputExtension] || 'application/octet-stream',
        }),
        outputName: created.outputName,
    };
}

async function mergeMediaFiles(files, config, id, family) {
    if (!config || !config.format || !config.format.extension) {
        throw new Error(`Incomplete ${family} merge config`);
    }

    const { ff, fetchFile } = await loadFfmpeg();
    const outputExtension = normalizeExtension(config.format.extension);
    const unique = `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const listName = `concat-${unique}.txt`;
    const outputName = `merged-${unique}.${outputExtension}`;
    const inputNames = [];
    const concatLines = [];

    try {
        for (let i = 0; i < files.length; i++) {
            emitProgress(id, 0.05 + (0.3 * ((i + 1) / files.length)), `Preparing ${i + 1} of ${files.length}`);
            const extension = normalizeExtension(getExtension(files[i].name) || family);
            const inputName = `input-${unique}-${i}.${extension}`;
            inputNames.push(inputName);
            await ff.writeFile(inputName, await fetchFile(files[i].file));
            concatLines.push(`file '${inputName}'`);
        }

        await ff.writeFile(listName, new TextEncoder().encode(concatLines.join('\n')));
        emitProgress(id, 0.38, 'Merging');
        activeProgressRange = { id, start: 0.42, end: 0.92, message: 'Merging' };
        await ff.exec(['-f', 'concat', '-safe', '0', '-i', listName, '-y', outputName]);
        emitProgress(id, 0.95, 'Finalizing');
        const data = await ff.readFile(outputName);
        return {
            blob: new Blob([data.buffer], {
                type: resolveAudioVideoMimeType(family, config, outputExtension),
            }),
            outputName: buildMergedOutputName(files, outputExtension),
        };
    } finally {
        activeProgressRange = null;
        try { await ff.deleteFile(listName); } catch (e) { /* noop */ }
        try { await ff.deleteFile(outputName); } catch (e) { /* noop */ }
        for (const inputName of inputNames) {
            try { await ff.deleteFile(inputName); } catch (e) { /* noop */ }
        }
    }
}

async function handleMessage(data) {
    const { action, files, config, id } = data;

    if (action === 'load') {
        postMessage({ status: 'loaded' });
        return;
    }

    if (action !== 'merge') return;
    if (!config || !config.family) {
        throw new Error('Incomplete merge config');
    }
    if (!files || !files.length) {
        throw new Error('No files supplied for merge');
    }

    emitProgress(id, 0.02, 'Preparing');

    let result;
    if (config.family === 'archive') {
        result = await mergeArchiveFiles(files, config, id);
    } else if (config.family === 'audio' || config.family === 'video') {
        result = await mergeMediaFiles(files, config, id, config.family);
    } else if (config.family === 'document') {
        result = await mergeDocumentFiles(files, config, id);
    } else {
        throw new Error(`Unsupported merge family: ${config.family}`);
    }

    emitProgress(id, 1, 'Done');
    postMessage({
        status: 'processed',
        id,
        output: result.blob,
        outputName: result.outputName,
        config,
    });
}

onmessage = (e) => {
    processQueue = processQueue
        .then(() => handleMessage(e.data))
        .catch((err) => {
            console.error('Merge worker error:', err);
            activeProgressRange = null;
            postMessage({
                status: 'failed',
                id: e.data && e.data.id,
                message: err && err.message ? err.message : 'Merge failed',
            });
        });
};
