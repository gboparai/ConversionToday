<template>
  <descriptor>
    <template #header>Free Online File Merge Tool — Unlimited, No Signup</template>
    <template #description>
      Combine audio, video, archives and documents into a single output file — free online, no file size limits, no registration required.
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
      <span class="formatCard__label">PDF, Markdown, HTML, DOCX, ODT, EPUB, RTF</span>
    </a>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Merge Audio, Video, Archives & Documents</template>
      <template #description>
        Combine files across four media types — audio tracks, video clips, archive files and documents — into one single downloadable output.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Merge large video files, lengthy audio recordings or bulky archives without any size restrictions. No paid plan required.
      </template>
    </information>
    <information>
      <template #header>Drag to Reorder</template>
      <template #description>
        Set the exact sequence before merging. Drag and drop files into the perfect order so the final output follows precisely what you want.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>One Output File</template>
      <template #description>
        Choose an output extension, arrange the source files, merge, then download a single finished file — no zip extraction needed.
      </template>
    </information>
    <information>
      <template #header>100% Free, No Signup</template>
      <template #description>
        No account, no email, no credit card required. Every file merge is completely free with no daily limits.
      </template>
    </information>
    <information>
      <template #header>Your Files Stay Private</template>
      <template #description>
        Files are processed directly in your browser and never uploaded to any server. Your data stays on your device throughout the entire process.
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
      title: "Free Online File Merge Tool — No Limits, No Signup | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Merge multiple audio, video, archive and document files into one output file free online. No file size limit, no signup, unlimited merging. Combine files instantly.",
        },
        {
          name: "keywords",
          content:
            "free file merge, merge files online, combine audio files free, merge videos free, combine pdf free, no limit file merge, merge documents online",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online File Merge Tool — No Limits, No Signup | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Merge multiple audio, video, archive and document files into one output file free online. No file size limit, no signup, unlimited merging.",
        },
        {
          property: "og:title",
          content: "Free Online File Merge Tool — No Limits, No Signup | No Limit Converter",
        },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:description",
          content:
            "Merge multiple audio, video, archive and document files into one output file free online. No file size limit, no signup, unlimited merging.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/merge" }],
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
