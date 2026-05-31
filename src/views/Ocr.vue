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
      :formats="ocrInputFormats"
      :selectedFormat="selectedInputFormat"
      :handleChange="handleInputFormatChange"
    >
      <template #header>{{ selectedInputInfo.title }}</template>
      <template #description>{{ selectedInputInfo.description }}</template>
    </card>

    <card
      path="/ocr"
      :formats="ocrOutputFormats"
      :selectedFormat="selectedOutputFormat"
      :handleChange="handleFormatChange"
    >
      <template #header>{{ selectedFormatInfo.title }}</template>
      <template #description>{{ selectedFormatInfo.description }}</template>
    </card>

  </div>

  <div class="languageBar">
    <div class="languageCard">
      <label class="languageCard__label" for="ocrLanguageSelect">OCR Language</label>
      <div id="ocrLanguageSelect" class="languageCard__searchable">
        <searchable-select
          :options="languageOptions"
          :model-value="selectedLanguage"
          :full-width="true"
          @change="onLanguageChange"
        />
      </div>
    </div>
  </div>

  <label class="fileInput">
    <input @change="input" type="file" multiple :accept="acceptAttr" />
    <div class="file">
      <p>{{ dropLabel }}</p>
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
      :disabled="files.length <= 0 && !hasOutput"
      @click="clearAll"
    >
      <div>Clear All</div>
    </button>
  </div>

  <p v-if="unsupportedCount > 0" class="notice">
    {{ unsupportedCount }} file(s) were skipped. {{ skipHelpText }}
  </p>

  <div v-if="running || files.length > 0 || hasOutput" class="progressCard">
    <div class="progressCard__top">
      <strong>{{ running ? 'OCR in progress' : hasOutput ? 'OCR complete' : 'OCR queue ready' }}</strong>
      <span>{{ overallProgress }}%</span>
    </div>
    <div class="progressBar">
      <div class="progressBar__fill" :style="{ width: overallProgress + '%' }"></div>
    </div>
    <p>{{ progressSummary }}</p>
  </div>

  <div class="downloadCard" v-if="hasOutput">
    <div>
      <strong>{{ output.name }}</strong>
      <p>Your combined OCR output is ready.</p>
    </div>
    <a :href="output.url" :download="output.name">Download</a>
  </div>

  <div class="files">
    <p v-if="files.length > 1" class="queueHint">Each processed file can be downloaded individually or in bulk.</p>
    <div v-for="file in files" :key="file.id" class="fileRow">
      <transition name="fade">
        <div v-if="file.status === FILE_STATUS.processing" class="processingBar">
          <div class="processingBar__fill" :style="{ width: file.progress + '%' }"></div>
        </div>
      </transition>
      <div class="fileRow__info">
        <div class="fileRow__name">{{ file.name }}</div>
        <div v-if="file.statusMessage" class="fileRow__message">{{ file.statusMessage }}</div>
      </div>
      <div class="fileRow__actions">
        <span :class="['status-badge', statusClass(file.status)]">{{ statusLabel(file.status) }}</span>
        <a
          v-if="file.output && file.output.url"
          class="iconButton"
          :href="file.output.url"
          :download="file.output.name"
          title="Download"
          aria-label="Download file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7z"/>
          </svg>
        </a>
        <button
          class="iconButton iconButton--remove"
          :disabled="file.status === FILE_STATUS.processing || running"
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

  <div class="informationContainer">
    <information>
      <template #header>Step 1</template>
      <template #description>
        Choose your OCR language and output format, then add your files.
      </template>
    </information>
    <information>
      <template #header>Step 2</template>
      <template #description>
        Click Run OCR on All to process the full batch in your browser.
      </template>
    </information>
    <information>
      <template #header>Step 3</template>
      <template #description>
        Download each result individually, download all results, or download a ZIP.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <div>
      <h3 class="supportedConversionsTitle">Supported OCR Conversions</h3>
      <input
        v-model="ocrConversionSearch"
        class="supportedConversionsSearch"
        type="search"
        placeholder="Filter OCR conversions (example: bmp, txt, pdf)"
        aria-label="Filter supported OCR conversions"
      />
      <div class="supportedConversionsListContainter">
        <list :listOptions="ocrInputList" />
        <list :listOptions="ocrOutputList" />
      </div>
    </div>
  </div>
