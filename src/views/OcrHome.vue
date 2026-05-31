<template>
  <descriptor>
    <template #header>Free Online OCR — Extract Text from Images & PDFs</template>
    <template #description>
      Extract text from images and PDFs free online — 30+ languages, no file size limit, no signup. Export to DOCX, PDF, XLSX, TXT, CSV and more.
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
      <template #header>OCR Unlimited Files at Once</template>
      <template #description>
        Run OCR on multiple images or PDFs at once. No need to process files one at a time — add as many as you need and extract all text at once. No daily limits.
      </template>
    </information>
    <information>
      <template #header>30+ Languages Supported</template>
      <template #description>
        Supports English, Spanish, French, German, Chinese, Arabic, Hindi, Japanese, Korean, Portuguese, Russian and many more languages.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Extract text from large high-resolution images and multi-page PDFs without any file size restrictions.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>20+ Export Formats</template>
      <template #description>
        Export extracted text as DOCX, PDF, XLSX, CSV, TXT, HTML, Markdown, EPUB, ODT, RTF, LaTeX, Org-mode and more.
      </template>
    </information>
    <information>
      <template #header>100% Free, No Signup</template>
      <template #description>
        Every OCR conversion is completely free. No account, no email, no credit card required. No daily limits or quotas.
      </template>
    </information>
    <information>
      <template #header>Your Files Stay Private</template>
      <template #description>
        Files are processed directly in your browser and never uploaded to any server. Your images and documents stay on your device.
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
      title: "Free Online OCR Tool — Extract Text from Images & PDFs | No Limit Converter",
      meta: [
        {
          name: 'description',
          content:
            "Extract text from images and PDFs free online. No file size limit, no signup, 30+ languages. Export to DOCX, PDF, XLSX, TXT, CSV and more. Unlimited OCR conversions.",
        },
        {
          name: 'keywords',
          content:
            "free ocr, extract text from image, online ocr, image to text free, pdf to text free, ocr free online, no limit ocr, extract text free",
        },
        { name: 'twitter:card', content: 'summary' },
        {
          name: 'twitter:title',
          content: "Free Online OCR Tool — Extract Text from Images & PDFs | No Limit Converter",
        },
        {
          name: 'twitter:description',
          content:
            "Extract text from images and PDFs free online. No file size limit, no signup, 30+ languages. Unlimited OCR conversions.",
        },
        {
          property: 'og:title',
          content: "Free Online OCR Tool — Extract Text from Images & PDFs | No Limit Converter",
        },
        { property: 'og:site_name', content: 'No Limit Converter' },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:description',
          content:
            "Extract text from images and PDFs free online. No file size limit, no signup, 30+ languages. Unlimited OCR conversions.",
        },
      ],
      link: [{ rel: 'canonical', href: 'https://nolimitconverter.com/ocr' }],
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