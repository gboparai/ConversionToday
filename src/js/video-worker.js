import {
    Input,
    Output,
    Conversion,
    ALL_FORMATS,
    BlobSource,
    BufferTarget,
    Mp4OutputFormat,
    MovOutputFormat,
    WebMOutputFormat,
    MkvOutputFormat,
} from 'mediabunny';

// Map format names to mediabunny OutputFormat constructors
const MEDIABUNNY_OUTPUT_FORMATS = {
    mp4: () => new Mp4OutputFormat(),
    mov: () => new MovOutputFormat(),
    webm: () => new WebMOutputFormat(),
    mkv: () => new MkvOutputFormat(),
};

const FFMPEG_OUTPUT_EXTS = new Set([
    'mp4', 'webm', 'mkv', 'mov', 'avi', 'wmv', 'flv', '3gp', 'mpeg'
]);

const MIME_TYPE_BY_EXT = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    '3gp': 'video/3gpp',
    mpeg: 'video/mpeg',
};

let ffmpegInstance = null;
let ffmpegScriptLoaded = false;
let activeFfmpegTaskId = null;
let processQueue = Promise.resolve();

function supportsMediabunny() {
    return (
        typeof VideoEncoder !== 'undefined' &&
        typeof VideoDecoder !== 'undefined' &&
        typeof AudioEncoder !== 'undefined' &&
        typeof AudioDecoder !== 'undefined'
    );
}

function emitProgress(id, fraction) {
    if (id === null || id === undefined) return;
    const safe = Math.max(0, Math.min(1, Number(fraction) || 0));
    postMessage({
        status: 'progress',
        id,
        progress: Math.round(safe * 100),
    });
}

async function fetchFileData(file) {
    if (file instanceof Uint8Array) return file;
    if (file instanceof ArrayBuffer) return new Uint8Array(file);
    if (file && typeof file.arrayBuffer === 'function') {
        return new Uint8Array(await file.arrayBuffer());
    }
    return new Uint8Array();
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

    ff.on('progress', ({ progress }) => {
        if (activeFfmpegTaskId !== null && activeFfmpegTaskId !== undefined) {
            emitProgress(activeFfmpegTaskId, progress);
        }
    });

    ffmpegInstance = { ff, fetchFile: fetchFileData };
    return ffmpegInstance;
}

function resolveVideoMimeType(config, outputExtension) {
    return (config && config.format && config.format.mimeType) ||
        MIME_TYPE_BY_EXT[outputExtension] ||
        `video/${outputExtension}`;
}

async function convertWithFfmpeg(file, outputExtension, id, config) {
    if (!FFMPEG_OUTPUT_EXTS.has(outputExtension)) {
        throw new Error(`Unsupported video output format for ffmpeg: ${outputExtension}`);
    }

    const { ff, fetchFile } = await loadFfmpeg();
    activeFfmpegTaskId = id;
    emitProgress(id, 0.05);

    const inputExt = (file.name.split('.').pop() || 'bin').toLowerCase();
    const unique = `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const inputName = `input-${unique}.${inputExt}`;
    const outputName = `output-${unique}.${outputExtension}`;

    try {
        await ff.writeFile(inputName, await fetchFile(file));
        await ff.exec(['-i', inputName, '-y', outputName]);
        emitProgress(id, 0.95);

        const data = await ff.readFile(outputName);
        return new Blob([data.buffer], { type: resolveVideoMimeType(config, outputExtension) });
    } finally {
        try { await ff.deleteFile(inputName); } catch (e) { /* noop */ }
        try { await ff.deleteFile(outputName); } catch (e) { /* noop */ }
    }
}

// --- mediabunny conversion ---
async function convertWithMediabunny(file, outputExtension, config) {
    const formatFactory = MEDIABUNNY_OUTPUT_FORMATS[outputExtension];
    if (!formatFactory) throw new Error(`Unsupported mediabunny output format: ${outputExtension}`);

    const input = new Input({
        source: new BlobSource(file),
        formats: ALL_FORMATS,
    });

    const target = new BufferTarget();
    const output = new Output({
        format: formatFactory(),
        target,
    });

    const conversion = await Conversion.init({ input, output });
    await conversion.execute();

    return new Blob([target.buffer], { type: resolveVideoMimeType(config, outputExtension) });
}

// --- message handler ---
async function handleMessage(data) {
    const { action, file, config, id } = data;

    if (action === 'load') {
        postMessage({ status: 'loaded' });
        return;
    }

    if (action === 'process') {
        const outputExtension = config.format.extension;

        try {
            let blob;
            const canUseMediabunny =
                supportsMediabunny() &&
                MEDIABUNNY_OUTPUT_FORMATS[outputExtension];

            if (canUseMediabunny) {
                emitProgress(id, 0.1);
                try {
                    blob = await convertWithMediabunny(file, outputExtension, config);
                    emitProgress(id, 0.95);
                } catch (mediabunnyErr) {
                    console.warn('Video mediabunny conversion failed, using ffmpeg fallback:', mediabunnyErr);
                    blob = await convertWithFfmpeg(file, outputExtension, id, config);
                }
            } else {
                blob = await convertWithFfmpeg(file, outputExtension, id, config);
            }

            emitProgress(id, 1);

            postMessage({
                status: 'processed',
                output: blob,
                config,
                id,
            });
        } catch (err) {
            console.error('Video worker error:', err);
            postMessage({ status: 'failed', id });
        } finally {
            activeFfmpegTaskId = null;
        }
    }
}

onmessage = (e) => {
    processQueue = processQueue
        .then(() => handleMessage(e.data))
        .catch((err) => {
            console.error('Video worker queue error:', err);
        });
};
