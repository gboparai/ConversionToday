import { createFont, woff2 } from 'fonteditor-core';
import opentype from 'opentype.js';

let processQueue = Promise.resolve();
let fonteditorWoff2Ready = false;

const FONTEDITOR_SUPPORTED_INPUTS = new Set(['ttf', 'otf', 'woff', 'woff2', 'eot', 'svg']);
const FONTEDITOR_SUPPORTED_OUTPUTS = new Set(['ttf', 'woff', 'woff2', 'eot', 'svg']);
const OPENTYPE_SUPPORTED_INPUTS = new Set(['ttf', 'otf', 'woff']);
const OPENTYPE_SUPPORTED_OUTPUTS = new Set(['otf', 'ttf']);
const FONT_MIME_TYPE_BY_EXT = {
    ttf: 'font/ttf',
    otf: 'font/otf',
    woff: 'font/woff',
    woff2: 'font/woff2',
    eot: 'application/vnd.ms-fontobject',
    svg: 'image/svg+xml',
};

function emitProgress(id, fraction) {
    if (id === null || id === undefined) return;
    const safe = Math.max(0, Math.min(1, Number(fraction) || 0));
    postMessage({ status: 'progress', id, progress: Math.round(safe * 100) });
}

function normalizeExtension(ext) {
    return String(ext || '').toLowerCase().replace(/^\./, '');
}

function getExtension(name) {
    const parts = String(name || '').toLowerCase().split('.');
    return parts.length > 1 ? parts.pop() : '';
}

function resolveMimeType(config, outputExtension) {
    return (config && config.format && config.format.mimeType)
        || FONT_MIME_TYPE_BY_EXT[outputExtension]
        || 'application/octet-stream';
}

function toArrayBuffer(data) {
    if (data instanceof ArrayBuffer) return data;
    if (ArrayBuffer.isView(data)) {
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    }
    if (typeof data === 'string') {
        return new TextEncoder().encode(data).buffer;
    }
    return new Uint8Array(data || []).buffer;
}

function getWoff2WasmUrl() {
    const publicPath = (typeof self.__webpack_public_path__ === 'string' && self.__webpack_public_path__) || '/';
    const normalizedPublicPath = publicPath.endsWith('/') ? publicPath : `${publicPath}/`;
    return new URL(`${normalizedPublicPath}vendor/fonteditor/woff2.wasm`, self.location.origin).toString();
}

