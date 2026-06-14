let ffmpegInstance = null;
let ffmpegScriptLoaded = false;
let processQueue = Promise.resolve();

function emitProgress(fraction) {
    const safe = Math.max(0, Math.min(1, Number(fraction) || 0));
    postMessage({
        status: 'progress',
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
        // ffmpeg.wasm progress goes from 0 to 1 based on the internal ffmpeg process
        // For trimming, the duration might not be correctly picked up by ffmpeg's progress estimator
        // but we emit it anyway.
        emitProgress(progress);
    });

    ffmpegInstance = { ff, fetchFile: fetchFileData };
    return ffmpegInstance;
}

function resolveMimeType(mediaType, ext) {
    // Basic mapping
    const map = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mkv': 'video/x-matroska',
        'mov': 'video/quicktime',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'flac': 'audio/flac',
        'aac': 'audio/aac',
        'ogg': 'audio/ogg'
    };
    return map[ext] || `${mediaType}/${ext}`;
}

async function handleMessage(data) {
    const { action, file, format, mediaType, start, end } = data;

    if (action === 'trim') {
        try {
            emitProgress(0.01);
            const { ff, fetchFile } = await loadFfmpeg();
            emitProgress(0.05);

            const ext = (file.name.split('.').pop() || format || 'bin').toLowerCase();
            const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const inputName = `input-${unique}.${ext}`;
            const outputName = `output-${unique}.${ext}`;

            await ff.writeFile(inputName, await fetchFile(file));
            emitProgress(0.1);

            // Using -c copy is fast but might not be completely accurate for some formats
            // It splits at keyframes. For a web tool, speed is usually preferred.
            const args = [
                '-i', inputName,
                '-ss', start.toString(),
                '-to', end.toString(),
                '-c', 'copy',
                '-y', outputName
            ];

            await ff.exec(args);
            emitProgress(0.95);

            const outData = await ff.readFile(outputName);
            const blob = new Blob([outData.buffer], { type: resolveMimeType(mediaType, ext) });
            
            emitProgress(1);
            postMessage({ status: 'done', output: blob });

            try { await ff.deleteFile(inputName); } catch (e) { /* noop */ }
            try { await ff.deleteFile(outputName); } catch (e) { /* noop */ }

        } catch (err) {
            console.error('Trimmer worker error:', err);
            postMessage({ status: 'error', error: err.message });
        }
    }
}

onmessage = (e) => {
    processQueue = processQueue
        .then(() => handleMessage(e.data))
        .catch((err) => {
            console.error('Trimmer worker queue error:', err);
        });
};
