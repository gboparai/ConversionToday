<template>
  <descriptor>
    <template #header>Free Online Document Converter — Unlimited, No Signup</template>
    <template #description>
      Convert DOCX, PDF, Markdown, HTML, EPUB, LaTeX and 60+ document formats free online. No file size limit, no daily caps, no registration.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="document" name="from" mediaType="document"></format-selector>

  <div class="informationContainer">
    <information>
      <template #header>60+ Document Formats — All Free</template>
      <template #description>
        Convert between DOCX, PDF, Markdown, HTML, EPUB, ODT, LaTeX, RST, Org-mode, PPTX, XLSX, CSV, RTF, wiki formats, e-books, academic formats and many more — all free.
      </template>
    </information>
    <information>
      <template #header>Convert Unlimited Documents</template>
      <template #description>
        Drop multiple documents at once and convert the entire batch with a single click. No cap on file count. Ideal for converting large collections of reports, notes or books.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Convert large documents, lengthy reports, entire books or complex notebooks without hitting any file size cap. No paid plan needed.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>2,600+ Document Conversion Pairs</template>
      <template #description>
        With 60+ supported formats, No Limit Converter provides over 2,600 possible document conversion combinations — all free, no signup required.
      </template>
    </information>
    <information>
      <template #header>100% Free — No Account Needed</template>
      <template #description>
        No signup, no email, no credit card required. Every document conversion is completely free with no daily limits or quotas.
      </template>
    </information>
    <information>
      <template #header>Private & Secure — Files Never Leave Your Device</template>
      <template #description>
        Documents are processed directly in your browser and never uploaded to any server. Your sensitive files stay on your device.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Convert DOCX to PDF, Markdown & More</template>
      <template #description>
        Popular conversions include DOCX to PDF, PDF to DOCX, Markdown to HTML, HTML to EPUB, LaTeX to PDF, and thousands more — all free online.
      </template>
    </information>
    <information>
      <template #header>No Software to Install</template>
      <template #description>
        No Microsoft Office, no LibreOffice, no app download required. Works in any modern browser on Windows, Mac, Linux, iOS and Android.
      </template>
    </information>
    <information>
      <template #header>Academic & Technical Formats Supported</template>
      <template #description>
        Convert LaTeX, BibTeX, reStructuredText, DocBook, Org-mode, AsciiDoc, JATS and other academic formats. Ideal for researchers, students and writers.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Document Converter FAQ</h3>
    <faq :faqs="faqs" @toggle="toggleFaq" />
  </div>
</template>

<script>
import FormatSelector from "@/components/format-selector.vue";
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import Faq from "@/components/faq.vue";
import { useMeta } from "vue-meta";
export default {
  name: "DocumentHome",
  data() {
    return {
      faqs: [
        {
          question: "What document formats can I convert for free?",
          answer: "You can convert between 60+ formats including DOCX, PDF, Markdown, HTML, EPUB, ODT, LaTeX, RST, PPTX, XLSX, CSV, RTF, AsciiDoc, MediaWiki, and many more.",
          open: false,
        },
        {
          question: "Can I convert DOCX to PDF for free?",
          answer: "Yes. Select DOCX as input, add your files, choose PDF as output, and convert. No signup, no watermarks, no file size limit.",
          open: false,
        },
        {
          question: "Is there a file size limit?",
          answer: "No. Convert documents of any size — lengthy reports, entire books, large spreadsheets — with no restrictions.",
          open: false,
        },
        {
          question: "How many documents can I convert at once?",
          answer: "There is no limit on file count. Convert as many documents as you need in a single batch with no daily caps.",
          open: false,
        },
        {
          question: "Do I need Microsoft Office installed?",
          answer: "No. All document processing happens in your browser using Pandoc WebAssembly. No desktop software is required.",
          open: false,
        },
        {
          question: "Are my documents uploaded to a server?",
          answer: "No. All processing happens locally in your browser. Your documents are never uploaded anywhere — they stay on your device.",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Free Online Document Converter — No Limits, No Signup | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert DOCX, PDF, Markdown, HTML, EPUB, LaTeX and 60+ document formats free online. No file size limit, no signup, unlimited conversions. Private browser-based document converter.",
        },
        {
          name: "keywords",
          content:
            "free document converter, convert docx to pdf, online document converter, pdf converter free, markdown to html, convert documents free, no limit document converter",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Document Converter — No Limits, No Signup | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert DOCX, PDF, Markdown, HTML, EPUB, LaTeX and 60+ document formats free online. No file size limit, no signup, unlimited conversions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Document Converter — No Limits, No Signup | No Limit Converter",
        },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:description",
          content:
            "Convert DOCX, PDF, Markdown, HTML, EPUB, LaTeX and 60+ document formats free online. No file size limit, no signup, unlimited conversions.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/document" }],
      htmlAttrs: { lang: "en", amp: true },
    });
  },
  components: {
    FormatSelector,
    Descriptor,
    Information,
    Faq,
  },
  methods: {
    toggleFaq(index) {
      this.faqs[index].open = !this.faqs[index].open;
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

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
