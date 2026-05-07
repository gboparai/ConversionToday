<template>
  <descriptor>
    <template #header>Document Converter</template>
    <template #description>
      Convert unlimited documents online for free. Supports 60+ document formats
      including Markdown, HTML, DOCX, ODT, LaTeX, EPUB, RST, Org-mode and more — all processed
      locally in your browser.
    </template>
  </descriptor>

  <div class="mediaTypeNav">
    <a class="mediaTypeNav__card" href="/image">🖼️ Image</a>
    <a class="mediaTypeNav__card" href="/audio">🎵 Audio</a>
    <a class="mediaTypeNav__card" href="/video">🎬 Video</a>
    <a class="mediaTypeNav__card mediaTypeNav__card--active" href="/document">📄 Document</a>
    <a class="mediaTypeNav__card" href="/archive">🗜️ Archive</a>
  </div>

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

.mediaTypeNav {
  @include mid-width;
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.5rem;

  &__card {
    flex: 1;
    max-width: 10rem;
    text-align: center;
    padding: 0.6rem 1rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--text-primary);
    text-decoration: none;
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
    box-shadow: var(--shadow-sm);

    &:hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    &--active {
      border-color: var(--accent);
      font-weight: 900;
    }
  }
}

@media only screen and (max-width: 55rem) {
  .mediaTypeNav {
    padding: 0 1.25rem;
    flex-wrap: wrap;
  }
}
</style>
