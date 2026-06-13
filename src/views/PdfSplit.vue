<template>
  <descriptor>
    <template #header>Free PDF Splitter — Split PDF into Pages Online</template>
    <template #description>
      Split any PDF into individual pages free online. Download every page as a separate PDF, packaged in a ZIP. No file size limit, no upload, no signup — runs entirely in your browser.
    </template>
  </descriptor>

  <label
    class="fileInput"
    :class="{ 'fileInput--disabled': !!pdfFile }"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <input
      type="file"
      accept=".pdf,application/pdf"
      :disabled="!!pdfFile"
      @change="onInputChange"
    />
    <div class="file">
      <p v-if="!pdfFile">Drop a PDF here or click to browse</p>
      <p v-else>{{ pdfFile.name }}</p>
    </div>
  </label>

  <p v-if="pdfFile" class="notice">
    One PDF is already loaded. Remove it to load a different file.
  </p>

  <div class="batchBar">
    <button class="batchBar__button" :disabled="!canProcess" @click="process">
      <div>Split PDF</div>
    </button>
    <button class="batchBar__button" :disabled="!canDownload" @click="downloadZip">
      <div>Download ZIP</div>
    </button>
    <button class="batchBar__button" :disabled="!canClear" @click="clearAll">
      <div>Clear</div>
    </button>
  </div>

  <div v-if="showProgress" class="progressCard">
    <div class="progressCard__top">
      <strong>{{ statusHeading }}</strong>
      <span>{{ progress }}%</span>
    </div>
    <div class="progressBar">
      <div class="progressBar__fill" :style="{ width: progress + '%' }"></div>
    </div>
    <p>{{ statusMessage }}</p>
  </div>

  <div v-if="hasError" class="errorCard">
    <strong>⚠️ Error</strong>
    <p>{{ errorMessage }}</p>
  </div>

  <div v-if="outputPages.length > 0" class="resultsCard">
    <p class="resultsCard__summary">
      ✅ Split into <strong>{{ outputPages.length }}</strong> page{{ outputPages.length > 1 ? 's' : '' }}.
      Download the ZIP above or individual pages below.
    </p>
    <div class="pageList">
      <div v-for="page in outputPages" :key="page.name" class="fileRow">
        <div class="fileRow__copy">
          <div class="fileRow__name">{{ page.name }}</div>
        </div>
        <a class="iconButton iconButton--download" :href="page.url" :download="page.name" title="Download page" aria-label="Download page">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  </div>

  <div v-if="pdfFile" class="fileRow fileRow--loaded">
    <div class="fileRow__copy">
      <div class="fileRow__name">{{ pdfFile.name }}</div>
      <div class="fileRow__meta" v-if="pageCount">{{ pageCount }} pages</div>
    </div>
    <button
      class="iconButton iconButton--remove"
      type="button"
      :disabled="isProcessing"
      @click="clearAll"
      title="Remove"
      aria-label="Remove file"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>Split Any PDF Instantly</template>
      <template #description>
        Upload any PDF and split it into individual pages in seconds. Each page becomes its own separate PDF file, ready to use independently.
      </template>
    </information>
    <information>
      <template #header>Download as a ZIP</template>
      <template #description>
        All split pages are bundled into a single ZIP file for easy download. Or download individual pages one at a time directly from the results list.
      </template>
    </information>
    <information>
      <template #header>100% Private — No Upload</template>
      <template #description>
        Your PDF never leaves your device. All splitting happens locally in your browser using pdf-lib. No server, no signup, no data collection.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">PDF Splitter FAQ</h3>
    <faq :faqs="faqs" @toggle="toggleFaq" />
  </div>
</template>

<script>
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import Descriptor from '@/components/descriptor.vue';
import Information from '@/components/information.vue';
import Faq from '@/components/faq.vue';
import { useMeta } from 'vue-meta';

