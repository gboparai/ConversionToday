/**
 * Store helper factories for media-type modules.
 *
 * These functions generate the identical sets of mutations and actions that
 * each media type (audio, video, document, archive, font) requires, avoiding
 * massive code duplication.
 *
 * The original image type keeps its own hand-written mutations/actions because
 * it has slightly different behaviour (no progress tracking, multi-threaded
 * concurrency, no guard on missing file).
 */

import { FILE_STATUS } from '@/js/constants';

/**
 * Capitalize first letter of a string.
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate mutations for a media type.
 *
 * @param {string} prefix - e.g. 'Audio', 'Video', 'Document', 'Archive', 'Font'
 * @param {object} opts
 * @param {string} opts.filesKey - state key for the files array (e.g. 'audioFiles')
 * @param {string} opts.nextIndexKey - state key for the next index counter
 * @param {string} opts.configKey - state key for the config object
 * @param {boolean} [opts.hasInputFormat] - whether this type has inputFormat in config
 */
function createMediaMutations(prefix, { filesKey, nextIndexKey, configKey, hasInputFormat = false }) {
    const mutations = {};

    mutations[`add${prefix}File`] = (state, fileObject) => {
        state[filesKey].push(fileObject);
    };

    mutations[`clear${prefix}Files`] = (state) => {
        state[filesKey] = [];
        state[nextIndexKey] = 0;
    };

    mutations[`set${prefix}Data`] = (state, { id, data }) => {
        const file = state[filesKey].find(f => f.id === id);
        if (!file) return;
        file.output.blob = data.output;
        file.output.config = data.config;
    };

    mutations[`set${prefix}Url`] = (state, { id, url }) => {
        const file = state[filesKey].find(f => f.id === id);
        if (!file) return;
        file.output.url = url;
    };

    mutations[`set${prefix}Name`] = (state, { id, name }) => {
        const file = state[filesKey].find(f => f.id === id);
        if (!file) return;
        file.output.name = name;
    };

    mutations[`set${prefix}Status`] = (state, { id, status }) => {
        const file = state[filesKey].find(f => f.id === id);
        if (!file) return;
        file.status = status;
    };

    mutations[`set${prefix}Progress`] = (state, { id, progress }) => {
        const file = state[filesKey].find(f => f.id === id);
        if (!file) return;
        file.progress = Math.max(0, Math.min(100, progress));
    };

    mutations[`remove${prefix}File`] = (state, id) => {
        state[filesKey] = state[filesKey].filter(f => f.id !== id);
    };

    mutations[`increment${prefix}Id`] = (state) => {
        state[nextIndexKey]++;
    };

    mutations[`set${prefix}Format`] = (state, format) => {
        state[configKey].format = format;
    };

    if (hasInputFormat) {
        mutations[`set${prefix}InputFormat`] = (state, format) => {
            state[configKey].inputFormat = format;
        };
    }

    return mutations;
}

/**
 * Generate actions for a media type.
 *
 * @param {string} prefix - e.g. 'Audio', 'Video', 'Document', 'Archive', 'Font'
 * @param {object} opts
 * @param {string} opts.filesKey - state key for the files array
 * @param {string} opts.nextIndexKey - state key for the next index counter
 * @param {string} opts.configKey - state key for the config object
 * @param {string} opts.workerKey - state key for the worker instance
 * @param {function} opts.WorkerClass - The Worker constructor (imported worker-loader module)
 * @param {number} [opts.maxConcurrency] - max in-flight jobs (default 1)
 * @param {boolean} [opts.hasInputFormat] - whether to generate setInputFormat action
 */
function createMediaActions(prefix, { filesKey, nextIndexKey, configKey, workerKey, WorkerClass, maxConcurrency = 1, hasInputFormat = false }) {
    const actions = {};

    actions[`load${prefix}Worker`] = (context) => {
        if (context.state[workerKey]) return;
        const worker = new WorkerClass();
        context.state[workerKey] = worker;
        worker.postMessage({ action: 'load' });
        worker.onmessage = (e) => {
            const { status, id } = e.data;
            let processMore = false;
            if (status === 'progress') {
                context.commit(`set${prefix}Progress`, { id, progress: e.data.progress });
            } else if (status === 'processed') {
                context.commit(`set${prefix}Progress`, { id, progress: 100 });
                context.commit(`set${prefix}Status`, { id, status: FILE_STATUS.processed });
                context.commit(`set${prefix}Data`, { id, data: e.data });
                processMore = true;
            } else if (status === 'failed') {
                context.commit(`set${prefix}Status`, { id, status: FILE_STATUS.failed });
                processMore = true;
            }
            if (processMore) context.dispatch(`processAllWaiting${prefix}`);
        };
    };

    actions[`clear${prefix}Files`] = (context) => {
        context.commit(`clear${prefix}Files`);
    };

    actions[`set${prefix}Format`] = (context, format) => {
        context.commit(`set${prefix}Format`, format);
    };

    if (hasInputFormat) {
        actions[`set${prefix}InputFormat`] = (context, format) => {
            context.commit(`set${prefix}InputFormat`, format);
        };
    }

    actions[`add${prefix}File`] = (context, file) => {
        const fileObject = {
            id: context.state[nextIndexKey],
            ogFile: file,
            name: file.name,
            status: FILE_STATUS.initialized,
            progress: 0,
            output: { blob: null, name: null, url: null, config: null },
            process: [],
        };
        context.commit(`increment${prefix}Id`);
        context.commit(`add${prefix}File`, fileObject);
    };

    actions[`add${prefix}Files`] = async (context, files) => {
        for (let i = 0; i < files.length; i++) {
            context.dispatch(`add${prefix}File`, files[i]);
            await new Promise(r => setTimeout(r, 16));
        }
    };

    actions[`processAll${prefix}Files`] = (context) => {
        const notProcessed = context.state[filesKey].filter(
            f => f.status === FILE_STATUS.initialized
        );
        notProcessed.forEach(f => {
            context.commit(`set${prefix}Status`, { id: f.id, status: FILE_STATUS.waiting });
        });
        context.dispatch(`processAllWaiting${prefix}`);
    };

    actions[`processAllWaiting${prefix}`] = (context) => {
        const running = context.state[filesKey].filter(
            f => f.status === FILE_STATUS.processing
        ).length;
        const slots = maxConcurrency;
        for (let i = 0; i < slots - running; i++) {
            const waiting = context.state[filesKey].find(f => f.status === FILE_STATUS.waiting);
            if (!waiting) break;
            context.dispatch(`process${prefix}File`, waiting.id);
        }
    };

    actions[`process${prefix}File`] = (context, id) => {
        const file = context.state[filesKey].find(f => f.id === id);
        const config = JSON.parse(JSON.stringify(context.state[configKey]));
        context.state[workerKey].postMessage({
            action: 'process',
            file: file.ogFile,
            id: file.id,
            config,
        });
        context.commit(`set${prefix}Progress`, { id, progress: 0 });
        context.commit(`set${prefix}Status`, { id, status: FILE_STATUS.processing });
    };

    return actions;
}

export { createMediaMutations, createMediaActions, capitalize };
