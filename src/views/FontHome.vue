<template>
  <descriptor>
    <template #header>Font Converter</template>
    <template #description>
      Convert font files online for free. Supports TTF, OTF, WOFF, WOFF2, EOT and SVG fonts directly in your browser.
    </template>
  </descriptor>


  <format-selector :isFrom="true" path="font" name="from" mediaType="font"></format-selector>
  <div class="infomationContainer">
    <information>
      <template #header>Broad Font Support</template>
      <template #description>
        Convert between TTF, OTF, WOFF, WOFF2, EOT and SVG formats with in-browser processing.
      </template>
    </information>
    <information>
      <template #header>Smart Engine Priority</template>
      <template #description>
        Uses OpenType.js for OTF-priority paths and fonteditor-core for broad web font conversions.
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
</style>
