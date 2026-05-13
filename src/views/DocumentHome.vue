<template>
  <descriptor>
    <template #header>Document Converter</template>
    <template #description>
      Convert unlimited documents online for free. Supports 60+ document formats
      including Markdown, HTML, DOCX, ODT, LaTeX, EPUB, RST, Org-mode and more — all processed
      locally in your browser.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="document" name="from" mediaType="document"></format-selector>
  <div class="infomationContainer">
    <information>
      <template #header>60+ Format Support</template>
      <template #description>
        Convert between Markdown, HTML, DOCX, ODT, LaTeX, RST, Org-mode,
        EPUB, and 60+ document formats including wikis, bibliographies, notebooks, and more.
      </template>
    </information>
    <information>
      <template #header>Fast and Easy</template>
      <template #description>
        Drop your document files, choose an output format and click
        "Process All". Conversion happens entirely in your browser — no
        uploads needed.
      </template>
    </information>
    <information>
      <template #header>Truly Unlimited</template>
      <template #description>
        No limits on the number of files or file size. All conversions are
        completely free.
      </template>
    </information>
  </div>
  <div class="infomationContainer">
    <information>
      <template #header>Browser-based</template>
      <template #description>
        All document processing happens directly in your browser using the
        official Pandoc WebAssembly binary. Your files never leave your
        device.
      </template>
    </information>
    <information>
      <template #header>Universal Format Support</template>
      <template #description>
        Support for 30+ document formats including word processors, markup
        languages, e-books, and academic standards — all converted in your browser.
      </template>
    </information>
    <information>
      <template #header>Secure</template>
      <template #description>
        All files remain in your browser. No data is ever sent to a server.
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
      title: "Free Online Document Converter - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Convert documents online for free. No limits, no uploads. Supports 60+ document formats including Markdown, HTML, DOCX, ODT, LaTeX, RST, Org-mode, EPUB, and many more.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Document Converter - Conversion Today",
        },
        {
          name: "twitter:description",
          content:
            "Convert documents online for free. No limits, no uploads. Supports Markdown, HTML, DOCX, ODT, LaTeX and 30+ more formats.",
        },
        {
          name: "twitter:image",
          content: "https://conversiontoday.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Document Converter - Conversion Today",
        },
        { property: "og:site_name", content: "Conversion Today" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://conversiontoday.com/img/logo-conversion-today.png",
        },
        {
          property: "og:description",
          content:
            "Convert documents online for free. No limits, no uploads. Supports Markdown, HTML, DOCX, ODT, LaTeX and 30+ more formats.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/document" }],
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
