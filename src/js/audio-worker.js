import {
    Input,
    Output,
    Conversion,
    ALL_FORMATS,
    BlobSource,
    BufferTarget,
    Mp3OutputFormat,
    WavOutputFormat,
    OggOutputFormat,
    FlacOutputFormat,
    AdtsOutputFormat,
    WebMOutputFormat,
    Mp4OutputFormat,
} from 'mediabunny';

// Map format names to mediabunny OutputFormat constructors
const MEDIABUNNY_OUTPUT_FORMATS = {
    mp3: () => new Mp3OutputFormat(),
    wav: () => new WavOutputFormat(),
    ogg: () => new OggOutputFormat(),
    flac: () => new FlacOutputFormat(),
    aac: () => new AdtsOutputFormat(),
    webm: () => new WebMOutputFormat(),
    m4a: () => new Mp4OutputFormat(),
};

const FFMPEG_OUTPUT_EXTS = new Set([
    'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'webm', 'wma', 'opus'
]);

let ffmpegInstance = null;
let ffmpegScriptLoaded = false;
let activeFfmpegTaskId = null;

function supportsMediabunny() {
    return (
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

async function convertWithFfmpeg(file, outputExtension, id) {
    if (!FFMPEG_OUTPUT_EXTS.has(outputExtension)) {
        throw new Error(`Unsupported audio output format for ffmpeg: ${outputExtension}`);
    }

    const { ff, fetchFile } = await loadFfmpeg();
    activeFfmpegTaskId = id;
    emitProgress(id, 0.05);

    const inputName = `input.${(file.name.split('.').pop() || 'bin').toLowerCase()}`;
    const outputName = `output.${outputExtension}`;

    await ff.writeFile(inputName, await fetchFile(file));
    await ff.exec(['-i', inputName, '-y', outputName]);
    emitProgress(id, 0.95);

    const data = await ff.readFile(outputName);
    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    const mimeTypeByExt = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        flac: 'audio/flac',
        aac: 'audio/aac',
        m4a: 'audio/mp4',
        webm: 'audio/webm',
        wma: 'audio/x-ms-wma',
        opus: 'audio/ogg; codecs=opus',
    };

    return new Blob([data.buffer], { type: mimeTypeByExt[outputExtension] || `audio/${outputExtension}` });
}

// --- mediabunny conversion ---
async function convertWithMediabunny(file, outputExtension) {
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

    return new Blob([target.buffer], { type: `audio/${outputExtension}` });
}

// --- message handler ---
onmessage = async (e) => {
    const { action, file, config, id } = e.data;

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
                    blob = await convertWithMediabunny(file, outputExtension);
                    emitProgress(id, 0.95);
                } catch (mediabunnyErr) {
                    console.warn('Audio mediabunny conversion failed, using ffmpeg fallback:', mediabunnyErr);
                    blob = await convertWithFfmpeg(file, outputExtension, id);
                }
            } else {
                blob = await convertWithFfmpeg(file, outputExtension, id);
            }

            emitProgress(id, 1);

            postMessage({
                status: 'processed',
                output: blob,
                config,
                id,
            });
        } catch (err) {
            console.error('Audio worker error:', err);
            postMessage({ status: 'failed', id });
        }
    }
};
