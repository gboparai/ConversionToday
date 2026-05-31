<template>
  <descriptor>
    <template #header>Free Bulk Audio Converter Online</template>
    <template #description>
      Batch convert MP3, WAV, FLAC, AAC, OGG, M4A and 10+ audio formats — free, fast, no file size limit.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="audio" name="from" mediaType="audio"></format-selector>

  <div class="infomationContainer">
    <information>
      <template #header>11 Audio Formats Supported</template>
      <template #description>
        Convert between MP3, WAV, OGG, FLAC, AAC, M4A, Opus, WebM, WMA, ALAC and APE. High-quality output with no loss of audio fidelity.
      </template>
    </information>
    <information>
      <template #header>Batch Audio Conversion</template>
      <template #description>
        Process an entire music library or podcast archive in one batch. Convert hundreds of audio files at once and download them all.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit on Audio</template>
      <template #description>
        Convert large lossless audio files, studio recordings or long podcasts without hitting any file size cap.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>100% Free, No Signup</template>
      <template #description>
        No account, no email, no credit card required. Every audio conversion is completely free with no daily limits or quotas.
      </template>
    </information>
    <information>
      <template #header>Fast Audio Conversion</template>
      <template #description>
        Convert MP3, WAV and other audio formats quickly. Drop files, pick your output format, and download — no waiting in a queue.
      </template>
    </information>
    <information>
      <template #header>Your Audio Stays Private</template>
      <template #description>
        Audio files are processed directly in your browser and never uploaded to any server. Your recordings stay on your device.
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
  name: "AudioHome",
  setup() {
    useMeta({
      title: "Free Bulk Audio Converter Online - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Batch convert MP3, WAV, FLAC, AAC, OGG, M4A and more audio formats for free. No file size limit. Bulk convert hundreds of audio files at once with no restrictions.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Bulk Audio Converter Online - No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Batch convert MP3, WAV, FLAC, AAC, OGG, M4A and more audio formats for free. No file size limit. Bulk convert hundreds of audio files at once with no restrictions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Bulk Audio Converter Online - No Limit Converter",
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
            "Batch convert MP3, WAV, FLAC, AAC, OGG, M4A and more audio formats for free. No file size limit. Bulk convert hundreds of audio files at once with no restrictions.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/audio" }],
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
