<template>
  <descriptor>
    <template #header>Free Online Image Compression — Unlimited, No Signup</template>
    <template #description>
      Compress JPG, PNG, WEBP and AVIF images free online. No file size limits, no daily caps, before/after quality preview.
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
      <template #header>Compress Unlimited Images at Once</template>
      <template #description>
        Compress hundreds of images at once and download them all as a single ZIP file. No cap on file count. Ideal for optimizing image libraries or web assets.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Compress large high-resolution images, RAW photos and graphic files without any size caps. No paid plan required.
      </template>
    </information>
    <information>
      <template #header>Before/After Quality Preview</template>
      <template #description>
        Compare the compressed result against the original with an interactive side-by-side slider before downloading. Adjust quality to your liking.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>4 Image Formats Supported</template>
      <template #description>
        Compress JPEG, PNG, WebP and AVIF images. Each format uses the best compression algorithm for smaller file sizes and clean visual results.
      </template>
    </information>
    <information>
      <template #header>100% Free, No Signup</template>
      <template #description>
        No account, no email, no credit card required. Every image compression is completely free with no daily limits or quotas.
      </template>
    </information>
    <information>
      <template #header>Your Images Stay Private</template>
      <template #description>
        Images are processed directly in your browser and never uploaded to any server. Your photos stay on your device throughout.
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
      title: "Free Online Image Compression — No Limits, No Signup | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Compress JPG, PNG, WEBP and AVIF images free online. No file size limit, no signup, unlimited compressions. Before/after quality preview. Download as ZIP.",
        },
        {
          name: "keywords",
          content:
            "free image compression, compress jpg online, compress png free, reduce image size, free image compressor, no limit image compression, compress photos free",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Image Compression — No Limits, No Signup | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Compress JPG, PNG, WEBP and AVIF images free online. No file size limit, no signup, unlimited compressions. Before/after quality preview.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Image Compression — No Limits, No Signup | No Limit Converter",
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
            "Compress JPG, PNG, WEBP and AVIF images free online. No file size limit, no signup, unlimited compressions. Before/after quality preview.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/compression" }],
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
