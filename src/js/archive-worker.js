import { ISOReader, ISOWriter } from '@gcu/iso9660';
import pako from 'pako';

const MIME_TYPE_BY_EXT = {
    zip: 'application/zip',
    '7z': 'application/x-7z-compressed',
    rar: 'application/vnd.rar',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    bz2: 'application/x-bzip2',
    xz: 'application/x-xz',
    iso: 'application/x-iso9660-image',
    cpio: 'application/x-cpio',
    ar: 'application/x-archive',
};

const SEVEN_ZIP_SUPPORTED_INPUTS = new Set(['7z', 'zip', 'rar', 'tar', 'gz', 'bz2', 'xz']);
const SEVEN_ZIP_SUPPORTED_OUTPUTS = new Set(['7z', 'zip', 'tar', 'gz', 'bz2', 'xz']);
const PAKO_SUPPORTED_EXTS = new Set(['gz']);
const COMPOUND_EXTENSION_MAP = {
    'tar.gz': 'gz',
    'tar.bz2': 'bz2',
    'tar.xz': 'xz',
};

let processQueue = Promise.resolve();
let archiveInit = false;
let sevenZipPromise = null;
let archiveModulePromise = null;

function emitProgress(id, fraction) {
    if (id === null || id === undefined) return;
    const safe = Math.max(0, Math.min(1, Number(fraction) || 0));
    postMessage({ status: 'progress', id, progress: Math.round(safe * 100) });
}

