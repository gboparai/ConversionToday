# Feature Ideas for No Limit Converter

Since the app's core philosophy is **"Private, In-Browser (WASM/Canvas), Unlimited Processing"**, every feature on this list is designed to run 100% locally without uploading files to a server. These ideas leverage the powerful libraries you already have installed (like `FFmpeg.wasm`, `pdf-lib`, `JSZip`, and canvas codecs).

---

## 🎨 Media & Design Tools

### 1. Bulk Image Resizer / Cropper
You already have the conversion codecs, but a dedicated tool to uniformly resize, crop, or pad a batch of images to exact dimensions (e.g., forcing everything to 1920x1080) would be huge for designers or e-commerce users. You already have a commented-out `resize-config.vue` that could be the foundation for this.

### 2. Sprite Sheet Generator
A niche but highly demanded tool for game developers and web optimizers. Users upload small images, and the canvas stitches them into one single large PNG sprite sheet, simultaneously generating the `.css` or `.json` mapping file to download alongside it.

### 3. Color Palette Extractor
Users upload an image (or batch of images), and the app uses Canvas to extract the top 5 dominant colors, returning them as beautifully formatted HEX/RGB palettes. Completely client-side, highly shareable.

---

## 🎬 Video & Audio Tools

### 4. Media Trimmer (Cut & Crop)
You have `FFmpeg.wasm` running for conversions, but what about editing? A tool with a dual-slider UI where users set a start and end timestamp (e.g., 00:15 to 00:45) to trim an MP3 or MP4. 

### 5. Subtitle Format Converter (SRT ↔ VTT)
*Status: Completed & Shipped*

---

## 📄 PDF & Document Tools

### 6. PDF / Media Splitter
*Status: Completed & Shipped*

### 7. PDF Password Protector & Unlocker
*Status: Completed & Shipped*

### 8. Bulk Watermarker
Let users upload a logo (or type text), set opacity and positioning, and stamp it across images or PDF pages instantly. Because it happens entirely in the browser, users don't have to worry about uploading sensitive client photos to a random server.

---

## 🛡️ Privacy & Web Dev Tools

### 9. EXIF / Metadata Stripper
*Status: Completed & Shipped*

### 10. Code Minifier & Beautifier
A tool for web developers to bulk-process `.html`, `.css`, `.js`, and `.json` files. It either minifies them to save space or formats/beautifies them to make them readable. There are excellent, tiny JS libraries for this that require zero backend.
