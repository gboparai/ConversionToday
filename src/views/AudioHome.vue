<template>
  <descriptor>
    <template #header>Audio Converter</template>
    <template #description>
      Convert unlimited audio files online for free. Supports MP3, WAV, OGG,
      FLAC, AAC, M4A, Opus and more — all processed locally in your browser.
    </template>
  </descriptor>

  <div class="mediaTypeNav">
    <a class="mediaTypeNav__card" href="/image">🖼️ Image</a>
    <a class="mediaTypeNav__card mediaTypeNav__card--active" href="/audio">🎵 Audio</a>
    <a class="mediaTypeNav__card" href="/video">🎬 Video</a>
  </div>

  <format-selector :isFrom="true" path="audio" name="from" mediaType="audio"></format-selector>
  <div class="infomationContainer">
    <information>
      <template #header>Wide Format Support</template>
      <template #description>
        Convert between MP3, WAV, OGG, FLAC, AAC, M4A, Opus, WebM and more.
        Powered by Mediabunny and FFmpeg.
      </template>
    </information>
    <information>
      <template #header>Fast and Easy</template>
      <template #description>
        Drop your audio files, choose an output format and click "Process All".
        Conversion happens instantly in your browser — no uploads needed.
      </template>
    </information>
    <information>
      <template #header>Truly Unlimited</template>
      <template #description>
        No limits on the number of files or file size. All conversions are
        completely free.
      </template>
    </information>
  </div>
  <div class="infomationContainer">
    <information>
      <template #header>Browser-based</template>
      <template #description>
        All audio processing happens directly in your browser using
        Mediabunny (WebCodecs) with an FFmpeg fallback. Your files never
        leave your device.
      </template>
    </information>
    <information>
      <template #header>High Quality</template>
      <template #description>
        Mediabunny uses hardware-accelerated WebCodecs for fast, high-quality
        audio re-encoding with full codec support.
      </template>
    </information>
    <information>
      <template #header>Secure</template>
      <template #description>
        All files remain in your browser. No data is ever sent to a server.
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
      title: "Free Online Audio Converter - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Convert audio files online for free. No limits, no uploads. Supports MP3, WAV, OGG, FLAC, AAC, M4A and more. Powered by Mediabunny and FFmpeg.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Audio Converter - Conversion Today",
        },
        {
          name: "twitter:description",
          content:
            "Convert audio files online for free. No limits, no uploads. Supports MP3, WAV, OGG, FLAC, AAC, M4A and more.",
        },
        {
          name: "twitter:image",
          content: "https://conversiontoday.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Audio Converter - Conversion Today",
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
            "Convert audio files online for free. No limits, no uploads. Supports MP3, WAV, OGG, FLAC, AAC, M4A and more.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/audio" }],
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
