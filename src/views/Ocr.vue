<template>
  <descriptor>
    <template #header>{{ pageTitle }}</template>
    <template #description>
      Upload images or PDFs, choose a language and output format, then run OCR and download the results.
    </template>
  </descriptor>

  <div class="informationBar">
    <card
      path="/ocr"
      :formats="ocrOutputFormats"
      :selectedFormat="selectedOutputFormat"
      :handleChange="handleFormatChange"
    >
      <template #header>{{ selectedFormatInfo.title }}</template>
      <template #description>{{ selectedFormatInfo.description }}</template>
    </card>

    <div class="languageCard">
      <label class="languageCard__label" for="ocrLanguageSelect">OCR Language</label>
      <select
        id="ocrLanguageSelect"
        class="languageCard__select"
        v-model="selectedLanguage"
        @change="onLanguageChange"
      >
        <option v-for="lang in OCR_LANGUAGES" :key="lang.code" :value="lang.code">
          {{ lang.name }}
        </option>
      </select>
      <p class="languageCard__hint">
        {{ selectedLanguageInfo ? selectedLanguageInfo.name : 'English' }} —
        language data is loaded on first use
      </p>
    </div>
  </div>

  <label class="fileInput">
    <input @change="input" type="file" multiple :accept="acceptAttr" />
    <div class="file">
      <p>Add Images or PDFs Here</p>
    </div>
  </label>

  <div class="batchBar">
    <button
      class="batchBar__button"
      :disabled="processable.length <= 0 || running"
      @click="runAll"
    >
      <div>Run OCR on All</div>
    </button>
    <button
      class="batchBar__button"
      :disabled="processed.length <= 0"
      @click="downloadAll"
    >
      <div>Download All</div>
    </button>
    <button
      class="batchBar__button"
      :disabled="processed.length <= 0"
      @click="downloadZip"
    >
      <div>Download ZIP</div>
    </button>
    <button
      class="batchBar__button"
      :disabled="files.length <= 0"
      @click="clearAll"
    >
      <div>Clear All</div>
    </button>
  </div>

  <p v-if="unsupportedCount > 0" class="notice">
    {{ unsupportedCount }} file(s) were skipped. Supported input: JPG, PNG, GIF, BMP, WebP, TIFF, PDF.
  </p>

  <div class="files">
    <div v-for="file in files" :key="file.id" class="fileRow">
      <div class="fileRow__info">
        <div class="fileRow__name">{{ file.name }}</div>
        <div v-if="file.statusMessage" class="fileRow__message">{{ file.statusMessage }}</div>
      </div>
      <div class="fileRow__progress" v-if="file.status === FILE_STATUS.processing">
        <div class="progressBar">
          <div class="progressBar__fill" :style="{ width: file.progress + '%' }"></div>
        </div>
        <span class="progressBar__pct">{{ file.progress }}%</span>
      </div>
      <div class="fileRow__actions">
        <span :class="['status-badge', statusClass(file.status)]">{{ statusLabel(file.status) }}</span>
        <a
          v-if="file.status === FILE_STATUS.processed"
          class="iconButton iconButton--download"
          :href="file.output.url"
          :download="file.output.name"
          title="Download"
          :aria-label="'Download ' + file.output.name"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 20h14v-2H5v2zm7-18v10.17l-3.59-3.58L7 10l5 5 5-5-1.41-1.41L13 12.17V2h-1z"/>
          </svg>
        </a>
        <button
          v-if="file.status !== FILE_STATUS.processed"
          class="iconButton iconButton--remove"
          :disabled="file.status === FILE_STATUS.processing"
          @click="removeFile(file.id)"
          title="Remove"
          aria-label="Remove file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Supported Input Formats</template>
      <template #description>
        JPG, JPEG, PNG, GIF, BMP, WebP, TIFF and multi-page PDF. PDF pages are rendered individually before recognition.
      </template>
    </information>
    <information>
      <template #header>30+ Languages</template>
      <template #description>
        Tesseract supports over 100 languages. Language data is downloaded when first used and cached for subsequent runs.
      </template>
    </information>
    <information>
      <template #header>Private Processing</template>
      <template #description>
        All OCR runs locally in your browser via the Tesseract WebAssembly engine. Your files are never uploaded to any server.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">OCR FAQ</h3>
    <faq :faqs="faqs" @toggle="toggleFaq" />
  </div>
