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

    return new Blob([target.buffer], { type: `video/${outputExtension}` });
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
                throw new Error(`Unsupported video output format for mediabunny: ${outputExtension}`);
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
            console.error('Video worker error:', err);
            postMessage({ status: 'failed', id });
        }
    }
};