async function fetchVerifiedWasm(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Unable to fetch woff2 wasm (${response.status}) from ${url}`);
    }
    const buffer = await response.arrayBuffer();
    const magic = new Uint8Array(buffer.slice(0, 4));
    const isWasm = magic.length === 4
        && magic[0] === 0x00
        && magic[1] === 0x61
        && magic[2] === 0x73
        && magic[3] === 0x6d;
    if (!isWasm) {
        throw new Error(`woff2 wasm fetch returned non-wasm content at ${url}`);
    }
    return buffer;
}

async function ensureWoff2Ready(inputExtension, outputExtension) {
    const needsWoff2 = inputExtension === 'woff2' || outputExtension === 'woff2';
    if (!needsWoff2 || fonteditorWoff2Ready) return;

    const wasmUrl = getWoff2WasmUrl();
    const wasmBinary = await fetchVerifiedWasm(wasmUrl);

    // fonteditor-core checks for `window` to detect browser mode; in Web Workers
    // `window` is undefined, so we provide an alias to avoid node-style loading.
    const hadWindow = typeof self.window !== 'undefined';
    if (!hadWindow) {
        self.window = self;
    }
    let wasmBlobUrl = null;
    try {
        // Use a blob URL so fonteditor-core stays in browser mode without
        // re-fetching the original network URL.
        wasmBlobUrl = URL.createObjectURL(new Blob([wasmBinary], { type: 'application/wasm' }));
        await woff2.init(wasmBlobUrl);
    } finally {
        if (wasmBlobUrl) {
            URL.revokeObjectURL(wasmBlobUrl);
        }
        if (!hadWindow) {
            delete self.window;
        }
    }
    fonteditorWoff2Ready = true;
}

async function convertWithFonteditor(file, config, id, inputExtension, outputExtension) {
    const canHandle =
        FONTEDITOR_SUPPORTED_INPUTS.has(inputExtension) &&
        FONTEDITOR_SUPPORTED_OUTPUTS.has(outputExtension);
    if (!canHandle) {
        throw new Error(`fonteditor-core does not support ${inputExtension} -> ${outputExtension}`);
    }

    await ensureWoff2Ready(inputExtension, outputExtension);
    emitProgress(id, 0.2);

    const sourceBuffer = await file.arrayBuffer();
    const readInput = inputExtension === 'svg'
        ? new TextDecoder().decode(new Uint8Array(sourceBuffer))
        : sourceBuffer;

    const font = createFont(readInput, { type: inputExtension });
    emitProgress(id, 0.75);

    const written = font.write({ type: outputExtension });
    const outputBuffer = toArrayBuffer(written);
    return new Blob([outputBuffer], { type: resolveMimeType(config, outputExtension) });
}

async function convertWithOpenType(file, config, id, inputExtension, outputExtension) {
    const canHandle =
        OPENTYPE_SUPPORTED_INPUTS.has(inputExtension) &&
        OPENTYPE_SUPPORTED_OUTPUTS.has(outputExtension);
    if (!canHandle) {
        throw new Error(`OpenType.js does not support ${inputExtension} -> ${outputExtension}`);
    }

    emitProgress(id, 0.2);
    const sourceBuffer = toArrayBuffer(await file.arrayBuffer());
    const font = opentype.parse(sourceBuffer);
    emitProgress(id, 0.75);

    const outputBuffer = toArrayBuffer(font.toArrayBuffer());
    return new Blob([outputBuffer], { type: resolveMimeType(config, outputExtension) });
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
                throw new Error('Incomplete font conversion config');
            }
            const inputExtension = normalizeExtension(
                (config.inputFormat && config.inputFormat.extension)
                || (config.inputFormat && config.inputFormat.name)
                || getExtension(file && file.name)
            );
            const outputExtension = normalizeExtension(config.format.extension || config.format.name);
            if (!inputExtension || !outputExtension) {
                throw new Error('Unable to determine input/output font formats');
            }

            emitProgress(id, 0.05);
            let outputBlob;
            if (inputExtension === 'otf' || outputExtension === 'otf') {
                try {
                    outputBlob = await convertWithOpenType(file, config, id, inputExtension, outputExtension);
                } catch (openTypeErr) {
                    console.warn(
                        `OpenType.js conversion failed for ${inputExtension} -> ${outputExtension}, trying next engine:`,
                        openTypeErr
                    );
                }
            }

            if (!outputBlob) {
                try {
                    outputBlob = await convertWithFonteditor(file, config, id, inputExtension, outputExtension);
                } catch (fonteditorErr) {
                    const pairSupportedByFonteditor =
                        FONTEDITOR_SUPPORTED_INPUTS.has(inputExtension)
                        && FONTEDITOR_SUPPORTED_OUTPUTS.has(outputExtension);
                    if (!pairSupportedByFonteditor) {
                        throw new Error(
                            `Unsupported font conversion ${inputExtension} -> ${outputExtension}. ` +
                            `OpenType.js and fonteditor-core do not support this pair.`
                        );
                    }
                    const details = fonteditorErr && fonteditorErr.message
                        ? fonteditorErr.message
                        : String(fonteditorErr);
                    throw new Error(`Font conversion failed for ${inputExtension} -> ${outputExtension}: ${details}`);
                }
            }

            if (!outputBlob || outputBlob.size <= 0) {
                throw new Error('Font conversion produced empty output');
            }
            emitProgress(id, 1);
            postMessage({
                status: 'processed',
                output: outputBlob,
                config,
                id,
            });
        } catch (err) {
            console.error('Font worker error:', err);
            postMessage({ status: 'failed', id });
        }
    }
}

onmessage = (e) => {
    processQueue = processQueue
        .then(() => handleMessage(e.data))
        .catch((err) => {
            console.error('Font worker queue error:', err);
        });
};
