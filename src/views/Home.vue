
<template>
  <descriptor>
    <template #header>Image Converter</template>
    <template #description>
      Convert unlimited image files online for free. Supports JPG, PNG, GIF,
      WEBP, TIFF, SVG and many more formats, all processed locally in your
      browser.
    </template>
  </descriptor>

  <div class="mediaTypeNav">
    <a class="mediaTypeNav__card mediaTypeNav__card--active" href="/image">🖼️ Image</a>
    <a class="mediaTypeNav__card" href="/audio">🎵 Audio</a>
    <a class="mediaTypeNav__card" href="/video">🎬 Video</a>
  </div>

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
  }
}
</style>
