<template>
  <descriptor>
    <template #header>Free Bulk Document Converter Online</template>
    <template #description>
      Batch convert DOCX, PDF, Markdown, HTML, EPUB, LaTeX and 60+ document formats — free, no file size limit, no restrictions.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="document" name="from" mediaType="document"></format-selector>

  <div class="infomationContainer">
    <information>
      <template #header>60+ Document Formats</template>
      <template #description>
        Convert between DOCX, PDF, Markdown, HTML, EPUB, ODT, LaTeX, RST, Org-mode, PPTX, XLSX, CSV, RTF, wiki formats, e-books, academic formats and many more.
      </template>
    </information>
    <information>
      <template #header>Batch Document Conversion</template>
      <template #description>
        Drop multiple documents at once and convert the entire batch with a single click. Ideal for converting large collections of reports, notes or books.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Convert large documents, lengthy reports, entire books or complex notebooks without hitting any file size cap.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>2,600+ Document Conversion Pairs</template>
      <template #description>
        With 60+ supported formats, No Limit Converter provides over 2,600 possible document conversion combinations — all free.
      </template>
    </information>
    <information>
      <template #header>100% Free, No Signup</template>
      <template #description>
        No account, no email, no credit card required. Every document conversion is completely free with no daily limits.
      </template>
    </information>
    <information>
      <template #header>Your Documents Stay Private</template>
      <template #description>
        Documents are processed directly in your browser and never uploaded to any server. Your sensitive files stay on your device.
      </template>
    </information>
  </div>
</template>

<script>
import FormatSelector from "@/components/format-selector.vue";
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import { useMeta } from "vue-meta";
export default {
  name: "DocumentHome",
  setup() {
    useMeta({
      title: "Free Bulk Document Converter Online - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Batch convert DOCX, PDF, Markdown, HTML, EPUB, ODT, LaTeX and 60+ document formats for free. No file size limit. Bulk convert documents with no restrictions.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Bulk Document Converter Online - No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Batch convert DOCX, PDF, Markdown, HTML, EPUB, ODT, LaTeX and 60+ document formats for free. No file size limit. Bulk convert documents with no restrictions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Bulk Document Converter Online - No Limit Converter",
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
            "Batch convert DOCX, PDF, Markdown, HTML, EPUB, ODT, LaTeX and 60+ document formats for free. No file size limit. Bulk convert documents with no restrictions.",
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
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

</style>
