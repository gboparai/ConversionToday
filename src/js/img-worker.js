import { initializeImageMagick, ImageMagick } from "@imagemagick/magick-wasm";


let initPromise = null;
function ensureMagick() {
    if (!initPromise) {
        initPromise = fetch('/magick.wasm')
            .then(res => res.arrayBuffer())
            .then(buffer => initializeImageMagick(new Uint8Array(buffer)));
    }
    return initPromise;
}

onmessage = e => {
    let payload = e.data;
    let action = payload.action;

    if (action === "load") {
        postMessage({
            status: "loaded"
        });
    } else if (action === "process") {

        let file = payload.file;
        let config = payload.config;
        let extension = config.format.extension;
        file.arrayBuffer().then((d) => {

            ensureMagick().then(() => {

                ImageMagick.read(new Uint8Array(d), (image) => {
                    const writeCallback = data => {
                        let blob = new Blob([data], { type: `image/${extension}` });
                        postMessage({
                            status: "processed",
                            output: blob,
                            config: config,
                            id: payload.id,
                        });
                    };

                    if (config.format && config.format.magickFormat) {
                        image.write(config.format.magickFormat, writeCallback);
                    } else {
                        image.write(writeCallback);
                    }
                });
            }).catch(err => {
                console.log(err)
                postMessage({
                    status: "failed",
                    id: payload.id,
                });
            });
        });

    }

};