</template>

<script>
import JSZip from "jszip";
import Card from "@/components/card.vue";
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import List from "@/components/list.vue";
import SearchableSelect from "@/components/searchable-select.vue";
import { FILE_STATUS } from "@/js/constants";
import { useMeta } from "vue-meta";
import DocWorkerClass from "worker-loader!@/js/doc-worker.js";

const SUPPORTED_IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif']);
const OCR_INPUT_FORMATS = [
  {
    name: 'jpg',
    title: 'JPG',
    description: 'OCR from JPG images.',
    accept: '.jpg,.jpeg,image/jpeg',
    inputType: 'image',
    allowedExts: ['jpg', 'jpeg'],
    allowedMime: ['image/jpeg'],
  },
  {
    name: 'png',
    title: 'PNG',
    description: 'OCR from PNG images.',
    accept: '.png,image/png',
    inputType: 'image',
    allowedExts: ['png'],
    allowedMime: ['image/png'],
  },
  {
    name: 'gif',
    title: 'GIF',
    description: 'OCR from GIF images.',
    accept: '.gif,image/gif',
    inputType: 'image',
    allowedExts: ['gif'],
    allowedMime: ['image/gif'],
  },
  {
    name: 'bmp',
    title: 'BMP',
    description: 'OCR from BMP images.',
    accept: '.bmp,image/bmp',
    inputType: 'image',
    allowedExts: ['bmp'],
    allowedMime: ['image/bmp'],
  },
  {
    name: 'webp',
    title: 'WebP',
    description: 'OCR from WebP images.',
    accept: '.webp,image/webp',
    inputType: 'image',
    allowedExts: ['webp'],
    allowedMime: ['image/webp'],
  },
  {
    name: 'tiff',
    title: 'TIFF',
    description: 'OCR from TIFF images.',
    accept: '.tif,.tiff,image/tiff',
    inputType: 'image',
    allowedExts: ['tif', 'tiff'],
    allowedMime: ['image/tiff'],
  },
  {
    name: 'pdf',
    title: 'PDF',
    description: 'OCR from PDF pages rendered in-browser.',
    accept: '.pdf,application/pdf',
    inputType: 'pdf',
    allowedExts: ['pdf'],
    allowedMime: ['application/pdf'],
  },
];

