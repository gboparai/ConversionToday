<template>
  <descriptor>
    <template #header>Free PDF Splitter — Split PDF into Pages Online</template>
    <template #description>
      Split any PDF into individual pages free online. Download every page as a separate PDF, packaged in a ZIP. No file size limit, no upload, no signup — runs entirely in your browser.
    </template>
  </descriptor>

  <file-picker
    :disabled="!!pdfFile"
    :filter-fn="filterPdfFiles"
    fallback-accept=".pdf,application/pdf"
    label="a PDF"
    overlay-text="Drop to Split"
    @files-selected="handleFilesSelected"
  />

  <p v-if="pdfFile" class="fileInput__notice">
    One PDF is already loaded. Remove it to load a different file.
  </p>



  <div class="settingsBar" v-if="pdfFile">
    <div class="settingsCard">
      <div class="familySelector" style="margin-bottom: 0;">
        <button
          class="familySelector__button"
          :class="{ 'familySelector__button--active': splitMode === 'all' }"
          type="button"
          @click="splitMode = 'all'"
        >
          Extract All Pages
        </button>
        <button
          class="familySelector__button"
          :class="{ 'familySelector__button--active': splitMode === 'specific' }"
          type="button"
          @click="splitMode = 'specific'"
        >
          Extract Specific Pages
        </button>
      </div>

      <div v-if="splitMode === 'specific'" class="settingsCard__item" style="margin-top: 1rem;">
        <span class="settingsCard__label">Page Range</span>
        <div class="inputWrap">
          <input
            class="inputWrap__input"
            type="text"
            v-model="pageRange"
            placeholder="e.g. 1, 3, 5-10"
            :disabled="isProcessing"
          />
        </div>
        <p class="settingsCard__hint">Enter page numbers and/or ranges separated by commas.</p>
      </div>
    </div>
  </div>

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

  <error-card :show="hasError" :message="errorMessage" />

  <div v-if="outputPages.length > 0" class="resultsCard">
    <p class="resultsCard__summary">
      ✅ Split into <strong>{{ outputPages.length }}</strong> file{{ outputPages.length > 1 ? 's' : '' }}.
      Download the ZIP above or individual files below.
    </p>
    <div class="pageList">
      <div v-for="page in outputPages" :key="page.name" class="fileRow">
        <div class="fileRow__copy">
          <div class="fileRow__name">{{ page.name }}</div>
        </div>
        <a class="iconButton iconButton--download" :href="page.url" :download="page.name" title="Download page" aria-label="Download page">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        </a>
      </div>
    </div>
  </div>



  <div class="files" v-if="pdfFile">
    <div class="fileRow">
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    </div>
  </div>

  <div class="informationContainer">
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
import ErrorCard from '@/components/errorCard.vue';
import { useMeta } from 'vue-meta';

import FilePicker from '@/components/file-picker.vue';

