<template>
  <descriptor>
    <template #header>Image Compression</template>
    <template #description>
      Compress JPG, PNG, WEBP and AVIF files online for free. All processing
      happens locally in your browser — no uploads, no limits.
    </template>
  </descriptor>

  <div class="formatGrid">
    <a class="formatCard" href="/compression/jpg">
      <span class="formatCard__ext">JPG</span>
      <span class="formatCard__label">Compress JPEG</span>
    </a>
    <a class="formatCard" href="/compression/png">
      <span class="formatCard__ext">PNG</span>
      <span class="formatCard__label">Compress PNG</span>
    </a>
    <a class="formatCard" href="/compression/webp">
      <span class="formatCard__ext">WEBP</span>
      <span class="formatCard__label">Compress WebP</span>
    </a>
    <a class="formatCard" href="/compression/avif">
      <span class="formatCard__ext">AVIF</span>
      <span class="formatCard__label">Compress AVIF</span>
    </a>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>4 Formats Supported</template>
      <template #description>
        Compress JPEG, PNG, WebP and AVIF images with browser-based tools tuned
        for smaller file sizes and clean visual results.
      </template>
    </information>
    <information>
      <template #header>Fast and Easy</template>
      <template #description>
        Drop your images, hit Compress All and download. A before/after slider
        preview lets you compare quality before saving.
      </template>
    </information>
    <information>
      <template #header>Truly Unlimited</template>
      <template #description>
        No daily limits, no file size caps and no signups required. Compress as
        many images as you need, completely free.
      </template>
    </information>
  </div>
  <div class="infomationContainer">
    <information>
      <template #header>Browser-based</template>
      <template #description>
        All compression runs in your browser using WebAssembly codecs. Your
        images never leave your device.
      </template>
    </information>
    <information>
      <template #header>Preview</template>
      <template #description>
        Compare the compressed and original image side-by-side with an
        interactive slider before downloading.
      </template>
    </information>
    <information>
      <template #header>Batch Download</template>
      <template #description>
        Download all compressed images individually or grab them all at once
        as a single ZIP file.
      </template>
    </information>
  </div>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import { useMeta } from "vue-meta";
export default {
  name: "CompressionHome",
  components: { Descriptor, Information },
  setup() {
    useMeta({
      title: "Free Online Image Compression (JPG, PNG, WEBP, AVIF) - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Compress JPG, PNG, WEBP and AVIF images online for free. Browser-based with no uploads. Before/after preview and batch ZIP download.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Image Compression - Conversion Today",
        },
        {
          name: "twitter:description",
          content:
            "Compress JPG, PNG, WEBP and AVIF images online for free with local browser processing.",
        },
        {
          name: "twitter:image",
          content: "https://conversiontoday.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Image Compression - Conversion Today",
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
            "Compress JPG, PNG, WEBP and AVIF images online for free with local browser processing.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/compression" }],
      htmlAttrs: { lang: "en" },
    });
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.formatGrid {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.formatCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.9rem 1.5rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  text-decoration: none;
  color: var(--text-primary);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  box-shadow: var(--shadow-sm);
  min-width: 7rem;

  &:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &__ext {
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: 0.04em;
  }

  &__label {
    font-size: 0.78rem;
    color: var(--text-secondary);
  }
}

</style>