const OCR_OUTPUT_FORMATS = [
  { name: 'txt',       extension: 'txt',      title: 'Plain Text',           description: 'Simple plain text extracted by OCR.',                                                           mimeType: 'text/plain',                                                                           isPandoc: false, isSpreadsheet: false },
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

const OCR_TEXT_INPUT_FORMAT = { name: 'markdown', extension: 'md', mimeType: 'text/markdown' };

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

export default {
  name: 'Ocr',
  components: { Card, Descriptor, Information, List, SearchableSelect },
  computed: {
    routeInputFormat() {
      const f = (this.$route.params.inputFormat || 'jpg').toLowerCase();
      if (f === 'image') return 'jpg';
      return OCR_INPUT_FORMATS.find(fmt => fmt.name === f) ? f : 'jpg';
    },
    routeOutputFormat() {
      const f = (this.$route.params.outputFormat || 'txt').toLowerCase();
      return OCR_OUTPUT_FORMATS.find(fmt => fmt.name === f) ? f : 'txt';
    },
    selectedInputInfo() {
      return OCR_INPUT_FORMATS.find(f => f.name === this.selectedInputFormat) || OCR_INPUT_FORMATS[0];
    },
    selectedFormatInfo() {
      return OCR_OUTPUT_FORMATS.find(f => f.name === this.selectedOutputFormat) || OCR_OUTPUT_FORMATS[0];
    },
    selectedLanguageInfo() {
      return OCR_LANGUAGES.find(l => l.code === this.selectedLanguage) || OCR_LANGUAGES[0];
    },
    languageOptions() {
      return OCR_LANGUAGES.map((lang) => ({
        value: lang.code,
        label: lang.name,
      }));
    },
    pageTitle() {
      return `${this.selectedInputInfo.title} OCR to ${this.selectedFormatInfo.title}`;
    },
    ocrInputFormats() {
      return OCR_INPUT_FORMATS.map((f) => ({ name: f.name }));
    },
    ocrOutputFormats() {
      return OCR_OUTPUT_FORMATS;
    },
    ocrInputList() {
      const query = this.ocrConversionSearch.trim().toLowerCase();
      return OCR_INPUT_FORMATS
        .filter((format) => {
          if (format.name === this.selectedInputFormat) return false;
          if (!query) return true;
          const itemText = `${format.name} ${format.title} ${this.selectedOutputFormat}`.toLowerCase();
          return itemText.includes(query);
        })
        .map((format, index) => {
          return `<a href="/ocr/${format.name}/${this.selectedOutputFormat}">${index + 1}. ${format.title} to ${this.selectedFormatInfo.title}</a>`;
        });
    },
    ocrOutputList() {
      const query = this.ocrConversionSearch.trim().toLowerCase();
      return OCR_OUTPUT_FORMATS
        .filter((format) => {
          if (format.name === this.selectedOutputFormat) return false;
          if (!query) return true;
          const itemText = `${this.selectedInputFormat} ${format.name} ${format.title}`.toLowerCase();
          return itemText.includes(query);
        })
        .map((format, index) => {
          return `<a href="/ocr/${this.selectedInputFormat}/${format.name}">${index + 1}. ${this.selectedInputInfo.title} to ${format.title}</a>`;
        });
    },
    processable() {
      return this.files.filter(f => f.status === FILE_STATUS.initialized || f.status === FILE_STATUS.failed);
    },
    processed() {
      return this.files.filter(f => f.status === FILE_STATUS.processed);
    },
    running() {
      return this.files.some(f => f.status === FILE_STATUS.processing) || this.isBuildingOutput;
    },
    hasOutput() {
      return !!(this.output && this.output.url);
    },
    overallProgress() {
      if (this.hasOutput && !this.running) return 100;
      if (this.files.length === 0) return 0;
      const total = this.files.reduce((sum, file) => sum + (Number(file.progress) || 0), 0);
      const avg = Math.round(total / this.files.length);
      if (this.isBuildingOutput) return Math.min(99, Math.max(avg, 95));
      return avg;
    },
    progressSummary() {
      const processedCount = this.processed.length;
      const failedCount = this.files.filter(f => f.status === FILE_STATUS.failed).length;
      if (this.isBuildingOutput) {
        return `OCR finished for ${processedCount} file(s). Building combined ${this.selectedFormatInfo.extension.toUpperCase()} output…`;
      }
      if (this.running) {
        return `${processedCount} completed, ${failedCount} failed, ${this.processable.length} waiting.`;
      }
      if (this.hasOutput) {
        return `Done. ${processedCount} file(s) OCR-processed and combined into one output file.`;
      }
      if (this.files.length === 0) return 'Add files to begin OCR.';
      return `${processedCount} completed, ${failedCount} failed, ${this.files.length} total.`;
    },
    dropLabel() {
      if (this.selectedInputInfo.inputType === 'pdf') return 'Add PDFs Here';
      return `Add ${this.selectedInputInfo.title} Images Here`;
    },
    skipHelpText() {
      if (this.selectedInputInfo.inputType === 'pdf') return 'Supported input is PDF only.';
      return `Supported input is ${this.selectedInputInfo.title} only.`;
    },
    acceptAttr() {
      return this.selectedInputInfo.accept;
    },
  },
  created() {
    // Non-reactive worker references
    this.tesseractWorkerRef = null;
    this.tesseractLanguageRef = null;
    this.tesseractProgressCallback = null;
    this.docWorkerRef = null;
    this.docWorkerReady = false;
    this.pendingConversions = new Map();
    this.nextConversionId = 0;
    this.pdfjsLibRef = null;
  },
  data() {
    useMeta({
      title: 'Free Online OCR Tool (Images & PDFs) - No Limit Converter',
      meta: [
        {
          name: 'description',
          content: 'Extract text from images and PDFs using Tesseract OCR. Export as DOCX, PDF, EPUB, XLSX, CSV, TXT and more. 30+ languages, all processing in your browser.',
        },
        {
          name: "keywords",
          content: "free ocr tool, extract text from image, pdf ocr online, tesseract ocr browser, image to text converter, online document ocr",
        },
      ],
      link: [{ rel: 'canonical', href: 'https://nolimitconverter.com/ocr' }],
      htmlAttrs: { lang: 'en' },
    });
    return {
      FILE_STATUS,
      OCR_LANGUAGES,
      nextId: 0,
      files: [],
      unsupportedCount: 0,
      selectedInputFormat: 'jpg',
      selectedOutputFormat: 'txt',
      selectedLanguage: 'eng',
      isBuildingOutput: false,
      output: { blob: null, url: null, name: null },
      ocrConversionSearch: '',
    };
  },
  watch: {
    routeInputFormat(newVal) {
      this.selectedInputFormat = newVal;
    },
    routeOutputFormat(newVal) {
      this.selectedOutputFormat = newVal;
    },
  },
  mounted() {
    this.selectedInputFormat = this.routeInputFormat;
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
    this.files.forEach((file) => {
      if (file.output && file.output.url) URL.revokeObjectURL(file.output.url);
    });
    this.clearCombinedOutput();
  },
  methods: {
    clearCombinedOutput() {
      if (this.output && this.output.url) URL.revokeObjectURL(this.output.url);
      this.output = { blob: null, url: null, name: null };
    },
    // ── Event handlers ─────────────────────────────────────────────────────
    handleInputFormatChange(e) {
      const fmt = e.target.value;
      this.selectedInputFormat = fmt;
      this.clearCombinedOutput();
      this.$router.push(`/ocr/${fmt}/${this.selectedOutputFormat}`);
    },
    handleFormatChange(e) {
      const fmt = e.target.value;
      this.selectedOutputFormat = fmt;
      this.clearCombinedOutput();
      this.$router.push(`/ocr/${this.selectedInputFormat}/${fmt}`);
    },
    onLanguageChange(value) {
      if (value) this.selectedLanguage = value;
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
    // ── File management ────────────────────────────────────────────────────
    addFiles(fileList) {
      this.clearCombinedOutput();
      let skipped = 0;
      const selectedInput = this.selectedInputInfo;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const isPdf = ext === 'pdf' || file.type === 'application/pdf';
        const isImage = SUPPORTED_IMAGE_EXTS.has(ext) || (file.type && file.type.startsWith('image/'));
        if (selectedInput.inputType === 'pdf' && !isPdf) {
          skipped++;
          continue;
        }
        if (selectedInput.inputType === 'image' && !isImage) {
          skipped++;
          continue;
        }
        const mime = (file.type || '').toLowerCase();
        const matchesSelectedType = selectedInput.allowedExts.includes(ext)
          || (selectedInput.allowedMime || []).includes(mime);
        if (selectedInput.inputType === 'image' && !matchesSelectedType) {
          skipped++;
          continue;
        }
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
          ocrText: '',
          output: { blob: null, url: null, name: null },
        });
      }
      this.unsupportedCount += skipped;
    },
    removeFile(id) {
      const file = this.files.find(f => f.id === id);
      if (!file) return;
      if (file.output && file.output.url) URL.revokeObjectURL(file.output.url);
      this.clearCombinedOutput();
      this.files = this.files.filter(f => f.id !== id);
    },
    clearAll() {
      this.files.forEach((file) => {
        if (file.output && file.output.url) URL.revokeObjectURL(file.output.url);
      });
      this.clearCombinedOutput();
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
      this.tesseractProgressCallback = onProgress || null;
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
        corePath: `${window.location.origin}/vendor/tesseract-core`,
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        logger: (m) => {
          const progressCallback = this.tesseractProgressCallback;
          if (m.status === 'recognizing text' && progressCallback) {
            progressCallback(Math.round(m.progress * 100));
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
            inputFormat: OCR_TEXT_INPUT_FORMAT,
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

      if (fileEntry.output && fileEntry.output.url) {
        URL.revokeObjectURL(fileEntry.output.url);
      }
      fileEntry.output = { blob: null, url: null, name: null };

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

        fileEntry.ocrText = combinedText;
        fileEntry.output = {
          blob: outputBlob,
          url: URL.createObjectURL(outputBlob),
          name: outName,
        };
        fileEntry.status = FILE_STATUS.processed;
      } catch (err) {
        console.error('[OCR] Error processing file:', err);
        fileEntry.status = FILE_STATUS.failed;
        fileEntry.statusMessage = err.message || 'OCR failed';
        fileEntry.progress = 0;
      }
    },

    async runAll() {
      this.clearCombinedOutput();
      const targets = this.processable.map(f => f.id);
      if (targets.length <= 0) return;

      // Warm the selected language before processing files so first-run download cost is paid upfront.
      const queuedFiles = this.files.filter(f => targets.includes(f.id));
      queuedFiles.forEach((file) => {
        file.statusMessage = 'Loading OCR language data…';
      });
      try {
        await this._getTesseractWorker(this.selectedLanguage);
      } catch (error) {
        queuedFiles.forEach((file) => {
          file.status = FILE_STATUS.failed;
          file.progress = 0;
          file.statusMessage = error?.message || 'Failed to load OCR language data';
        });
        return;
      }

      for (const id of targets) {
        const fileEntry = this.files.find(f => f.id === id);
        if (fileEntry) await this._processFile(fileEntry);
      }
      const successful = this.files.filter(f => f.status === FILE_STATUS.processed && f.ocrText);
      if (successful.length <= 0) return;

      this.isBuildingOutput = true;
      try {
        const formatConfig = OCR_OUTPUT_FORMATS.find(f => f.name === this.selectedOutputFormat) || OCR_OUTPUT_FORMATS[0];
        const combinedText = successful
          .map((file, idx) => `=== File ${idx + 1}: ${file.name} ===\n${file.ocrText}`)
          .join('\n\n');

        let outputBlob;
        if (this.selectedOutputFormat === 'txt') {
          outputBlob = new Blob([combinedText], { type: 'text/plain' });
        } else if (formatConfig.isSpreadsheet) {
          outputBlob = await this._convertToSpreadsheet(combinedText, this.selectedOutputFormat);
        } else if (formatConfig.isPandoc) {
          const textBlob = new Blob([combinedText], { type: 'text/plain' });
          outputBlob = await this._convertViaPandoc(textBlob, formatConfig);
        } else {
          outputBlob = new Blob([combinedText], { type: 'text/plain' });
        }

        const inputLabel = this.selectedInputInfo.name;
        const outName = `ocr-${inputLabel}-combined.${formatConfig.extension}`;
        this.output = {
          blob: outputBlob,
          url: URL.createObjectURL(outputBlob),
          name: outName,
        };
      } finally {
        this.isBuildingOutput = false;
      }
    },

    // ── Download helpers ───────────────────────────────────────────────────
    downloadAll() {
      this.processed.forEach((file) => {
        if (!file.output || !file.output.url) return;
        const a = document.createElement('a');
        a.download = file.output.name;
        a.href = file.output.url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    },
    async downloadZip() {
      const zip = new JSZip();
      this.processed.forEach((file) => {
        if (!file.output || !file.output.blob) return;
        zip.file(file.output.name, file.output.blob);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);
      const outputExt = this.selectedFormatInfo.extension;
      const inputLabel = this.selectedInputInfo.name;
      const a = document.createElement('a');
      a.download = `ocr-${inputLabel}-${outputExt}-results.zip`;
      a.href = zipUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.languageBar {
  @include mid-width;
  margin-bottom: 1rem;
}

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

  &__searchable {
    width: 100%;
  }

  &__hint {
    margin: 0;
    font-size: 0.82rem;
    color: var(--text-secondary);
    line-height: 1.45;
  }
}

.fileInput {
  @include mid-width;
  display: block;
  height: 9rem;
  margin-bottom: 1rem;
  position: relative;
  cursor: pointer;
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);

  > input {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    z-index: -1;
  }

  > .file {
    height: 100%;
    border: 2px dashed var(--border);
    border-radius: $default-radius;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-surface);
    color: var(--text-secondary);
    font-size: 1rem;
    font-weight: 700;
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;

    p { margin: 0; font-size: 1rem; }
  }

  &:hover > .file {
    transform: translateY(-3px);
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
    color: var(--text-primary);
  }
}

.batchBar {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.25rem;

  &__button {
    flex: 1;
    min-width: 150px;
    border: 1px solid var(--border);
    background-color: var(--bg-surface);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0;
    cursor: pointer;
    box-shadow: var(--shadow-sm);

    > div {
      background-color: var(--bg-secondary);
      padding: 0.55rem 1rem;
      border-radius: $default-radius;
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }
}

.notice {
  @include mid-width;
  margin-top: 0;
  margin-bottom: 0.85rem;
  padding: 0.6rem 1rem;
  background-color: var(--bg-surface);
  border-left: 3px solid var(--accent);
  border-radius: $default-radius;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.queueHint {
  margin-top: 0;
  margin-bottom: 0.85rem;
  color: var(--text-secondary);
}

.progressCard,
.downloadCard {
  @include mid-width;
  margin-bottom: 1rem;
  padding: 1rem 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
}

.progressCard {
  &__top {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  p {
    margin: 0.75rem 0 0;
    color: var(--text-secondary);
  }
}

.downloadCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  p {
    margin: 0.35rem 0 0;
    color: var(--text-secondary);
  }

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 7.5rem;
    padding: 0.65rem 1rem;
    border-radius: $default-radius;
    background-color: var(--accent);
    color: var(--accent-text);
    text-decoration: none;
    font-weight: 800;
  }
}

.files {
  @include mid-width;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.fileRow {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.8rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;

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

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
  }
}

.processingBar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0.3rem;
  z-index: 0;
  background-color: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  pointer-events: none;

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e 0%, #06b6d4 100%);
    transition: width 0.2s ease;
  }
}

.progressBar {
  height: 0.55rem;
  border-radius: 999px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.08);

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e 0%, #06b6d4 100%);
    transition: width 0.2s ease;
  }
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;

  &--waiting    { background-color: var(--bg-surface-hover); color: var(--text-secondary); }
  &--converting { background-color: var(--accent); color: var(--accent-text); }
  &--successful { background-color: var(--positive); color: var(--positive-text); }
  &--failed     { background-color: var(--negative); color: #fff; }
}

.iconButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  text-decoration: none;
  color: #fff;
  background: var(--positive);

  svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
  }

  &--remove {
    background: var(--negative);
  }

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: var(--shadow-sm);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.supportedConversionsTitle {
  @include mid-width;
  text-align: center;
  font-size: 1.75rem;
  margin-top: 1.75rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.supportedConversionsSearch {
  display: block;
  width: min(28rem, 100%);
  margin: 0 auto 0.85rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: $default-radius;
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.supportedConversionsSearch:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
  outline: none;
}

.supportedConversionsListContainter {
  display: flex;
  justify-content: stretch;
  gap: 2rem;
  flex-direction: row;
}

@media only screen and (max-width: 55rem) {
  .downloadCard,
  .fileRow {
    flex-direction: column;
    align-items: flex-start;
  }

  .downloadCard a {
    width: 100%;
  }

  .supportedConversionsListContainter {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
