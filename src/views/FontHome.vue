<template>
  <descriptor>
    <template #header>Free Font Converter Online</template>
    <template #description>
      Convert TTF, OTF, WOFF, WOFF2, EOT and SVG fonts — free online, no file size limits, no restrictions. Batch convert for web and desktop.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="font" name="from" mediaType="font"></format-selector>

  <div class="infomationContainer">
    <information>
      <template #header>6 Font Formats Supported</template>
      <template #description>
        Convert between TTF, OTF, WOFF, WOFF2, EOT and SVG. All major web and desktop font formats covered with high-fidelity output.
      </template>
    </information>
    <information>
      <template #header>Bulk Font Conversion</template>
      <template #description>
        Convert multiple font files at once for your design or development workflow. Great for preparing font packages for web projects.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Convert font files of any size without restrictions. No paid plans, no upload caps, no throttling.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>Web & Desktop Ready</template>
      <template #description>
        Convert TTF and OTF fonts to WOFF or WOFF2 for web use, or convert web fonts back to desktop formats. All 30 conversion pairs supported.
      </template>
    </information>
    <information>
      <template #header>100% Free, No Signup</template>
      <template #description>
        No account, no email, no credit card required. Every font conversion is completely free with no daily limits.
      </template>
    </information>
    <information>
      <template #header>Your Fonts Stay Private</template>
      <template #description>
        Font files are processed directly in your browser and never uploaded to any server. Your typefaces stay on your device.
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
      title: "Free Font Converter Online (TTF, OTF, WOFF) - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert TTF, OTF, WOFF, WOFF2, EOT and SVG font files for free online. Batch convert font files with no file size limits and no restrictions.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Font Converter Online (TTF, OTF, WOFF) - No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert TTF, OTF, WOFF, WOFF2, EOT and SVG font files for free online. Batch convert font files with no file size limits and no restrictions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Font Converter Online (TTF, OTF, WOFF) - No Limit Converter",
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
            "Convert TTF, OTF, WOFF, WOFF2, EOT and SVG font files for free online. Batch convert font files with no file size limits and no restrictions.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/font" }],
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
</style>
