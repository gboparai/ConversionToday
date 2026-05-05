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
    MkvOutputFormat,
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
    mkv: () => new MkvOutputFormat(),
    m4a: () => new Mp4OutputFormat(),
    mp4: () => new Mp4OutputFormat(),
};

// Formats mediabunny can read (needs WebCodecs AudioDecoder)
const MEDIABUNNY_INPUT_EXTS = new Set([
    'mp3', 'wav', 'ogg', 'flac', 'aac', 'webm', 'mkv', 'm4a', 'mp4', 'ts', 'm3u8',
]);

function supportsMediabunny() {
    return (
        typeof AudioEncoder !== 'undefined' &&
        typeof AudioDecoder !== 'undefined'
    );
}

// --- ffmpeg.wasm fallback ---
let ffmpegInstance = null;

async function loadFfmpeg() {
    if (ffmpegInstance) return ffmpegInstance;

    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

    const ff = new FFmpeg();
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';

    await ff.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = { ff, fetchFile };
    return ffmpegInstance;
}

async function convertWithFfmpeg(file, outputExtension) {
    const { ff, fetchFile } = await loadFfmpeg();

    const inputName = `input.${file.name.split('.').pop() || 'bin'}`;
    const outputName = `output.${outputExtension}`;

    await ff.writeFile(inputName, await fetchFile(file));
    await ff.exec(['-i', inputName, '-y', outputName]);

    const data = await ff.readFile(outputName);

    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    return new Blob([data.buffer], { type: `audio/${outputExtension}` });
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
        const inputExtension = (file.name.split('.').pop() || '').toLowerCase();

        try {
            let blob;
            const canUseMediabunny =
                supportsMediabunny() &&
                MEDIABUNNY_INPUT_EXTS.has(inputExtension) &&
                MEDIABUNNY_OUTPUT_FORMATS[outputExtension];

            if (canUseMediabunny) {
                blob = await convertWithMediabunny(file, outputExtension);
            } else {
                blob = await convertWithFfmpeg(file, outputExtension);
            }

            postMessage({
                status: 'processed',
                output: blob,
                config,
                id,
            });
        } catch (err) {
            console.error('Audio worker error:', err);
            // Try ffmpeg fallback if mediabunny failed
            try {
                const blob = await convertWithFfmpeg(file, outputExtension);
                postMessage({
                    status: 'processed',
                    output: blob,
                    config,
                    id,
                });
            } catch (fallbackErr) {
                console.error('Audio worker fallback error:', fallbackErr);
                postMessage({ status: 'failed', id });
            }
        }
    }
};