export default {
  name: 'PdfSplit',
  components: { Descriptor, Information, Faq },

  data() {
    useMeta({
      title: 'Free PDF Splitter — Split PDF into Pages Online | No Limit Converter',
      meta: [
        {
          name: 'description',
          content: 'Split any PDF into individual pages free online. Download as separate PDFs in a ZIP. No file size limit, no signup, no upload — runs entirely in your browser.',
        },
        {
          name: 'keywords',
          content: 'pdf splitter, split pdf online, split pdf into pages, pdf page extractor, free pdf split, no limit pdf splitter',
        },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Free PDF Splitter — Split PDF into Pages Online | No Limit Converter' },
        { name: 'twitter:description', content: 'Split any PDF into individual pages online for free. Download as a ZIP. No limits, no signup.' },
        { property: 'og:title', content: 'Free PDF Splitter — Split PDF into Pages Online | No Limit Converter' },
        { property: 'og:site_name', content: 'No Limit Converter' },
        { property: 'og:type', content: 'website' },
        { property: 'og:description', content: 'Split any PDF into individual pages online for free. No file size limit, no signup, runs entirely in your browser.' },
      ],
      link: [{ rel: 'canonical', href: 'https://nolimitconverter.com/pdf-split' }],
      htmlAttrs: { lang: 'en', amp: true },
    });

    return {
      pdfFile: null,
      pageCount: 0,
      isProcessing: false,
      progress: 0,
      statusMessage: '',
      hasError: false,
      errorMessage: '',
      outputPages: [],   // [{ name, blob, url }]
      zipBlob: null,
      zipUrl: null,
      zipName: null,
      faqs: [
        {
          question: 'How do I split a PDF into individual pages?',
          answer: 'Drop your PDF onto the page or click to browse, then click "Split PDF". The tool will extract every page as a separate PDF file and bundle them in a ZIP for download.',
          open: false,
        },
        {
          question: 'Is there a file size or page count limit?',
          answer: 'No. There are no limits on the size of the PDF or the number of pages. All processing happens in your browser using your own device\'s resources.',
          open: false,
        },
        {
          question: 'Can I split a password-protected PDF?',
          answer: 'Password-protected PDFs cannot be split without first unlocking them. Use the PDF Password tool to remove the password first, then split the resulting file.',
          open: false,
        },
        {
          question: 'Are my files uploaded anywhere?',
          answer: 'No. The entire splitting process runs locally in your browser using pdf-lib. Your PDF never leaves your device.',
          open: false,
        },
        {
          question: 'Can I download individual pages instead of the whole ZIP?',
          answer: 'Yes. After splitting, each page is listed individually with its own Download button. You can also click "Download ZIP" to get all pages at once.',
          open: false,
        },
      ],
    };
  },

  computed: {
    canProcess() {
      return !!this.pdfFile && !this.isProcessing;
    },
    canDownload() {
      return this.outputPages.length > 0 && !this.isProcessing;
    },
    canClear() {
      return (!!this.pdfFile || this.outputPages.length > 0) && !this.isProcessing;
    },
    showProgress() {
      return this.isProcessing || (this.statusMessage && !this.hasError && this.outputPages.length > 0);
    },
    statusHeading() {
      if (this.isProcessing) return 'Splitting PDF…';
      if (this.outputPages.length > 0) return 'Split complete';
      return '';
    },
  },

  beforeUnmount() {
    this.revokeUrls();
  },

  methods: {
    revokeUrls() {
      this.outputPages.forEach(p => { if (p.url) URL.revokeObjectURL(p.url); });
      if (this.zipUrl) URL.revokeObjectURL(this.zipUrl);
    },

    onInputChange(event) {
      const file = event.target.files[0];
      event.target.value = '';
      if (file) this.loadFile(file);
    },

    onDragOver(event) {
      event.dataTransfer.dropEffect = this.pdfFile ? 'none' : 'copy';
    },

    onDrop(event) {
      if (this.pdfFile) return;
      const file = event.dataTransfer.files[0];
      if (file) this.loadFile(file);
    },

    loadFile(file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext !== 'pdf' && file.type !== 'application/pdf') {
        this.hasError = true;
        this.errorMessage = `"${file.name}" is not a PDF file. Please select a .pdf file.`;
        return;
      }
      this.hasError = false;
      this.errorMessage = '';
      this.outputPages = [];
      this.revokeUrls();
      this.zipBlob = null;
      this.zipUrl = null;
      this.zipName = null;
      this.progress = 0;
      this.statusMessage = '';
      this.pdfFile = file;
      this.pageCount = 0;
      // Quick page count peek
      this.peekPageCount(file);
    },

    async peekPageCount(file) {
      try {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        this.pageCount = doc.getPageCount();
      } catch {
        this.pageCount = 0;
      }
    },

    async process() {
      if (!this.pdfFile) return;
      this.isProcessing = true;
      this.hasError = false;
      this.errorMessage = '';
      this.outputPages = [];
      this.revokeUrls();
      this.zipBlob = null;
      this.zipUrl = null;
      this.progress = 0;
      this.statusMessage = 'Loading PDF…';

      try {
        const bytes = await this.pdfFile.arrayBuffer();
        const srcDoc = await PDFDocument.load(bytes);
        const totalPages = srcDoc.getPageCount();
        this.pageCount = totalPages;

        if (totalPages === 0) {
          throw new Error('The PDF has no pages.');
        }

        const baseName = this.pdfFile.name.replace(/\.pdf$/i, '');
        const pages = [];
        const zip = new JSZip();

        for (let i = 0; i < totalPages; i++) {
          this.statusMessage = `Extracting page ${i + 1} of ${totalPages}…`;
          this.progress = Math.round(((i) / totalPages) * 90);

          const pageDoc = await PDFDocument.create();
          const [copiedPage] = await pageDoc.copyPages(srcDoc, [i]);
          pageDoc.addPage(copiedPage);
          const pageBytes = await pageDoc.save();
          const blob = new Blob([pageBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const padded = String(i + 1).padStart(String(totalPages).length, '0');
          const name = `${baseName}-page-${padded}.pdf`;

          pages.push({ name, blob, url });
          zip.file(name, pageBytes);

          // Yield to UI every 5 pages to avoid freezing
          if (i % 5 === 4) await new Promise(r => setTimeout(r, 0));
        }

        this.statusMessage = 'Packaging ZIP…';
        this.progress = 95;

        const zipBytes = await zip.generateAsync({ type: 'blob' });
        this.zipBlob = zipBytes;
        this.zipUrl = URL.createObjectURL(zipBytes);
        this.zipName = `${baseName}-split.zip`;

        this.outputPages = pages;
        this.progress = 100;
        this.statusMessage = `Done — ${totalPages} pages extracted.`;
      } catch (err) {
        this.hasError = true;
        this.errorMessage = err.message || 'Failed to split the PDF. The file may be corrupted or password-protected.';
        this.progress = 0;
        this.statusMessage = '';
      } finally {
        this.isProcessing = false;
      }
    },

    downloadZip() {
      if (!this.zipUrl) return;
      const a = document.createElement('a');
      a.href = this.zipUrl;
      a.download = this.zipName;
      a.click();
    },

    clearAll() {
      this.revokeUrls();
      this.pdfFile = null;
      this.pageCount = 0;
      this.outputPages = [];
      this.zipBlob = null;
      this.zipUrl = null;
      this.zipName = null;
      this.isProcessing = false;
      this.hasError = false;
      this.errorMessage = '';
      this.progress = 0;
      this.statusMessage = '';
    },

    toggleFaq(index) {
      this.faqs[index].open = !this.faqs[index].open;
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.fileInput {
  @include mid-width;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border);
  border-radius: $default-radius;
  padding: 2.5rem 1.5rem;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  margin-bottom: 1rem;

  &:hover {
    border-color: var(--accent);
    background-color: var(--bg-surface);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  input[type='file'] {
    display: none;
  }

  .file p {
    margin: 0;
    text-align: center;
    color: var(--text-secondary);
    font-size: 1rem;
  }
}

.notice {
  @include mid-width;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.batchBar {
  @include mid-width;
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;

  &__button {
    padding: 0.6rem 1.4rem;
    border: 1px solid var(--border);
    border-radius: $default-radius;
    background-color: var(--bg-surface);
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s;

    &:hover:not(:disabled) {
      background-color: var(--bg-surface-hover);
      border-color: var(--accent);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }
}

.progressCard {
  @include mid-width;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  padding: 1.25rem;
  margin-bottom: 1.25rem;

  &__top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.6rem;
    font-size: 0.95rem;
  }

  p {
    margin: 0.5rem 0 0;
    color: var(--text-secondary);
    font-size: 0.85rem;
  }
}

.progressBar {
  height: 6px;
  background-color: var(--border);
  border-radius: 3px;
  overflow: hidden;

  &__fill {
    height: 100%;
    background-color: var(--accent);
    transition: width 0.2s ease;
    border-radius: 3px;
  }
}

.errorCard {
  @include mid-width;
  background-color: var(--bg-surface);
  border: 1px solid #e74c3c;
  border-radius: $default-radius;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  color: #e74c3c;

  strong {
    display: block;
    margin-bottom: 0.35rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

.resultsCard {
  @include mid-width;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  padding: 1.25rem;
  margin-bottom: 1.25rem;

  &__summary {
    margin: 0 0 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
}

.pageList {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.fileRow {
  @include mid-width;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  margin-bottom: 0.4rem;

  &--loaded {
    margin-bottom: 1.25rem;
  }

  &__copy {
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

  &__meta {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.1rem;
  }
}

.iconButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: $default-radius;
  border: 1px solid var(--border);
  background: none;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.15s, border-color 0.15s, background-color 0.15s;
  flex-shrink: 0;
  text-decoration: none;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background-color: var(--bg-surface-hover);
  }

  &--remove:hover {
    border-color: #e74c3c;
    color: #e74c3c;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.faqSection {
  @include mid-width;
  margin-top: 1.75rem;
  margin-bottom: 2rem;
  padding: 0 0.25rem;

  &__title {
    text-align: center;
    font-size: 1.75rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
}

@media only screen and (max-width: 55rem) {
  .fileInput {
    margin: 0 1.25rem 1rem;
  }
  .batchBar {
    padding: 0 1.25rem;
  }
}
</style>
