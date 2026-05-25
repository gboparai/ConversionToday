<template>
  <descriptor>
    <template #header>Archive Compress Tool</template>
    <template #description>
      Add multiple files and compress them into one downloadable archive in your browser.
      Supports ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO.
    </template>
  </descriptor>

  <div class="formatGrid">
    <a class="formatCard" href="/compress/zip">
      <span class="formatCard__ext">ZIP</span>
      <span class="formatCard__label">Compress to ZIP archive</span>
    </a>
    <a class="formatCard" href="/compress/7z">
      <span class="formatCard__ext">7Z</span>
      <span class="formatCard__label">Compress to 7Z archive</span>
    </a>
    <a class="formatCard" href="/compress/tar">
      <span class="formatCard__ext">TAR</span>
      <span class="formatCard__label">Compress to TAR archive</span>
    </a>
    <a class="formatCard" href="/compress/tar.gz">
      <span class="formatCard__ext">TAR.GZ</span>
      <span class="formatCard__label">Compress to TAR.GZ archive</span>
    </a>
    <a class="formatCard" href="/compress/tar.bz2">
      <span class="formatCard__ext">TAR.BZ2</span>
      <span class="formatCard__label">Compress to TAR.BZ2 archive</span>
    </a>
    <a class="formatCard" href="/compress/tar.xz">
      <span class="formatCard__ext">TAR.XZ</span>
      <span class="formatCard__label">Compress to TAR.XZ archive</span>
    </a>
    <a class="formatCard" href="/compress/iso">
      <span class="formatCard__ext">ISO</span>
      <span class="formatCard__label">Compress to ISO image</span>
    </a>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Single Output Archive</template>
      <template #description>
        Queue files, choose an output format, and generate one archive file you can download instantly.
      </template>
    </information>
    <information>
      <template #header>Formats You Can Convert To</template>
      <template #description>
        Output options match the archive formats supported as conversion targets in the archive converter.
      </template>
    </information>
    <information>
      <template #header>Local Processing</template>
      <template #description>
        Compression runs in-browser with WebAssembly runtimes, so files stay on your device.
      </template>
    </information>
  </div>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import { useMeta } from "vue-meta";

export default {
  name: "CompressHome",
  components: { Descriptor, Information },
  setup() {
    useMeta({
      title: "Free Archive Compress Tool - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Compress multiple files into one ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ or ISO archive online for free with local browser processing.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/compress" }],
      htmlAttrs: { lang: "en" },
    });
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.formatGrid {
  @include mid-width;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.formatCard {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  text-decoration: none;
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;

  &:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &__ext {
    font-size: 0.95rem;
    font-weight: 900;
    letter-spacing: 0.05em;
  }

  &__label {
    color: var(--text-secondary);
    font-size: 0.83rem;
    line-height: 1.45;
  }
}
</style>
