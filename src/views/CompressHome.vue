<template>
  <descriptor>
    <template #header>Free Online File Compression Tool — No Limits</template>
    <template #description>
      Compress unlimited files into a single ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ or ISO archive — free online, no file size limits, no signup.
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
      <template #header>7 Archive Output Formats</template>
      <template #description>
        Create ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ or ISO output from any collection of files. Choose the right format for your workflow.
      </template>
    </information>
    <information>
      <template #header>Compress Unlimited Files</template>
      <template #description>
        Add an entire folder of files and pack them all into a single archive at once. No cap on file count. Ideal for backup, sharing or archiving large file collections.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Compress large collections of files without hitting any upload cap or size restriction. Works for files of any size.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Single Output Archive</template>
      <template #description>
        Queue all your files, choose a format, and download one single archive. No need to manually zip files on your desktop.
      </template>
    </information>
    <information>
      <template #header>100% Free, No Signup</template>
      <template #description>
        No account, no email, no credit card required. Every compression is completely free with no daily limits.
      </template>
    </information>
    <information>
      <template #header>Your Files Stay Private</template>
      <template #description>
        Files are compressed directly in your browser and never uploaded to any server. Your data stays on your device.
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
      title: "Free Online File Compression Tool — No Limits, No Signup | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Compress and zip unlimited files into one ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2 or ISO archive free online. No file size limits, no signup, no restrictions.",
        },
        {
          name: "keywords",
          content:
            "free file compression, zip files online, create zip free, compress files online, free archive tool, no limit compression, 7z online",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online File Compression Tool — No Limits, No Signup | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Compress and zip unlimited files into one ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2 or ISO archive free online. No file size limits, no signup.",
        },
        {
          property: "og:title",
          content: "Free Online File Compression Tool — No Limits, No Signup | No Limit Converter",
        },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:description",
          content:
            "Compress and zip unlimited files into one ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2 or ISO archive free online. No file size limits, no signup.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/compress" }],
      htmlAttrs: { lang: "en" },
    });
  },
};
</script>

<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;

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
