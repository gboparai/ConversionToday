/**
 * Centralized media-type configuration map.
 *
 * Each key is the route-level media type identifier (e.g. 'image', 'audio').
 * The values provide the store property names, action/mutation prefixes, and
 * labels used across the application for each media type.
 */

const MEDIA_TYPES = {
    image: {
        filesKey: 'files',
        formatsKey: 'formats',
        nextIndexKey: 'nextIndex',
        workerKey: 'worker',
        configKey: 'config',
        label: 'Images',
        acceptMimeTypes: 'image/*',
        trackProgress: false,
        // Action names
        addFiles: 'addFiles',
        clearFiles: 'clearFiles',
        processAll: 'processAllFiles',
        loadWorker: 'loadWorker',
        setFormat: 'setFormat',
        setInputFormat: null,
        // Mutation names
        setUrl: 'setUrl',
        setName: 'setName',
        removeFile: 'removeFile',
    },
    audio: {
        filesKey: 'audioFiles',
        formatsKey: 'audioFormats',
        nextIndexKey: 'audioNextIndex',
        workerKey: 'audioWorker',
        configKey: 'audioConfig',
        label: 'Audio Files',
        acceptMimeTypes: 'audio/*',
        trackProgress: true,
        addFiles: 'addAudioFiles',
        clearFiles: 'clearAudioFiles',
        processAll: 'processAllAudioFiles',
        loadWorker: 'loadAudioWorker',
        setFormat: 'setAudioFormat',
        setInputFormat: null,
        setUrl: 'setAudioUrl',
        setName: 'setAudioName',
        removeFile: 'removeAudioFile',
    },
    video: {
        filesKey: 'videoFiles',
        formatsKey: 'videoFormats',
        nextIndexKey: 'videoNextIndex',
        workerKey: 'videoWorker',
        configKey: 'videoConfig',
        label: 'Video Files',
        acceptMimeTypes: 'video/*',
        trackProgress: true,
        addFiles: 'addVideoFiles',
        clearFiles: 'clearVideoFiles',
        processAll: 'processAllVideoFiles',
        loadWorker: 'loadVideoWorker',
        setFormat: 'setVideoFormat',
        setInputFormat: null,
        setUrl: 'setVideoUrl',
        setName: 'setVideoName',
        removeFile: 'removeVideoFile',
    },
    document: {
        filesKey: 'documentFiles',
        formatsKey: 'documentFormats',
        nextIndexKey: 'documentNextIndex',
        workerKey: 'documentWorker',
        configKey: 'documentConfig',
        label: 'Documents',
        acceptMimeTypes: '*/*',
        trackProgress: true,
        addFiles: 'addDocumentFiles',
        clearFiles: 'clearDocumentFiles',
        processAll: 'processAllDocumentFiles',
        loadWorker: 'loadDocumentWorker',
        setFormat: 'setDocumentFormat',
        setInputFormat: 'setDocumentInputFormat',
        setUrl: 'setDocumentUrl',
        setName: 'setDocumentName',
        removeFile: 'removeDocumentFile',
    },
    archive: {
        filesKey: 'archiveFiles',
        formatsKey: 'archiveFormats',
        nextIndexKey: 'archiveNextIndex',
        workerKey: 'archiveWorker',
        configKey: 'archiveConfig',
        label: 'Archives',
        acceptMimeTypes: '.zip,.7z,.rar,.tar,.tar.gz,.tgz,.tar.bz2,.tbz2,.tar.xz,.txz,.iso',
        trackProgress: true,
        addFiles: 'addArchiveFiles',
        clearFiles: 'clearArchiveFiles',
        processAll: 'processAllArchiveFiles',
        loadWorker: 'loadArchiveWorker',
        setFormat: 'setArchiveFormat',
        setInputFormat: 'setArchiveInputFormat',
        setUrl: 'setArchiveUrl',
        setName: 'setArchiveName',
        removeFile: 'removeArchiveFile',
    },
    font: {
        filesKey: 'fontFiles',
        formatsKey: 'fontFormats',
        nextIndexKey: 'fontNextIndex',
        workerKey: 'fontWorker',
        configKey: 'fontConfig',
        label: 'Font Files',
        acceptMimeTypes: null, // computed dynamically from formats
        trackProgress: true,
        addFiles: 'addFontFiles',
        clearFiles: 'clearFontFiles',
        processAll: 'processAllFontFiles',
        loadWorker: 'loadFontWorker',
        setFormat: 'setFontFormat',
        setInputFormat: 'setFontInputFormat',
        setUrl: 'setFontUrl',
        setName: 'setFontName',
        removeFile: 'removeFontFile',
    },
};

/**
 * Detect the media type from a route path.
 * @param {string} path - The current route path (e.g. '/audio/mp3/wav')
 * @returns {string} The media type key (defaults to 'image')
 */
function getMediaTypeFromPath(path) {
    if (path.startsWith('/audio')) return 'audio';
    if (path.startsWith('/video')) return 'video';
    if (path.startsWith('/document')) return 'document';
    if (path.startsWith('/archive')) return 'archive';
    if (path.startsWith('/font')) return 'font';
    return 'image';
}

/**
 * Get the full configuration object for a media type.
 * @param {string} mediaType - One of the MEDIA_TYPES keys
 * @returns {object} The media type configuration
 */
function getMediaTypeConfig(mediaType) {
    return MEDIA_TYPES[mediaType] || MEDIA_TYPES.image;
}

export { MEDIA_TYPES, getMediaTypeFromPath, getMediaTypeConfig };