export default {
  name: 'PdfSplit',
  components: { FilePicker, Descriptor, Information, Faq, ErrorCard },

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
      splitMode: 'all',
      pageRange: '',
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
      if (!this.pdfFile || this.isProcessing) return false;
      if (this.splitMode === 'specific' && !this.pageRange.trim()) return false;
      return true;
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

    filterPdfFiles(fileList) {
      const accepted = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'pdf' || file.type === 'application/pdf') {
          accepted.push(file);
        }
      }
      return accepted;
    },

    handleFilesSelected(accepted) {
      if (this.pdfFile) return;
      if (accepted.length > 0) {
        this.loadFile(accepted[0]);
      }
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

        let targetPages = [];
        let groups = [];
        if (this.splitMode === 'all') {
          for (let i = 0; i < totalPages; i++) {
            groups.push({ label: String(i + 1), pages: [i + 1] });
          }
        } else {
          groups = this.parsePageGroups(this.pageRange, totalPages);
          if (groups.length === 0) {
            throw new Error('No valid pages selected based on your range.');
          }
        }

        const count = groups.length;
        for (let idx = 0; idx < count; idx++) {
          const group = groups[idx];
          const zeroIndexedPages = group.pages.map(p => p - 1);

          this.statusMessage = `Extracting ${group.label} (${idx + 1} of ${count})…`;
          this.progress = Math.round((idx / count) * 90);

          const pageDoc = await PDFDocument.create();
          const copiedPages = await pageDoc.copyPages(srcDoc, zeroIndexedPages);
          copiedPages.forEach(p => pageDoc.addPage(p));
          
          const pageBytes = await pageDoc.save();
          const blob = new Blob([pageBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          const prefix = group.pages.length > 1 ? 'pages' : 'page';
          const paddedLabel = group.pages.length === 1 
            ? String(group.pages[0]).padStart(String(totalPages).length, '0')
            : group.label;
          const name = `${baseName}-${prefix}-${paddedLabel}.pdf`;

          pages.push({ name, blob, url });
          zip.file(name, pageBytes);

          // Yield to UI every 5 operations to avoid freezing
          if (idx % 5 === 4) await new Promise(r => setTimeout(r, 0));
        }

        this.statusMessage = 'Packaging ZIP…';
        this.progress = 95;

        const zipBytes = await zip.generateAsync({ type: 'blob' });
        this.zipBlob = zipBytes;
        this.zipUrl = URL.createObjectURL(zipBytes);
        this.zipName = `${baseName}-split.zip`;

        this.outputPages = pages;
        this.progress = 100;
        this.statusMessage = `Done — ${count} file${count > 1 ? 's' : ''} extracted.`;
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

    parsePageGroups(rangeStr, maxPage) {
      const groups = [];
      const parts = rangeStr.split(',').map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            const group = [];
            for (let i = Math.max(1, start); i <= Math.min(maxPage, end); i++) {
              group.push(i);
            }
            if (group.length > 0) groups.push({ label: `${group[0]}-${group[group.length - 1]}`, pages: group });
          }
        } else {
          const num = Number(part);
          if (!isNaN(num) && num >= 1 && num <= maxPage) {
            groups.push({ label: `${num}`, pages: [num] });
          }
        }
      }
      return groups;
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
  display: block;
  height: 9rem;
  margin-bottom: 1rem;
  position: relative;
  cursor: pointer;
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);

  > .file {
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
    border-radius: $default-radius;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-surface);
    border: 2px dashed var(--border);
    color: var(--text-secondary);
    font-size: 1rem;
    font-weight: 700;
  }
  &:hover > .file {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
    color: var(--text-primary);
  }
  &:active > .file {
    transform: translateY(0);
  }
  > input {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    z-index: -1;
  }
  > input:focus + .file {
    transition: 0.1s ease;
    box-shadow: 0 0 0 2px var(--border-focus);
  }

  &--disabled {
    pointer-events: none;
    cursor: not-allowed;

    > .file {
      opacity: 0.5;
    }
  }

  &__notice {
    @include mid-width;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
}

.files {
  @include mid-width;
  margin-bottom: 1.5rem;
}

.settingsBar {
  @include mid-width;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.settingsCard {
  padding: 1.25rem 1.5rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  &__label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__hint {
    margin: 0.35rem 0 0;
    color: var(--text-secondary);
    font-size: 0.8rem;
  }
}

.familySelector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;

  &__button {
    flex: 1;
    padding: 0.55rem 0.95rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-weight: 700;
    cursor: pointer;
    font-size: 0.9rem;
    font-family: inherit;
    transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s, background-color 0.15s;

    &:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    &--active {
      background-color: var(--accent);
      border-color: var(--accent);
      color: var(--accent-text, #fff);
      cursor: default;
      transform: none;
      box-shadow: none;
    }
  }
}

.inputWrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: $default-radius;
  background-color: var(--bg-primary);
  transition: border-color 0.15s;

  &:focus-within {
    border-color: var(--accent);
  }

  &__input {
    flex: 1;
    padding: 0.55rem 0.75rem;
    border: none;
    background: none;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;

    &:disabled {
      opacity: 0.5;
    }
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
    min-width: 120px;
    border: none;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0;
    cursor: pointer;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: var(--shadow-sm);

    > div {
      background-color: var(--bg-secondary);
      padding: 0.55rem 1rem;
      border-radius: $default-radius;
      height: 100%;
      transition: background-color 0.15s, transform 0.15s;
    }

    &[disabled] {
      cursor: not-allowed;
      opacity: 0.4;
    }
    &:not([disabled]):hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-md);
      > div {
        background-color: var(--bg-surface-hover);
        transform: translateY(-2px);
      }
    }
    &:not([disabled]):active > div {
      transform: translateY(0);
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
  max-height: 22rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.25rem;
}

.fileRow {
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
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
  }

  &--remove {
    background: var(--negative);
    color: #fff;
  }

  &--download {
    background: var(--positive);
    color: var(--positive-text);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not([disabled]):hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