function getExtension(name) {
    const lower = String(name || '').toLowerCase();
    const compound = Object.keys(COMPOUND_EXTENSION_MAP).find((ext) => lower.endsWith(`.${ext}`));
    if (compound) return COMPOUND_EXTENSION_MAP[compound];
    const parts = lower.split('.');
    return parts.length > 1 ? parts.pop() : '';
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

async function getArchiveModule() {
    if (!archiveModulePromise) {
        archiveModulePromise = import(
            /* webpackIgnore: true */ `${self.location.origin}/vendor/libarchive/libarchive.js`
        );
    }
    return archiveModulePromise;
}

async function ensureArchiveInitialized() {
    if (archiveInit) return;
    const archiveModule = await getArchiveModule();
    const Archive = archiveModule.Archive;
    Archive.init({
        workerUrl: `${self.location.origin}/vendor/libarchive/worker-bundle.js`,
    });
    archiveInit = true;
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

async function extractWithLibarchive(file) {
    await ensureArchiveInitialized();
    const archiveModule = await getArchiveModule();
    const Archive = archiveModule.Archive;
    const archive = await Archive.open(file);
    try {
        const files = await archive.getFilesArray();
        const output = [];
        for (const entry of files) {
            if (!entry || !entry.file || typeof entry.file.extract !== 'function') continue;
            const extracted = await entry.file.extract();
            const path = sanitizePath(`${entry.path || ''}${extracted.name || 'file.bin'}`);
            output.push({
                path,
                data: new Uint8Array(await extracted.arrayBuffer()),
            });
        }
        if (!output.length) throw new Error('No files extracted via libarchive');
        return output;
    } finally {
        await archive.close();
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

async function extractWithPako(file) {
    const extension = getExtension(file.name);
    if (!PAKO_SUPPORTED_EXTS.has(extension)) {
        throw new Error('Unsupported extension for pako extraction');
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const inflated = pako.inflate(bytes);
    const strippedName = file.name.replace(/\.gz$/i, '');
    const baseName = strippedName || 'archive-content.bin';
    return [{ path: sanitizePath(baseName), data: new Uint8Array(inflated) }];
}

async function extractEntries(file) {
    const extractors = [
        { name: 'libarchive.js', fn: extractWithLibarchive },
        { name: '7z-wasm', fn: extractWithSevenZip },
        { name: '@gcu/iso9660', fn: extractWithIso9660 },
        { name: 'pako', fn: extractWithPako },
    ];
    let lastError = null;
    for (const extract of extractors) {
        try {
            return await extract.fn(file);
        } catch (err) {
            console.warn(`Archive extract fallback failed in ${extract.name}:`, err);
            lastError = err;
        }
    }
    throw lastError || new Error('Unable to extract input archive');
}

function libarchiveOutputOptions(outputExtension, archiveModule) {
    const ArchiveFormat = archiveModule.ArchiveFormat;
    const ArchiveCompression = archiveModule.ArchiveCompression;
    if (outputExtension === 'zip') {
        return { format: ArchiveFormat.ZIP, compression: ArchiveCompression.NONE };
    }
    if (outputExtension === '7z') {
        return { format: ArchiveFormat.SEVEN_ZIP, compression: ArchiveCompression.NONE };
    }
    if (outputExtension === 'tar') {
        return { format: ArchiveFormat.GNUTAR, compression: ArchiveCompression.NONE };
    }
    if (outputExtension === 'cpio') {
        return { format: ArchiveFormat.CPIO, compression: ArchiveCompression.NONE };
    }
    if (outputExtension === 'iso') {
        return { format: ArchiveFormat.ISO9660, compression: ArchiveCompression.NONE };
    }
    if (outputExtension === 'ar') {
        return { format: ArchiveFormat.AR, compression: ArchiveCompression.NONE };
    }
    if (outputExtension === 'gz') {
        return { format: ArchiveFormat.GNUTAR, compression: ArchiveCompression.GZIP };
    }
    if (outputExtension === 'bz2') {
        return { format: ArchiveFormat.GNUTAR, compression: ArchiveCompression.BZIP2 };
    }
    if (outputExtension === 'xz') {
        return { format: ArchiveFormat.GNUTAR, compression: ArchiveCompression.XZ };
    }
    return null;
}

async function createWithLibarchive(entries, outputExtension, outputName) {
    const archiveModule = await getArchiveModule();
    await ensureArchiveInitialized();
    const Archive = archiveModule.Archive;
    const options = libarchiveOutputOptions(outputExtension, archiveModule);
    if (!options) throw new Error('Unsupported extension for libarchive output');
    const files = entries.map((entry) => {
        return {
            file: new File([entry.data], entry.path.split('/').pop() || 'file.bin', {
                type: 'application/octet-stream',
            }),
            pathname: sanitizePath(entry.path),
        };
    });
    const created = await Archive.write({
        files,
        outputFileName: outputName,
        compression: options.compression,
        format: options.format,
        passphrase: null,
    });
    return new Uint8Array(await created.arrayBuffer());
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
    ensureSevenZipDir(fs, sourceRoot);
    try {
        const sourcePaths = [];
        entries.forEach((entry) => {
            const cleanPath = sanitizePath(entry.path);
            const fullPath = `${sourceRoot}/${cleanPath}`;
            const parts = cleanPath.split('/');
            parts.pop();
            if (parts.length) ensureSevenZipDir(fs, `${sourceRoot}/${parts.join('/')}`);
            fs.writeFile(fullPath, entry.data);
            sourcePaths.push(fullPath);
        });
        sevenZipCallMain(sevenZip, ['a', outputPath].concat(sourcePaths));
        const out = fs.readFile(outputPath);
        return new Uint8Array(out);
    } finally {
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

async function createWithPako(entries, outputName) {
    if (entries.length !== 1) {
        throw new Error('GZIP output via pako only supports a single file');
    }
    const gzData = pako.gzip(entries[0].data);
    const typed = new Uint8Array(gzData);
    return {
        data: typed,
        outputName: outputName.endsWith('.gz') ? outputName : `${outputName}.gz`,
    };
}

async function createArchive(entries, outputExtension, originalName) {
    const baseName = String(originalName || 'output').replace(/\.[^.]+$/, '') || 'output';
    const outputName = `${baseName}.${outputExtension}`;

    const writers = [
        { name: 'libarchive.js', fn: async () => ({ data: await createWithLibarchive(entries, outputExtension, outputName), outputName }) },
        { name: '7z-wasm', fn: async () => ({ data: await createWithSevenZip(entries, outputExtension, outputName), outputName }) },
        { name: '@gcu/iso9660', fn: async () => ({ data: await createWithIso9660(entries), outputName }) },
        { name: 'pako', fn: async () => createWithPako(entries, outputName) },
    ];

    let lastError = null;
    for (const write of writers) {
        try {
            return await write.fn();
        } catch (err) {
            console.warn(`Archive create fallback failed in ${write.name}:`, err);
            lastError = err;
        }
    }
    throw lastError || new Error('Unable to create output archive');
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
            const entries = await extractEntries(file);
            emitProgress(id, 0.55);

            const outputExtension = config.format.extension;
            const created = await createArchive(entries, outputExtension, file.name);
            emitProgress(id, 0.95);

            const outputBlob = new Blob([created.data], {
                type: resolveMimeType(config, outputExtension),
            });
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
