import { createPandocInstance } from 'pandoc-wasm/src/core.js';

let pandocPromise = null;
let processQueue = Promise.resolve();

function getPandoc() {
    if (!pandocPromise) {
        pandocPromise = fetch(`${self.location.origin}/vendor/pandoc/pandoc.wasm`)
            .then(r => {
                if (!r.ok) throw new Error(`Failed to fetch pandoc.wasm: ${r.status}`);
                return r.arrayBuffer();
            })
            .then(binary => createPandocInstance(binary));
    }
    return pandocPromise;
}

function emitProgress(id, fraction) {
    if (id === null || id === undefined) return;
    const safe = Math.max(0, Math.min(1, Number(fraction) || 0));
    postMessage({ status: 'progress', id, progress: Math.round(safe * 100) });
}

async function handleMessage(data) {
    const { action, file, config, id } = data;

    if (action === 'load') {
        // Pre-warm the pandoc instance
        try {
            await getPandoc();
            postMessage({ status: 'loaded' });
        } catch (err) {
            console.error('Doc worker: failed to load pandoc:', err);
            postMessage({ status: 'loaded' }); // still signal loaded so UI isn't stuck
        }
        return;
    }

    if (action === 'process') {
        const outputFormat = config.format.name;
        const inputFormat = config.inputFormat.name;
        const outputExt = config.format.extension;
        const inputExt = config.inputFormat.extension;

        try {
            emitProgress(id, 0.05);
            const pandoc = await getPandoc();
            emitProgress(id, 0.2);

            const buffer = await file.arrayBuffer();
            const inputBlob = new Blob([buffer]);
            const inputFileName = `input.${inputExt}`;
            const outputFileName = `output.${outputExt}`;

            const options = {
                from: inputFormat,
                to: outputFormat,
                'output-file': outputFileName,
                'input-files': [inputFileName],
            };

            emitProgress(id, 0.35);

            const result = await pandoc.convert(options, null, { [inputFileName]: inputBlob });

            emitProgress(id, 0.95);

            let outputBlob = result.files[outputFileName];
            if (!outputBlob || (outputBlob instanceof Blob && outputBlob.size === 0)) {
                // Fall back to stdout text
                if (result.stdout && result.stdout.length > 0) {
                    outputBlob = new Blob(
                        [result.stdout],
                        { type: config.format.mimeType || 'text/plain' }
                    );
                }
            }

            if (!outputBlob || (outputBlob instanceof Blob && outputBlob.size === 0)) {
                throw new Error('Pandoc returned empty output');
            }

            emitProgress(id, 1);

            postMessage({
                status: 'processed',
                output: outputBlob,
                config,
                id,
            });
        } catch (err) {
            console.error('Doc worker error:', err);
            postMessage({ status: 'failed', id });
        }
    }
}

onmessage = (e) => {
    processQueue = processQueue
        .then(() => handleMessage(e.data))
        .catch(err => console.error('Doc worker queue error:', err));
};
