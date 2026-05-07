<template>
  <descriptor>
    <template #header>Archive Converter</template>
    <template #description>
      Convert archive files online for free. Supports ZIP, 7Z, TAR, GZ, BZ2, XZ, ISO, CPIO and AR formats — all processed in your browser.
    </template>
  </descriptor>

  <div class="mediaTypeNav">
    <a class="mediaTypeNav__card" href="/image">🖼️ Image</a>
    <a class="mediaTypeNav__card" href="/audio">🎵 Audio</a>
    <a class="mediaTypeNav__card" href="/video">🎬 Video</a>
    <a class="mediaTypeNav__card" href="/document">📄 Document</a>
    <a class="mediaTypeNav__card mediaTypeNav__card--active" href="/archive">🗜️ Archive</a>
  </div>

  <format-selector :isFrom="true" path="archive" name="from" mediaType="archive"></format-selector>
  <div class="infomationContainer">
    <information>
      <template #header>Broad Archive Support</template>
      <template #description>
        Convert between ZIP, 7Z, TAR, GZ, BZ2, XZ, ISO, CPIO and AR using multiple archive engines with smart fallbacks.
      </template>
    </information>
    <information>
      <template #header>In-Browser Processing</template>
      <template #description>
        Archive conversion runs directly in your browser with WebAssembly runtimes. Your files stay on your device.
      </template>
    </information>
    <information>
      <template #header>No Upload Limits</template>
      <template #description>
        Convert as many archive files as needed without account limits or server-side upload queues.
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
  name: "ArchiveHome",
  setup() {
    useMeta({
      title: "Free Online Archive Converter - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Convert archive files online for free in your browser. Supports ZIP, 7Z, TAR, GZ, BZ2, XZ, ISO, CPIO and AR formats.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/archive" }],
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
