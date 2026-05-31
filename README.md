# 🔄 No Limit Converter

Welcome to **No Limit Converter** (available live at [nolimitconverter.com](https://nolimitconverter.com/)), the ultimate browser-based media conversion platform. This application leverages the power of WebAssembly (WASM) to offer secure, serverless, and lightning-fast file conversions, extractions, compressions, mergers, and OCR directly inside the browser.

---

## 🚀 Key Features

- **100% Client-Side Processing**: Your files never leave your device. All calculations, compression, and conversions happen locally via WebAssembly, guaranteeing maximum privacy and speed.
- **5,196+ Unique Conversion Pairs**: Fully automated matching engine converting files across images, videos, audios, documents, archives, and fonts.
- **Advanced OCR (Optical Character Recognition)**: Extract text from images and PDFs using local Tesseract.js WASM in 30+ languages, exporting directly to Word (`.docx`), PDF, Excel (`.xlsx`), Markdown, and more.
- **Dynamic File Merger**: Concatenate audio/video formats, append PDF documents, merge text-based files using Pandoc AST unification, or build custom multi-file archive containers.
- **SEO Static Prerendering**: Pre-renders all 5,190+ conversion routes dynamically using a Puppeteer-based pipeline during build time to ensure excellent search engine indexing and metadata representation.
- **PWA (Progressive Web App)**: Can be installed on mobile or desktop devices for quick, native-like access and offline capabilities.

---

## 📊 Supported Formats Matrix

| Category | Input Formats | Output Formats | Under the Hood |
| :--- | :--- | :--- | :--- |
| **Images (50)** | JPG, JPEG, PNG, TIFF, WEBP, GIF, BMP, PSD, AI, EPS, SVGZ, DCX, DDS, DPX, EXR, FITS, JFIF, JPC, JPE, JPS, JPM, JNG, J2C, J2K, MIFF, MNG, PALM, PAM, PBM, PCD, PCDS, PCL, PCX, PFA, PGM, PSB, PTIF, P7, RAS, SGI, SUN, TGA, VDA, VICAR, VIFF, VIPS, XBM, XPM, XV | JPG, JPEG, PNG, TIFF, WEBP, GIF, BMP, SVG, PSD, AI, EPS, SVGZ, DCX, DDS, DPX, EXR, FITS, JFIF, JPC, JPE, JPS, JPM, JNG, J2C, J2K, MIFF, MNG, PALM, PAM, PBM, PCD, PCDS, PCL, PCX, PFA, PGM, PSB, PTIF, P7, RAS, SGI, SUN, TGA, VDA, VICAR, VIFF, VIPS, XBM, XPM, XV | **ImageMagick WASM**, **jsquash** (AVIF, JPEG, PNG, WebP) |
| **Audio (11)** | MP3, WAV, OGG, FLAC, AAC, M4A, OPUS, WEBM, WMA, ALAC, APE | MP3, WAV, OGG, FLAC, AAC, M4A, OPUS, WEBM, WMA, ALAC, APE | **FFmpeg WASM** |
| **Video (12)** | MP4, WEBM, MOV, AVI, MKV, FLV, WMV, 3GP, MPEG, M3U8, TS, OGV | MP4, WEBM, MOV, AVI, MKV, FLV, WMV, 3GP, MPEG, M3U8, TS, OGV | **FFmpeg WASM** |
| **Documents (67)**| Markdown, HTML, DOCX, ODT, LaTeX, reStructuredText (RST), Org-mode, MediaWiki, Textile, AsciiDoc, EPUB, RTF, Jupyter Notebook (IPynb), Jira, Pandoc AST JSON, Typst, DocBook XML, OPML, FictionBook2 (FB2), Muse, Djot, Unix Man Page, BibTeX, BibLaTeX, CSV, TSV, XLSX, XLS, ODS, POD, mdoc, txt2tags, EndNote XML | Markdown, HTML, DOCX, ODT, LaTeX, reStructuredText, Org-mode, MediaWiki, Textile, AsciiDoc, EPUB, RTF, Jupyter Notebook, Jira, Pandoc AST JSON, Typst, DocBook XML, OPML, FictionBook2, Muse, Djot, Unix Man Page, BibTeX, BibLaTeX, CSV, TSV, XLSX, ODS, Beamer, PDF, Reveal.js, Slidy, DZSlides, S5, PPTX, Plain Text, Texinfo, ConTeXt, InDesign ICML, JATS XML, TEI Simple XML, Roff MS, XWiki, ZimWiki, BBCode, Slideous, ANSI Terminal, Vim Help File, Markua, ODT XML | **Pandoc WASM**, **Typst WASM**, **pdf-lib**, **pdf.js**, **SheetJS (xlsx)** |
| **Archives (8)** | ZIP, 7Z, RAR, TAR, TAR.GZ, TAR.BZ2, TAR.XZ, ISO | ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ, ISO | **7z-wasm**, **libarchive.js**, **JSZip**, **@gcu/iso9660** |
| **Fonts (6)** | TTF, OTF, WOFF, WOFF2, EOT, SVG | TTF, OTF, WOFF, WOFF2, EOT, SVG | **FontEditor Core**, **OpenType.js** |

---

## 🛠️ Installation & Local Setup

### Prerequisites
- **Node.js** (v18.x or later recommended)
- **npm** (v9.x or later)

### 1. Install Dependencies
Run the standard installer in the repository root:
```bash
npm install
```

> [!TIP]
> The installation process triggers a `postinstall` hook which executes `npm run sync:runtime-assets`. This automatically pulls WebAssembly binaries and required compiled worker script assets directly from `node_modules` into the `public/vendor/` folder, and downloads the NotoSans TrueType font for Typst compilations.

If you ever need to manually force-sync runtime WASM assets, run:
```bash
npm run sync:runtime-assets
```

### 2. Run the Development Server
Since many WebAssembly libraries (such as FFmpeg WASM) require secure headers and thread separation, the application includes development commands for standard HTTP, HTTPS, and Local Area Network HTTPS serving.

**Standard Development Server:**
```bash
npm run serve
```

**Development Server with HTTPS enabled:**
```bash
npm run serve:https
```

**Development Server with HTTPS enabled for LAN accessibility:**
```bash
npm run serve:https:lan
```
*Note: The configurations automatically include `set NODE_OPTIONS=--openssl-legacy-provider` for compatibility with newer Node versions.*

---

## 🧪 Running Tests

The application features a comprehensive test suite written in **Jest** that verifies route integration, store operations, component structures, and the absolute validity of all **5,196 conversion configurations** using mock files.

Run all tests:
```bash
npm test
```

### Test Suite Modules
- [tests/conversion-pairs.test.js](file:///c:/Users/gurmi/Projects/anyform/tests/conversion-pairs.test.js): Extracts arrays programmatically from views and stores to verify format support validity, checking against physical sample files inside `tests/fixtures/`.
- [tests/router-navigation.test.js](file:///c:/Users/gurmi/Projects/anyform/tests/router-navigation.test.js): Verifies Vue Router routing configurations and resolves correct mappings.
- [tests/components.test.js](file:///c:/Users/gurmi/Projects/anyform/tests/components.test.js): Validates view elements and UI integration points.
- [tests/media-types.test.js](file:///c:/Users/gurmi/Projects/anyform/tests/media-types.test.js): Tests centralized media configurations.
- [tests/store-helpers.test.js](file:///c:/Users/gurmi/Projects/anyform/tests/store-helpers.test.js): Tests store mutations, helper methods, and state properties.
- [tests/prerender-routes.test.js](file:///c:/Users/gurmi/Projects/anyform/tests/prerender-routes.test.js): Validates the prerendering array logic to ensure all SEO pages are indexed.

---

## 📦 Building & Production Deployment

### 1. Compile and Minify for Production
```bash
npm run build
```

During this compilation process:
1. `npm run generate:sitemap` is triggered automatically as a `prebuild` step, outputting updated sitemaps to `public/sitemap.xml`.
2. Webpack compiles the Vue frontend logic.
3. The `@prerenderer/webpack-plugin` fires up a headless Puppeteer browser, browsing through all generated route patterns and spitting out indexable, pre-rendered static HTML structures into `/dist`.

### 2. Deploy/Publish
If deploying to GitHub Pages, you can publish easily using the subtree script:
```bash
npm run publish
```
This pushes the compiled `/dist` directory directly onto the project's `gh-pages` branch.

---

## 📂 Project Structure

```
├── build-utils/            # Prerendering and sitemap generation helpers
├── public/                 # Static assets, template, sitemap, manifest
│   └── vendor/             # Synced runtime WebAssembly binaries (FFmpeg, Pandoc, Typst, etc.)
├── scripts/                # Asset sync automation scripts
├── src/                    # Primary Vue frontend application source
│   ├── assets/             # Branding and SVG graphics
│   ├── components/         # Reusable layouts, cards, and file lists
│   ├── js/                 # Web Workers (img, doc, audio, video, archive, font, merge)
│   ├── router/             # Vue Router route mappings
│   ├── store/              # Vuex global state management & conversion states
│   ├── styles/             # Application-wide styling variables
│   └── views/              # View pages (OCR, Compress, Merge, Convert)
├── tests/                  # Jest testing suite and mock file fixtures
├── vue.config.js           # Vue-CLI / Webpack configuration
└── package.json            # Script definitions and dependency mappings
```

---

## 🗃️ Under the Hood (Engine Credits)

This project wouldn't be possible without the incredible work done in the open-source WebAssembly ecosystem:
- **Audio & Video**: [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) (FFmpeg ported to WebAssembly)
- **Image Conversion**: [@imagemagick/magick-wasm](https://github.com/dlemstra/magick-wasm)
- **Image Compression**: [@jsquash/avif](https://github.com/joshwooding/jsquash), [@jsquash/jpeg](https://github.com/joshwooding/jsquash), [@jsquash/png](https://github.com/joshwooding/jsquash), [@jsquash/webp](https://github.com/joshwooding/jsquash)
- **Documents**: [pandoc-wasm](https://github.com/jeremydw/pandoc-wasm), [@myriaddreamin/typst-ts-web-compiler](https://github.com/MyriadDreamin/typst.ts), [pdf-lib](https://github.com/Hopding/pdf-lib), [pdfjs-dist](https://github.com/mozilla/pdf.js), [SheetJS](https://sheetjs.com/)
- **Archives**: [7z-wasm](https://github.com/Ariel-Aharoni/7z-wasm), [libarchive.js](https://github.com/nika-begiashvili/libarchive.js), [jszip](https://github.com/Stuk/jszip), [@gcu/iso9660](https://github.com/gcu/iso9660)
- **Fonts**: [fonteditor-core](https://github.com/ecomfe/fonteditor-core), [opentype.js](https://github.com/opentypejs/opentype.js)
- **OCR**: [tesseract.js](https://github.com/naptha/tesseract.js) (Tesseract OCR Engine in the browser)

## 📄 License

This repository is licensed under the **MIT License**. See the [LICENSE.md](file:///c:/Users/gurmi/Projects/anyform/LICENSE.md) file for details.