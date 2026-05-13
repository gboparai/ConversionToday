// Inside vue.config.js
const PrerenderSPAPlugin = require('prerender-spa-plugin');  // Introducing plug-ins
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
const path = require('path');
const { generatePrerenderRoutes } = require('./build-utils/generatePrerenderRoutes');
module.exports = {
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
        '@jsquash/jpeg',
        '@jsquash/png',
        '@jsquash/webp',
        '@jsquash/avif',
    ],

    pwa: {
        name: 'Conversion Today',
        themeColor: '#545454',
    },
    configureWebpack: () => {
        if (process.env.NODE_ENV !== 'production') return;
        return {
            plugins: [
                new PrerenderSPAPlugin({
                    // The path to generate the file can also be consistent with the webpakc package.
                    // This directory can only have one level, if the directory level is higher than one level, there will be no error prompt when it is generated, and it will only stick when it is pre-rendered.
                    staticDir: path.join(__dirname, 'dist'),
                    // Routes are generated programmatically from format definitions in build-utils/generatePrerenderRoutes.js
                    // This ensures that whenever formats are added or updated, the prerender routes stay in sync.
                    routes: generatePrerenderRoutes(),
                    // You have to configure or you won't precompile
                    ignoreHTTPSErrors: true,

                    skipThirdPartyRequests: true,
                    renderer: new Renderer({
                        skipThirdPartyRequests: true,
                        maxConcurrentRoutes: 2,
                        headless: true,
                        // In main.js, document.dispatchEvent(new Event('render-event')) should correspond to the event name of both.
                        renderAfterDocumentEvent: 'render-event'
                    })
                }),
            ],
        };
    }
}
