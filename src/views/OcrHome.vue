<template>
  <descriptor>
    <template #header>OCR Tool</template>
    <template #description>
      Choose your OCR input type first, then pick output format and language in the tool.
      Processing stays local in your browser.
    </template>
  </descriptor>

  <div class="search-wrapper">
    <searchable-select
      :options="formatOptions"
      :model-value="selectedFormat"
      placeholder="Search & select input format…"
      @change="onFormatChange"
    />
  </div>

  <div class="selectorCon">
    <div class="selector" v-for="format in formats" :key="format.name">
      <a class="select" :href="format.href">
        <p>{{ format.label }}</p>
      </a>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Wide Format Support</template>
      <template #description>
        Convert JPG, PNG, GIF, BMP, WebP, TIFF and PDF files directly in your browser.
      </template>
    </information>
    <information>
      <template #header>Fast and Easy</template>
      <template #description>
        Pick an input type, choose your language and output format, then run OCR.
      </template>
    </information>
    <information>
      <template #header>Private Processing</template>
      <template #description>
        All OCR runs locally in your browser. Your files are never uploaded to a server.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">OCR FAQ</h3>
    <faq :faqs="faqs" @toggle="toggleFaq" />
  </div>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Faq from "@/components/faq.vue";
import Information from "@/components/information.vue";
import SearchableSelect from "@/components/searchable-select.vue";
import { useMeta } from "vue-meta";

const OCR_HOME_FORMATS = [
  { name: 'jpg', label: 'JPG', href: '/ocr/jpg/txt' },
  { name: 'png', label: 'PNG', href: '/ocr/png/txt' },
  { name: 'gif', label: 'GIF', href: '/ocr/gif/txt' },
  { name: 'bmp', label: 'BMP', href: '/ocr/bmp/txt' },
  { name: 'webp', label: 'WEBP', href: '/ocr/webp/txt' },
  { name: 'tiff', label: 'TIFF', href: '/ocr/tiff/txt' },
  { name: 'pdf', label: 'PDF', href: '/ocr/pdf/txt' },
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
      answer: 'Use the Language selector in the tool. When you switch languages, Tesseract loads the matching language data in the browser.',
      open: false,
    },
    {
      question: 'Can I batch-process multiple files?',
      answer: 'Yes. Add as many images or PDFs as you want, then run OCR on the full batch.',
      open: false,
    },
    {
      question: 'What output formats are available?',
      answer: 'You can export to TXT, DOCX, PDF, XLSX, CSV, EPUB, RTF, ODT, HTML, Markdown, LaTeX, Org, AsciiDoc, MediaWiki, Textile, DocBook, FictionBook 2, TSV, ODS and reStructuredText.',
      open: false,
    },
    {
      question: 'Why does PDF output take longer?',
      answer: 'PDF output routes the OCR text through Pandoc and then the Typst WASM compiler to produce a properly typeset PDF.',
      open: false,
    },
  ];
}

export default {
  name: 'OcrHome',
  components: { Descriptor, Faq, Information, SearchableSelect },
  data() {
    return {
      selectedFormat: 'jpg',
      formats: OCR_HOME_FORMATS,
      faqs: buildFaqs(),
    };
  },
  computed: {
    formatOptions() {
      return OCR_HOME_FORMATS.map((format) => ({
        value: format.name,
        label: format.label,
      }));
    },
  },
  setup() {
    useMeta({
      title: 'Free Online OCR Tool (Images & PDFs) - Conversion Today',
      meta: [
        {
          name: 'description',
          content:
            'Extract text from images and PDFs using Tesseract OCR. Export as DOCX, PDF, EPUB, XLSX, CSV, TXT and more. 30+ languages, all processing in your browser.',
        },
        { name: 'twitter:card', content: 'summary' },
        {
          name: 'twitter:title',
          content: 'Free Online OCR Tool - Conversion Today',
        },
        {
          name: 'twitter:description',
          content:
            'Extract text from images and PDFs with Tesseract OCR in your browser. Export to DOCX, PDF, XLSX, CSV, TXT and more.',
        },
        {
          property: 'og:title',
          content: 'Free Online OCR Tool - Conversion Today',
        },
        { property: 'og:site_name', content: 'Conversion Today' },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:description',
          content:
            'Extract text from images and PDFs with Tesseract OCR in your browser. Export to DOCX, PDF, XLSX, CSV, TXT and more.',
        },
      ],
      link: [{ rel: 'canonical', href: 'https://conversiontoday.com/ocr' }],
      htmlAttrs: { lang: 'en' },
    });
  },
  methods: {
    onFormatChange(value) {
      this.selectedFormat = value;
      const found = OCR_HOME_FORMATS.find((format) => format.name === value);
      if (found) window.location.href = found.href;
    },
    toggleFaq(index) {
      this.faqs[index].open = !this.faqs[index].open;
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.search-wrapper {
  @include mid-width;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
}

.selectorCon {
  @include mid-width;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
}

.selector {
  position: relative;
  margin: 0 0.2rem 0.4rem 0.2rem;

  .select {
    padding: 0.4rem 0.9rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    transition: 0.15s ease;
    display: inline-block;
    text-decoration: none;
    color: var(--text-primary);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background-color: var(--bg-surface-hover);
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    > p {
      transition: 0.1s ease;
      margin: 0;
    }
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
</style>