</template>

<script>
import Card from "@/components/card.vue";
import Descriptor from "@/components/descriptor.vue";
import Faq from "@/components/faq.vue";
import Information from "@/components/information.vue";
import { FILE_STATUS } from "@/js/constants";
import { useMeta } from "vue-meta";
import JSZip from "jszip";
import DocWorkerClass from "worker-loader!@/js/doc-worker.js";

const SUPPORTED_IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif']);
const ACCEPT_ATTR = '.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.tif,.pdf,image/jpeg,image/png,image/gif,image/bmp,image/webp,image/tiff,application/pdf';

const OCR_OUTPUT_FORMATS = [
  { name: 'txt',       extension: 'txt',      title: 'Plain Text',           description: 'Simple plain text extracted by OCR — no conversion needed.',                                     mimeType: 'text/plain',                                                                           isPandoc: false, isSpreadsheet: false },
  { name: 'docx',      extension: 'docx',     title: 'Word Document',        description: 'Microsoft Word document with OCR text.',                                                          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',              isPandoc: true,  pandocName: 'docx'      },
  { name: 'pdf',       extension: 'pdf',      title: 'PDF',                  description: 'PDF document generated from OCR text via Pandoc and Typst.',                                      mimeType: 'application/pdf',                                                                      isPandoc: true,  pandocName: 'pdf'       },
  { name: 'xlsx',      extension: 'xlsx',     title: 'Excel Spreadsheet',    description: 'Excel spreadsheet with each line of OCR text in its own row.',                                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',                    isPandoc: false, isSpreadsheet: true  },
  { name: 'csv',       extension: 'csv',      title: 'CSV',                  description: 'Comma-separated values — one OCR text line per row.',                                             mimeType: 'text/csv',                                                                             isPandoc: false, isSpreadsheet: true  },
  { name: 'epub',      extension: 'epub',     title: 'EPUB',                 description: 'EPUB ebook with OCR text.',                                                                        mimeType: 'application/epub+zip',                                                                 isPandoc: true,  pandocName: 'epub'      },
  { name: 'rtf',       extension: 'rtf',      title: 'Rich Text Format',     description: 'RTF document with OCR text.',                                                                      mimeType: 'application/rtf',                                                                      isPandoc: true,  pandocName: 'rtf'       },
  { name: 'odt',       extension: 'odt',      title: 'OpenDocument Text',    description: 'OpenDocument text file (.odt) with OCR text.',                                                     mimeType: 'application/vnd.oasis.opendocument.text',                                              isPandoc: true,  pandocName: 'odt'       },
  { name: 'html',      extension: 'html',     title: 'HTML',                 description: 'HTML document with OCR text.',                                                                     mimeType: 'text/html',                                                                            isPandoc: true,  pandocName: 'html'      },
  { name: 'markdown',  extension: 'md',       title: 'Markdown',             description: 'Markdown document with OCR text.',                                                                 mimeType: 'text/markdown',                                                                        isPandoc: true,  pandocName: 'markdown'  },
  { name: 'rst',       extension: 'rst',      title: 'reStructuredText',     description: 'reStructuredText markup with OCR text.',                                                           mimeType: 'text/x-rst',                                                                           isPandoc: true,  pandocName: 'rst'       },
  { name: 'latex',     extension: 'tex',      title: 'LaTeX',                description: 'LaTeX source document with OCR text.',                                                             mimeType: 'application/x-tex',                                                                    isPandoc: true,  pandocName: 'latex'     },
  { name: 'org',       extension: 'org',      title: 'Org Mode',             description: 'Emacs Org-mode document with OCR text.',                                                           mimeType: 'text/x-org',                                                                           isPandoc: true,  pandocName: 'org'       },
  { name: 'asciidoc',  extension: 'adoc',     title: 'AsciiDoc',             description: 'AsciiDoc document with OCR text.',                                                                 mimeType: 'text/asciidoc',                                                                        isPandoc: true,  pandocName: 'asciidoc'  },
  { name: 'mediawiki', extension: 'wiki',     title: 'MediaWiki',            description: 'MediaWiki markup with OCR text.',                                                                  mimeType: 'text/plain',                                                                           isPandoc: true,  pandocName: 'mediawiki' },
  { name: 'textile',   extension: 'textile',  title: 'Textile',              description: 'Textile markup with OCR text.',                                                                    mimeType: 'text/plain',                                                                           isPandoc: true,  pandocName: 'textile'   },
  { name: 'docbook',   extension: 'xml',      title: 'DocBook XML',          description: 'DocBook XML document with OCR text.',                                                              mimeType: 'application/xml',                                                                      isPandoc: true,  pandocName: 'docbook5'  },
  { name: 'fb2',       extension: 'fb2',      title: 'FictionBook 2',        description: 'FictionBook 2 format with OCR text.',                                                              mimeType: 'application/xml',                                                                      isPandoc: true,  pandocName: 'fb2'       },
  { name: 'tsv',       extension: 'tsv',      title: 'TSV',                  description: 'Tab-separated values — one OCR text line per row.',                                               mimeType: 'text/tab-separated-values',                                                            isPandoc: false, isSpreadsheet: true  },
  { name: 'ods',       extension: 'ods',      title: 'ODS Spreadsheet',      description: 'OpenDocument spreadsheet with each line of OCR text in its own row.',                             mimeType: 'application/vnd.oasis.opendocument.spreadsheet',                                       isPandoc: false, isSpreadsheet: true  },
];

const PLAIN_INPUT_FORMAT = { name: 'plain', extension: 'txt', mimeType: 'text/plain' };

const OCR_LANGUAGES = [
  { code: 'eng',     name: 'English'                  },
  { code: 'fra',     name: 'French'                   },
  { code: 'deu',     name: 'German'                   },
  { code: 'spa',     name: 'Spanish'                  },
  { code: 'ita',     name: 'Italian'                  },
  { code: 'por',     name: 'Portuguese'               },
  { code: 'nld',     name: 'Dutch'                    },
  { code: 'pol',     name: 'Polish'                   },
  { code: 'rus',     name: 'Russian'                  },
  { code: 'ukr',     name: 'Ukrainian'                },
  { code: 'swe',     name: 'Swedish'                  },
  { code: 'nor',     name: 'Norwegian'                },
  { code: 'dan',     name: 'Danish'                   },
  { code: 'fin',     name: 'Finnish'                  },
  { code: 'ces',     name: 'Czech'                    },
  { code: 'slk',     name: 'Slovak'                   },
  { code: 'hun',     name: 'Hungarian'                },
  { code: 'ron',     name: 'Romanian'                 },
  { code: 'tur',     name: 'Turkish'                  },
  { code: 'ell',     name: 'Greek'                    },
  { code: 'bul',     name: 'Bulgarian'                },
  { code: 'hrv',     name: 'Croatian'                 },
  { code: 'cat',     name: 'Catalan'                  },
  { code: 'lat',     name: 'Latin'                    },
  { code: 'ara',     name: 'Arabic'                   },
  { code: 'heb',     name: 'Hebrew'                   },
  { code: 'hin',     name: 'Hindi'                    },
  { code: 'ben',     name: 'Bengali'                  },
  { code: 'urd',     name: 'Urdu'                     },
  { code: 'fas',     name: 'Persian (Farsi)'           },
  { code: 'chi_sim', name: 'Chinese (Simplified)'     },
  { code: 'chi_tra', name: 'Chinese (Traditional)'    },
  { code: 'jpn',     name: 'Japanese'                 },
  { code: 'kor',     name: 'Korean'                   },
  { code: 'tha',     name: 'Thai'                     },
  { code: 'vie',     name: 'Vietnamese'               },
  { code: 'ind',     name: 'Indonesian'               },
  { code: 'msa',     name: 'Malay'                    },
];

function buildFaqs() {
  return [
    {
      question: 'What file formats can I use as input?',
      answer: 'The OCR tool accepts JPG, JPEG, PNG, GIF, BMP, WebP, TIFF and PDF files. Multi-page PDFs are rendered page-by-page before recognition.',
      open: false,
    },
    {
      question: 'Are my files uploaded to a server?',
      answer: 'No. All OCR processing runs locally in your browser using the Tesseract WebAssembly engine. Your files never leave your device.',
      open: false,
    },
    {
      question: 'How do I change the OCR language?',
      answer: 'Use the Language selector in the tool. When you switch to a new language, Tesseract downloads the corresponding language data file (a few MB) on first use. Once cached, subsequent runs are instant.',
      open: false,
    },
    {
      question: 'Can I batch-process multiple files?',
      answer: 'Yes. Add as many images or PDFs as you want, then click "Run OCR on All". Each file is processed in sequence and gets its own download link.',
      open: false,
    },
    {
      question: 'What output formats are available?',
      answer: 'You can export to TXT, DOCX, PDF, XLSX, CSV, EPUB, RTF, ODT, HTML, Markdown, LaTeX, Org, AsciiDoc, MediaWiki, Textile, DocBook, FictionBook 2, TSV, ODS and reStructuredText. Document formats are converted via Pandoc; spreadsheet formats via SheetJS.',
      open: false,
    },
    {
      question: 'Why does PDF output take longer?',
      answer: 'PDF output routes the OCR text through Pandoc and then the Typst WASM compiler to produce a properly typeset PDF. This requires loading the Typst runtime on first use.',
      open: false,
    },
  ];
}

export default {
  name: 'Ocr',
  components: { Card, Descriptor, Faq, Information },
  computed: {
    routeOutputFormat() {
      const f = (this.$route.params.outputFormat || 'txt').toLowerCase();
      return OCR_OUTPUT_FORMATS.find(fmt => fmt.name === f) ? f : 'txt';
    },
    selectedFormatInfo() {
      return OCR_OUTPUT_FORMATS.find(f => f.name === this.selectedOutputFormat) || OCR_OUTPUT_FORMATS[0];
    },
    selectedLanguageInfo() {
      return OCR_LANGUAGES.find(l => l.code === this.selectedLanguage) || OCR_LANGUAGES[0];
    },
    pageTitle() {
      return `OCR to ${this.selectedFormatInfo.title}`;
    },
    ocrOutputFormats() {
      return OCR_OUTPUT_FORMATS;
    },
    processable() {
      return this.files.filter(f => f.status === FILE_STATUS.initialized || f.status === FILE_STATUS.failed);
    },
    processed() {
      return this.files.filter(f => f.status === FILE_STATUS.processed);
    },
    running() {
      return this.files.some(f => f.status === FILE_STATUS.processing);
    },
    acceptAttr() {
      return ACCEPT_ATTR;
    },
  },
  created() {
    // Non-reactive worker references
    this.tesseractWorkerRef = null;
    this.tesseractLanguageRef = null;
    this.docWorkerRef = null;
    this.docWorkerReady = false;
    this.pendingConversions = new Map();
    this.nextConversionId = 0;
    this.pdfjsLibRef = null;
  },
  data() {
    useMeta({
      title: 'Free Online OCR Tool (Images & PDFs) - Conversion Today',
      meta: [
        {
          name: 'description',
          content: 'Extract text from images and PDFs using Tesseract OCR. Export as DOCX, PDF, EPUB, XLSX, CSV, TXT and more. 30+ languages, all processing in your browser.',
        },
      ],
      link: [{ rel: 'canonical', href: 'https://conversiontoday.com/ocr' }],
      htmlAttrs: { lang: 'en' },
    });
    return {
      FILE_STATUS,
      OCR_LANGUAGES,
      nextId: 0,
      files: [],
      unsupportedCount: 0,
      selectedOutputFormat: 'txt',
      selectedLanguage: 'eng',
      faqs: buildFaqs(),
    };
  },
  watch: {
    routeOutputFormat(newVal) {
      this.selectedOutputFormat = newVal;
    },
  },
  mounted() {
    this.selectedOutputFormat = this.routeOutputFormat;
    this.docWorkerRef = new DocWorkerClass();
    this.docWorkerRef.onmessage = (e) => this._handleDocWorkerMessage(e);
    this.docWorkerRef.postMessage({ action: 'load' });
  },
  beforeUnmount() {
    if (this.tesseractWorkerRef) {
      this.tesseractWorkerRef.terminate().catch(() => {});
      this.tesseractWorkerRef = null;
    }
    if (this.docWorkerRef) {
      this.docWorkerRef.terminate();
      this.docWorkerRef = null;
    }
    this.files.forEach(f => {
      if (f.output && f.output.url) URL.revokeObjectURL(f.output.url);
    });
  },
  methods: {
    // ── Event handlers ─────────────────────────────────────────────────────
    handleFormatChange(e) {
      const fmt = e.target.value;
      this.selectedOutputFormat = fmt;
      this.$router.push(`/ocr/${fmt}`);
    },
    onLanguageChange() {
      // Invalidate cached tesseract worker when language changes
      if (this.tesseractWorkerRef && this.tesseractLanguageRef !== this.selectedLanguage) {
        this.tesseractWorkerRef.terminate().catch(() => {});
        this.tesseractWorkerRef = null;
        this.tesseractLanguageRef = null;
      }
    },
    input(e) {
      this.addFiles(e.target.files);
      e.target.value = '';
    },
    toggleFaq(index) {
      this.faqs[index].open = !this.faqs[index].open;
    },

    // ── File management ────────────────────────────────────────────────────
    addFiles(fileList) {
      let skipped = 0;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const isPdf = ext === 'pdf' || file.type === 'application/pdf';
        const isImage = SUPPORTED_IMAGE_EXTS.has(ext) || (file.type && file.type.startsWith('image/'));
        if (!isPdf && !isImage) {
          skipped++;
          continue;
        }
        this.files.push({
          id: this.nextId++,
          name: file.name,
          originalFile: file,
          isPdf,
          status: FILE_STATUS.initialized,
          progress: 0,
          statusMessage: '',
          output: { blob: null, url: null, name: null },
        });
      }
      this.unsupportedCount += skipped;
    },
    removeFile(id) {
      const file = this.files.find(f => f.id === id);
      if (!file) return;
      if (file.output && file.output.url) URL.revokeObjectURL(file.output.url);
      this.files = this.files.filter(f => f.id !== id);
    },
    clearAll() {
      this.files.forEach(f => {
        if (f.output && f.output.url) URL.revokeObjectURL(f.output.url);
      });
      this.files = [];
      this.unsupportedCount = 0;
    },

    // ── Status helpers ─────────────────────────────────────────────────────
    statusLabel(status) {
      if (status === FILE_STATUS.initialized) return 'Waiting';
      if (status === FILE_STATUS.processing)  return 'Processing';
      if (status === FILE_STATUS.processed)   return 'Done';
      return 'Failed';
    },
    statusClass(status) {
      if (status === FILE_STATUS.initialized) return 'status-badge--waiting';
      if (status === FILE_STATUS.processing)  return 'status-badge--converting';
      if (status === FILE_STATUS.processed)   return 'status-badge--successful';
      return 'status-badge--failed';
    },

    // ── Tesseract helpers ──────────────────────────────────────────────────
    async _getTesseractWorker(language, onProgress) {
      if (this.tesseractWorkerRef && this.tesseractLanguageRef === language) {
        return this.tesseractWorkerRef;
      }
      if (this.tesseractWorkerRef) {
        await this.tesseractWorkerRef.terminate().catch(() => {});
        this.tesseractWorkerRef = null;
      }
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(language, 1, {
        workerPath: `${window.location.origin}/vendor/tesseract/worker.min.js`,
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        },
      });
      this.tesseractWorkerRef = worker;
      this.tesseractLanguageRef = language;
      return worker;
    },
    async _recognizeImage(imageBlob, language, onProgress) {
      const worker = await this._getTesseractWorker(language, onProgress);
      const { data } = await worker.recognize(imageBlob);
      return data.text || '';
    },

    // ── PDF rendering helpers ──────────────────────────────────────────────
    async _loadPdfJs() {
      if (this.pdfjsLibRef) return this.pdfjsLibRef;
      const workerSrc = `${window.location.origin}/vendor/pdfjs/pdf.worker.mjs`;
      const pdfjsLib = await import(/* webpackIgnore: true */ `${window.location.origin}/vendor/pdfjs/pdf.mjs`);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      this.pdfjsLibRef = pdfjsLib;
      return pdfjsLib;
    },
    async _renderPdfToImageBlobs(pdfBlob, onPageProgress) {
      const pdfjsLib = await this._loadPdfJs();
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const imageBlobs = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        imageBlobs.push(blob);
        if (onPageProgress) onPageProgress(i, pdf.numPages);
      }
      return imageBlobs;
    },

    // ── DocWorker helpers (for Pandoc output formats) ──────────────────────
    _handleDocWorkerMessage(e) {
      const { status, output, id } = e.data;
      if (status === 'loaded') {
        this.docWorkerReady = true;
      } else if (status === 'processed') {
        const pending = this.pendingConversions.get(id);
        if (pending) {
          this.pendingConversions.delete(id);
          pending.resolve(output);
        }
      } else if (status === 'failed') {
        const pending = this.pendingConversions.get(id);
        if (pending) {
          this.pendingConversions.delete(id);
          pending.reject(new Error('Pandoc conversion failed'));
        }
      }
    },
    _convertViaPandoc(textBlob, outputFormatConfig) {
      return new Promise((resolve, reject) => {
        const id = this.nextConversionId++;
        this.pendingConversions.set(id, { resolve, reject });
        const pandocFormatName = outputFormatConfig.pandocName || outputFormatConfig.name;
        this.docWorkerRef.postMessage({
          action: 'process',
          file: textBlob,
          config: {
            format: {
              name: pandocFormatName,
              extension: outputFormatConfig.extension,
              mimeType: outputFormatConfig.mimeType,
            },
            inputFormat: PLAIN_INPUT_FORMAT,
          },
          id,
        });
      });
    },

    // ── SheetJS helpers (for spreadsheet output formats) ──────────────────
    async _convertToSpreadsheet(text, outputFormat) {
      const XLSX = await import('@e965/xlsx').then(m => m.default || m);
      const lines = text.split('\n');
      const rows = lines.map(line => [line]);
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'OCR Results');

      if (outputFormat === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(ws);
        return new Blob([csv], { type: 'text/csv' });
      }
      if (outputFormat === 'tsv') {
        const tsv = XLSX.utils.sheet_to_csv(ws, { FS: '\t' });
        return new Blob([tsv], { type: 'text/tab-separated-values' });
      }
      // xlsx or ods
      const bookType = outputFormat === 'ods' ? 'ods' : 'xlsx';
      const data = XLSX.write(wb, { type: 'array', bookType });
      const mime = {
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ods:  'application/vnd.oasis.opendocument.spreadsheet',
      };
      return new Blob([data], { type: mime[outputFormat] || 'application/octet-stream' });
    },

    // ── Core OCR + conversion pipeline ────────────────────────────────────
    async _processFile(fileEntry) {
      const language = this.selectedLanguage;
      const outputFormat = this.selectedOutputFormat;
      const formatConfig = OCR_OUTPUT_FORMATS.find(f => f.name === outputFormat) || OCR_OUTPUT_FORMATS[0];

      fileEntry.status = FILE_STATUS.processing;
      fileEntry.progress = 0;
      fileEntry.statusMessage = 'Preparing…';

      try {
        let imageBlobs = [];

        if (fileEntry.isPdf) {
          fileEntry.statusMessage = 'Rendering PDF pages…';
          imageBlobs = await this._renderPdfToImageBlobs(
            fileEntry.originalFile,
            (page, total) => {
              fileEntry.statusMessage = `Rendering page ${page} of ${total}…`;
              fileEntry.progress = Math.round((page / total) * 20);
            }
          );
        } else {
          imageBlobs = [fileEntry.originalFile];
        }

        // OCR each image/page and combine
        const pageTexts = [];
        for (let i = 0; i < imageBlobs.length; i++) {
          const pageNum = i + 1;
          const totalPages = imageBlobs.length;
          fileEntry.statusMessage = totalPages > 1
            ? `Running OCR on page ${pageNum} of ${totalPages}…`
            : 'Running OCR…';

          const text = await this._recognizeImage(
            imageBlobs[i],
            language,
            (pct) => {
              const base = totalPages > 1 ? 20 + Math.round((i / totalPages) * 60) : 10;
              const span = totalPages > 1 ? Math.round(60 / totalPages) : 80;
              fileEntry.progress = base + Math.round((pct / 100) * span);
            }
          );
          pageTexts.push(text);
        }

        const combinedText = imageBlobs.length > 1
          ? pageTexts.map((t, i) => `=== Page ${i + 1} ===\n${t}`).join('\n\n')
          : pageTexts[0] || '';

        fileEntry.progress = 90;
        fileEntry.statusMessage = 'Converting output…';

        // Convert to selected output format
        let outputBlob;
        if (outputFormat === 'txt') {
          outputBlob = new Blob([combinedText], { type: 'text/plain' });
        } else if (formatConfig.isSpreadsheet) {
          outputBlob = await this._convertToSpreadsheet(combinedText, outputFormat);
        } else if (formatConfig.isPandoc) {
          const textBlob = new Blob([combinedText], { type: 'text/plain' });
          outputBlob = await this._convertViaPandoc(textBlob, formatConfig);
        } else {
          outputBlob = new Blob([combinedText], { type: 'text/plain' });
        }

        fileEntry.progress = 100;
        fileEntry.statusMessage = '';

        // Build output file name
        const baseName = fileEntry.name.replace(/\.[^/.]+$/, '');
        const outName = `${baseName}-ocr.${formatConfig.extension}`;

        if (fileEntry.output.url) URL.revokeObjectURL(fileEntry.output.url);
        fileEntry.output.blob = outputBlob;
        fileEntry.output.url  = URL.createObjectURL(outputBlob);
        fileEntry.output.name = outName;
        fileEntry.status = FILE_STATUS.processed;
      } catch (err) {
        console.error('[OCR] Error processing file:', err);
        fileEntry.status = FILE_STATUS.failed;
        fileEntry.statusMessage = err.message || 'OCR failed';
        fileEntry.progress = 0;
      }
    },

    async runAll() {
      const targets = this.processable.map(f => f.id);
      for (const id of targets) {
        const fileEntry = this.files.find(f => f.id === id);
        if (fileEntry) await this._processFile(fileEntry);
      }
    },

    // ── Download helpers ───────────────────────────────────────────────────
    downloadAll() {
      this.processed.forEach(file => {
        const a = document.createElement('a');
        a.href = file.output.url;
        a.download = file.output.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    },
    async downloadZip() {
      const zip = new JSZip();
      for (const file of this.processed) {
        if (file.output.blob) {
          zip.file(file.output.name, file.output.blob);
        }
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ocr-results.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

/* ── Language card ────────────────────────────────────────────────────────── */
.languageCard {
  padding: 1.25rem 1.5rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__select {
    width: 100%;
    padding: 0.45rem 0.85rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s;
    appearance: none;
    -webkit-appearance: none;

    &:hover  { border-color: var(--accent); }
    &:focus  { border-color: var(--border-focus); box-shadow: var(--shadow-focus); }
  }

  &__hint {
    margin: 0;
    font-size: 0.82rem;
    color: var(--text-secondary);
    line-height: 1.45;
  }
}

/* ── File input ───────────────────────────────────────────────────────────── */
.fileInput {
  display: block;
  max-width: 55rem;
  margin: 0 auto 1.5rem;
  cursor: pointer;

  input { display: none; }

  .file {
    border: 2px dashed var(--border);
    border-radius: $default-radius;
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary);
    transition: border-color 0.15s, background-color 0.15s;

    p { margin: 0; font-size: 1rem; }
  }

  &:hover .file,
  &:focus-within .file {
    border-color: var(--accent);
    background-color: var(--bg-surface);
  }
}

/* ── Batch action bar ─────────────────────────────────────────────────────── */
.batchBar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  max-width: 55rem;
  margin: 0 auto 1.25rem;

  &__button {
    padding: 0.55rem 1.15rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s;

    &:hover:not(:disabled) {
      border-color: var(--accent);
      background-color: var(--bg-surface-hover);
      box-shadow: var(--shadow-sm);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }
}

/* ── Notice ───────────────────────────────────────────────────────────────── */
.notice {
  max-width: 55rem;
  margin: 0 auto 1rem;
  padding: 0.6rem 1rem;
  background-color: var(--bg-surface);
  border-left: 3px solid var(--accent);
  border-radius: $default-radius;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

/* ── File list ────────────────────────────────────────────────────────────── */
.files {
  max-width: 55rem;
  margin: 0 auto 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fileRow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__message {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.15rem;
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 10rem;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
  }
}

/* ── Progress bar ─────────────────────────────────────────────────────────── */
.progressBar {
  flex: 1;
  height: 0.45rem;
  background-color: var(--bg-secondary);
  border-radius: 1rem;
  overflow: hidden;

  &__fill {
    height: 100%;
    background-color: var(--accent);
    border-radius: 1rem;
    transition: width 0.2s ease;
  }

  &__pct {
    font-size: 0.8rem;
    color: var(--text-secondary);
    width: 2.5rem;
    text-align: right;
    flex-shrink: 0;
  }
}

/* ── Status badges ────────────────────────────────────────────────────────── */
.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 0.9rem;
  letter-spacing: 0.03em;
  white-space: nowrap;

  &--waiting    { background-color: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border); }
  &--converting { background-color: rgba(3, 169, 244, 0.15); color: var(--accent); border: 1px solid rgba(3, 169, 244, 0.3); }
  &--successful { background-color: rgba(102, 187, 106, 0.15); color: var(--positive); border: 1px solid rgba(102, 187, 106, 0.3); }
  &--failed     { background-color: rgba(239, 83, 80, 0.12); color: var(--negative); border: 1px solid rgba(239, 83, 80, 0.25); }
}

/* ── Icon buttons ─────────────────────────────────────────────────────────── */
.iconButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: $default-radius;
  border: 1px solid var(--border);
  background: none;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  color: var(--text-secondary);
  text-decoration: none;

  svg {
    width: 1.1rem;
    height: 1.1rem;
    fill: currentColor;
  }

  &:hover:not(:disabled) {
    border-color: var(--accent);
    background-color: var(--bg-surface-hover);
    color: var(--accent);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

/* ── FAQ section ──────────────────────────────────────────────────────────── */
.faqSection {
  max-width: 55rem;
  margin: 0 auto 2rem;
  padding: 0 0.25rem;

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
}

@media only screen and (max-width: 55rem) {
  .fileInput,
  .batchBar,
  .files,
  .notice,
  .faqSection {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .fileRow {
    flex-direction: column;
    align-items: flex-start;

    &__actions {
      align-self: flex-end;
    }
  }
}
</style>
