<template>
  <descriptor>
    <template #header>OCR Tool</template>
    <template #description>
      Extract text from images and PDFs using Tesseract OCR. Upload files, choose a language and output format,
      then download your recognized text.
    </template>
  </descriptor>

  <div class="formatGrid">
    <a class="formatCard" href="/ocr/txt">
      <span class="formatCard__ext">TXT</span>
      <span class="formatCard__label">Plain text — fastest, no conversion</span>
    </a>
    <a class="formatCard" href="/ocr/docx">
      <span class="formatCard__ext">DOCX</span>
      <span class="formatCard__label">Microsoft Word document</span>
    </a>
    <a class="formatCard" href="/ocr/pdf">
      <span class="formatCard__ext">PDF</span>
      <span class="formatCard__label">PDF document from OCR text</span>
    </a>
    <a class="formatCard" href="/ocr/xlsx">
      <span class="formatCard__ext">XLSX</span>
      <span class="formatCard__label">Excel spreadsheet (one line per row)</span>
    </a>
    <a class="formatCard" href="/ocr/csv">
      <span class="formatCard__ext">CSV</span>
      <span class="formatCard__label">Comma-separated values</span>
    </a>
    <a class="formatCard" href="/ocr/epub">
      <span class="formatCard__ext">EPUB</span>
      <span class="formatCard__label">EPUB ebook</span>
    </a>
    <a class="formatCard" href="/ocr/rtf">
      <span class="formatCard__ext">RTF</span>
      <span class="formatCard__label">Rich Text Format</span>
    </a>
    <a class="formatCard" href="/ocr/odt">
      <span class="formatCard__ext">ODT</span>
      <span class="formatCard__label">OpenDocument text</span>
    </a>
    <a class="formatCard" href="/ocr/html">
      <span class="formatCard__ext">HTML</span>
      <span class="formatCard__label">HTML document</span>
    </a>
    <a class="formatCard" href="/ocr/markdown">
      <span class="formatCard__ext">MD</span>
      <span class="formatCard__label">Markdown</span>
    </a>
  </div>

  <p class="moreFormats">
    More output formats available in the tool: RST, LaTeX, Org, AsciiDoc, MediaWiki, Textile, DocBook, FictionBook 2, TSV, ODS.
  </p>

  <div class="informationContainer">
    <information>
      <template #header>30+ Languages</template>
      <template #description>
        Choose from English, French, German, Spanish, Chinese, Japanese, Arabic, Russian and many more Tesseract-supported languages.
      </template>
    </information>
    <information>
      <template #header>Images &amp; PDFs</template>
      <template #description>
        Supports JPG, PNG, GIF, BMP, WebP, TIFF, and multi-page PDF files. PDF pages are rendered individually before OCR.
      </template>
    </information>
    <information>
      <template #header>20+ Output Formats</template>
      <template #description>
        Export OCR results as DOCX, PDF, EPUB, RTF, ODT, XLSX, CSV and many more formats powered by Pandoc and SheetJS.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Step 1</template>
      <template #description>
        Choose the output format you want and click its card to open the OCR tool.
      </template>
    </information>
    <information>
      <template #header>Step 2</template>
      <template #description>
        Select the OCR language, add your image or PDF files, and click "Run OCR on All".
      </template>
    </information>
    <information>
      <template #header>Step 3</template>
      <template #description>
        Download each result individually or grab all files as a single ZIP archive.
      </template>
    </information>
  </div>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import { useMeta } from "vue-meta";

export default {
  name: "OcrHome",
  components: { Descriptor, Information },
  setup() {
    useMeta({
      title: "Free Online OCR Tool (Images & PDFs) - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Extract text from images and PDFs using Tesseract OCR. Export as DOCX, PDF, EPUB, XLSX, CSV, TXT and more. 30+ languages, all processing in your browser.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online OCR Tool - Conversion Today",
        },
        {
          name: "twitter:description",
          content:
            "Extract text from images and PDFs with Tesseract OCR in your browser. Export to DOCX, PDF, XLSX, CSV, TXT and more.",
        },
        {
          property: "og:title",
          content: "Free Online OCR Tool - Conversion Today",
        },
        { property: "og:site_name", content: "Conversion Today" },
        { property: "og:type", content: "website" },
        {
          property: "og:description",
          content:
            "Extract text from images and PDFs with Tesseract OCR in your browser. Export to DOCX, PDF, XLSX, CSV, TXT and more.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/ocr" }],
      htmlAttrs: { lang: "en" },
    });
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.formatGrid {
  @include mid-width;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.formatCard {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  text-decoration: none;
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;

  &:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &__ext {
    font-size: 0.95rem;
    font-weight: 900;
    letter-spacing: 0.05em;
  }

  &__label {
    color: var(--text-secondary);
    font-size: 0.83rem;
    line-height: 1.45;
  }
}

.moreFormats {
  @include mid-width;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1.75rem;
  padding: 0 0.25rem;
}
</style>
