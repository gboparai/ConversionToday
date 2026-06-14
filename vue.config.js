// Inside vue.config.js
const { generatePrerenderRoutes } = require('./build-utils/generatePrerenderRoutes');
module.exports = {
    css: {
        loaderOptions: {
            scss: {
                sassOptions: {
                    silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'],
                },
            },
            sass: {
                sassOptions: {
                    silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'],
                },
            },
        },
    },
    publicPath: '/',

    // Transpile mediabunny, @ffmpeg, and pandoc-wasm packages through Babel (they use modern JS syntax)
    transpileDependencies: [
        'mediabunny',
        '@ffmpeg/ffmpeg',
        '@ffmpeg/util',
        'pandoc-wasm',
        '@bjorn3/browser_wasi_shim',
        'libarchive.js',
        '7z-wasm',
        '@gcu/iso9660',
        '@e965/xlsx',
        '@jsquash/jpeg',
        '@jsquash/png',
        '@jsquash/webp',
        '@jsquash/avif',
        'tesseract.js',
    ],

    pwa: {
        name: 'No Limit Converter',
        themeColor: '#545454',
    },
    configureWebpack: () => {
        const config = {
            resolve: {
                fallback: {
                    path: false,
                    fs: false,
                    child_process: false,
                    crypto: false,
                    stream: require.resolve('stream-browserify'),
                    timers: require.resolve('timers-browserify'),
                },
            },
            module: {
                exprContextCritical: false,
            },
        };

        if (process.env.NODE_ENV === 'production') {
            const PrerendererWebpackPlugin = require('@prerenderer/webpack-plugin');
            config.plugins = [
                new PrerendererWebpackPlugin({
                    // Routes are generated programmatically from format definitions in build-utils/generatePrerenderRoutes.js
                    // This ensures that whenever formats are added or updated, the prerender routes stay in sync.
                    routes: generatePrerenderRoutes(),
                    renderer: '@prerenderer/renderer-puppeteer',
                    rendererOptions: {
                        maxConcurrentRoutes: 2,
                        headless: true,
                        // In main.js, document.dispatchEvent(new Event('render-event')) should correspond to the event name of both.
                        renderAfterDocumentEvent: 'render-event',
                    },
                }),
            ];
        }

        return config;
    }
}
