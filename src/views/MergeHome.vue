<template>
  <descriptor>
    <template #header>File Merge Tool</template>
    <template #description>
      Merge archives, audio tracks, videos, and supported documents into one downloadable file in your browser.
    </template>
  </descriptor>

  <div class="formatGrid">
    <a class="formatCard" href="/merge/archive/zip">
      <span class="formatCard__ext">ARCHIVE</span>
      <span class="formatCard__label">ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ, ISO</span>
    </a>
    <a class="formatCard" href="/merge/audio/mp3">
      <span class="formatCard__ext">AUDIO</span>
      <span class="formatCard__label">MP3, WAV, OGG, FLAC, AAC, M4A and more</span>
    </a>
    <a class="formatCard" href="/merge/video/mp4">
      <span class="formatCard__ext">VIDEO</span>
      <span class="formatCard__label">MP4, WebM, MKV, MOV, AVI, TS and more</span>
    </a>
    <a class="formatCard" href="/merge/document/markdown">
      <span class="formatCard__ext">DOCUMENT</span>
      <span class="formatCard__label">Markdown, HTML, DOCX, ODT, EPUB, RTF</span>
    </a>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>One Output File</template>
      <template #description>
        Choose an output extension, arrange the source files, merge, then download a single finished file.
      </template>
    </information>
    <information>
      <template #header>Drag to Reorder</template>
      <template #description>
        The queue is reorderable before processing, so the final merge follows the exact file order you want.
      </template>
    </information>
    <information>
      <template #header>Local Processing</template>
      <template #description>
        FFmpeg, Pandoc, and archive runtimes run in-browser, keeping your files on your device.
      </template>
    </information>
  </div>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import { useMeta } from "vue-meta";

export default {
  name: "MergeHome",
  components: { Descriptor, Information },
  setup() {
    useMeta({
      title: "Free File Merge Tool - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Merge audio, video, archive and supported document files into one downloadable file with local browser processing.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/merge" }],
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
