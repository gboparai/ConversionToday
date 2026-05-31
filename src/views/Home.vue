<template>
  <descriptor>
    <template #header>Free Bulk Image Converter Online</template>
    <template #description>
      Batch convert JPG, PNG, WEBP, GIF, TIFF, SVG and 50+ image formats — no file size limits, no restrictions, completely free.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="image" name="from"></format-selector>

  <div class="infomationContainer">
    <information>
      <template #header>50+ Image Formats</template>
      <template #description>
        Convert between JPG, PNG, GIF, WEBP, TIFF, SVG, PSD, BMP, EPS, AVIF and 40+ more image formats. One of the most complete image converters available online.
      </template>
    </information>
    <information>
      <template #header>Batch Convert Hundreds of Images</template>
      <template #description>
        Drop an entire folder of images and convert them all at once in a single click. Download individually or as a ZIP file.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Convert image files of any size without restrictions. High-resolution photos, scans and graphic files all supported.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>2,500+ Image Conversion Pairs</template>
      <template #description>
        With 50+ supported formats, there are over 2,500 possible image conversion combinations — all accessible for free with no account.
      </template>
    </information>
    <information>
      <template #header>100% Free, No Signup</template>
      <template #description>
        No account, no email, no credit card required. Every image conversion on No Limit Converter is completely free.
      </template>
    </information>
    <information>
      <template #header>Your Images Stay Private</template>
      <template #description>
        Images are processed directly in your browser and never uploaded to any server. Your files stay on your device at all times.
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
  name: "Home",
  setup() {
    useMeta({
      title: "Free Bulk Image Converter Online - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Batch convert JPG, PNG, WEBP, GIF, TIFF, SVG and 50+ image formats for free. No file size limit. Bulk convert hundreds of images at once with No Limit Converter.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Bulk Image Converter Online - No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Batch convert JPG, PNG, WEBP, GIF, TIFF, SVG and 50+ image formats for free. No file size limit. Bulk convert hundreds of images at once.",
        },
        // image must be an absolute path
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        // Facebook OpenGraph
        {
          property: "og:title",
          content: "Free Bulk Image Converter Online - No Limit Converter",
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
            "Batch convert JPG, PNG, WEBP, GIF, TIFF, SVG and 50+ image formats for free. No file size limit. Bulk convert hundreds of images at once.",
        },
      ],
      link: [
        {
          rel: "canonical",
          href: "https://nolimitconverter.com/image",
        },
      ],
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
