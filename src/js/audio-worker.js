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
            if (!supportsMediabunny()) {
                throw new Error('Mediabunny requires WebCodecs support in this browser');
            }

            const formatFactory = MEDIABUNNY_OUTPUT_FORMATS[outputExtension];
            if (!formatFactory) {
                throw new Error(`Unsupported audio output format for mediabunny: ${outputExtension}`);
            }

            emitProgress(id, 0.1);
            const blob = await convertWithMediabunny(file, outputExtension);
            emitProgress(id, 0.95);

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
