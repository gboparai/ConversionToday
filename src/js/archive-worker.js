import { ISOReader, ISOWriter } from '@gcu/iso9660';

const MIME_TYPE_BY_EXT = {
    zip: 'application/zip',
    '7z': 'application/x-7z-compressed',
    rar: 'application/vnd.rar',
    tar: 'application/x-tar',
    iso: 'application/x-iso9660-image',
};

const SEVEN_ZIP_SUPPORTED_INPUTS = new Set(['7z', 'zip', 'rar', 'tar']);
const SEVEN_ZIP_SUPPORTED_OUTPUTS = new Set(['7z', 'zip', 'tar']);

let processQueue = Promise.resolve();
let sevenZipPromise = null;

function emitProgress(id, fraction) {
    if (id === null || id === undefined) return;
    const safe = Math.max(0, Math.min(1, Number(fraction) || 0));
    postMessage({ status: 'progress', id, progress: Math.round(safe * 100) });
}

function getExtension(name) {
    const lower = String(name || '').toLowerCase();
    const parts = lower.split('.');
    return parts.length > 1 ? parts.pop() : '';
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
    return String(path || '').replace(/^\/+/, '');
}

function resolveMimeType(config, outputExtension) {
    return (config && config.format && config.format.mimeType) ||
        MIME_TYPE_BY_EXT[outputExtension] ||
        'application/octet-stream';
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

async function extractWithSevenZip(file) {
    const extension = getExtension(file.name);
    if (!SEVEN_ZIP_SUPPORTED_INPUTS.has(extension)) {
        throw new Error('Unsupported extension for 7z-wasm extraction');
    }
    const sevenZip = await getSevenZip();
    const fs = sevenZip.FS;
    const root = `/extract-${createUniqueToken()}`;
    const inputPath = `${root}/input.${extension}`;
    const outPath = `${root}/out`;
    ensureSevenZipDir(fs, root);
    ensureSevenZipDir(fs, outPath);
    try {
        fs.writeFile(inputPath, new Uint8Array(await file.arrayBuffer()));
        sevenZipCallMain(sevenZip, ['x', inputPath, `-o${outPath}`, '-y']);

        const entries = [];
        const walk = (dir, rel) => {
            fs.readdir(dir)
                .filter((name) => name !== '.' && name !== '..')
                .forEach((name) => {
                    const full = `${dir}/${name}`;
                    const stat = fs.stat(full);
                    if (fs.isDir(stat.mode)) {
                        walk(full, rel ? `${rel}/${name}` : name);
                    } else {
                        const relPath = sanitizePath(rel ? `${rel}/${name}` : name);
                        const data = fs.readFile(full);
                        entries.push({ path: relPath, data: new Uint8Array(data) });
                    }
                });
        };
        walk(outPath, '');
        if (!entries.length) throw new Error('No files extracted via 7z-wasm');
        return entries;
    } finally {
        removeSevenZipPath(fs, root);
    }
}

async function extractWithIso9660(file) {
    if (getExtension(file.name) !== 'iso') {
        throw new Error('Unsupported extension for ISO reader');
    }
    const buffer = await file.arrayBuffer();
    const reader = new ISOReader(buffer);
    const paths = reader.list();
    if (!paths || !paths.length) throw new Error('No files found in ISO');
    return paths.map((path) => {
        const clean = sanitizePath(path);
        const data = reader.read(path);
        return { path: clean, data: new Uint8Array(data) };
    });
}

async function extractEntries(file, preferredInputExtension) {
    const detectedInputExtension = getExtension(file.name);
    const preferred = normalizeExtension(preferredInputExtension);
    const inputExtension = preferred || detectedInputExtension;

    if (inputExtension === 'iso') {
        return extractWithIso9660(file);
    }

    if (SEVEN_ZIP_SUPPORTED_INPUTS.has(inputExtension)) {
        return extractWithSevenZip(file);
    }

    throw new Error(`Unsupported input archive format: ${inputExtension || 'unknown'}`);
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

async function createArchive(entries, outputExtension, originalName) {
    const baseName = String(originalName || 'output').replace(/\.[^.]+$/, '') || 'output';
    const outputName = `${baseName}.${outputExtension}`;

    if (outputExtension === 'iso') {
        return { data: await createWithIso9660(entries), outputName };
    }

    if (SEVEN_ZIP_SUPPORTED_OUTPUTS.has(outputExtension)) {
        return { data: await createWithSevenZip(entries, outputExtension, outputName), outputName };
    }

    throw new Error(`Unsupported output archive format: ${outputExtension}`);
}

async function handleMessage(data) {
    const { action, file, config, id } = data;

    if (action === 'load') {
        postMessage({ status: 'loaded' });
        return;
    }

    if (action === 'process') {
        try {
            if (!config || !config.format || !config.format.extension) {
                throw new Error('Incomplete archive conversion config');
            }
            emitProgress(id, 0.05);
            const preferredInputExtension =
                normalizeExtension(config && config.inputFormat && config.inputFormat.extension) ||
                normalizeExtension(config && config.inputFormat && config.inputFormat.name);
            const entries = await extractEntries(file, preferredInputExtension);
            emitProgress(id, 0.55);

            const outputExtension = config.format.extension;
            const created = await createArchive(entries, outputExtension, file.name);
            emitProgress(id, 0.95);

            const outputBlob = new Blob([created.data], {
                type: resolveMimeType(config, outputExtension),
            });
            if (!outputBlob || outputBlob.size <= 0) {
                throw new Error('Archive conversion produced empty output');
            }
            emitProgress(id, 1);

            postMessage({
                status: 'processed',
                output: outputBlob,
                config,
                id,
                outputName: created.outputName,
            });
        } catch (err) {
            console.error('Archive worker error:', err);
            postMessage({ status: 'failed', id });
        }
    }
}

onmessage = (e) => {
    processQueue = processQueue
        .then(() => handleMessage(e.data))
        .catch((err) => {
            console.error('Archive worker queue error:', err);
        });
};
