<template>
  <descriptor>
    <template #header>Font Converter</template>
    <template #description>
      Convert font files online for free. Supports TTF, OTF, WOFF, WOFF2, EOT and SVG fonts in your browser.
    </template>
  </descriptor>

  <div class="mediaTypeNav">
    <a class="mediaTypeNav__card" href="/image">🖼️ Image</a>
    <a class="mediaTypeNav__card" href="/audio">🎵 Audio</a>
    <a class="mediaTypeNav__card" href="/video">🎬 Video</a>
    <a class="mediaTypeNav__card" href="/document">📄 Document</a>
    <a class="mediaTypeNav__card" href="/archive">🗜️ Archive</a>
    <a class="mediaTypeNav__card mediaTypeNav__card--active" href="/font">🔤 Font</a>
  </div>

  <format-selector :isFrom="true" path="font" name="from" mediaType="font"></format-selector>
  <div class="infomationContainer">
    <information>
      <template #header>Broad Font Support</template>
      <template #description>
        Convert between TTF, OTF, WOFF, WOFF2, EOT and SVG font formats with in-browser processing.
      </template>
    </information>
    <information>
      <template #header>Smart Engine Priority</template>
      <template #description>
        Uses fonteditor-core first for overlapping formats and falls back to FontForge WASM when needed.
      </template>
    </information>
    <information>
      <template #header>No Uploads</template>
      <template #description>
        All font conversion runs locally in your browser. Your font files remain on your device.
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
  name: "FontHome",
  setup() {
    useMeta({
      title: "Free Online Font Converter - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Convert font files online for free in your browser. Supports TTF, OTF, WOFF, WOFF2, EOT and SVG font formats.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/font" }],
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
  flex-wrap: wrap;

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
  }
}
</style>
