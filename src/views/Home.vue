
<template>
  <descriptor>
    <template #header>Image Converter</template>
    <template #description>
      Convert unlimited image files online for free. Supports JPG, PNG, GIF,
      WEBP, TIFF, SVG and many more formats, all processed locally in your
      browser.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="image" name="from"></format-selector>
  <div class="infomationContainer">
    <information>
      <template #header>2500+ Conversion Pairs</template>
      <template #description>
        Conversion Today supports 2500+ different conversion pairs and 50+
        different file formats.
      </template>
    </information>
    <information>
      <template #header>Fast and easy </template>
      <template #description>
        Just choose the input and output formats, drop the files and click
        "Convert" button. Wait a little for the process to complete. Finally
        download.
      </template>
    </information>
    <information>
      <template #header>Truly Unlimited</template>
      <template #description>
        We provide unlimited number of conversions per day and place no
        ristrictions on the size of the files. All for free.
      </template>
    </information>
  </div>
  <div class="infomationContainer">
    <information>
      <template #header>Browser-based </template>
      <template #description>
        Conversion Today is browser-based and works for all platforms. There is
        no need to download and install any software.
      </template>
    </information>
    <information>
      <template #header>Speed</template>
      <template #description>
        We can convert 100's of files at once within 10 minutes or less.
      </template>
    </information>

    <information>
      <template #header>Secure</template>
      <template #description>
        All files remain in your browser and any converted files are removed as
        soon as you close the page.
      </template>
    </information>
  </div>
  <!-- <resize-config></resize-config> -->
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
      title: "Free Online Image Converter - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Convert image files online for free without limits. Supports JPG, PNG, GIF, WEBP, TIFF, SVG and more with browser-based local processing.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Image Converter - Conversion Today",
        },
        {
          name: "twitter:description",
          content:
            "Convert image files online for free without limits. Supports JPG, PNG, GIF, WEBP, TIFF, SVG and more with browser-based local processing.",
        },
        // image must be an absolute path
        {
          name: "twitter:image",
          content: "https://conversiontoday.com/img/logo-conversion-today.png",
        },
        // Facebook OpenGraph
        {
          property: "og:title",
          content: "Free Online Image Converter - Conversion Today",
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
            "Convert image files online for free without limits. Supports JPG, PNG, GIF, WEBP, TIFF, SVG and more with browser-based local processing.",
        },
      ],
      link: [
        {
          rel: "canonical",
          href: "https://conversiontoday.com/image",
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
