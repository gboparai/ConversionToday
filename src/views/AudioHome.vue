<template>
  <descriptor>
    <template #header>Free Online Audio Converter — Unlimited, No Signup</template>
    <template #description>
      Convert MP3, WAV, FLAC, AAC, OGG, M4A and 10+ audio formats free online. No file size limit, no daily caps, no registration required.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="audio" name="from" mediaType="audio"></format-selector>

  <div class="informationContainer">
    <information>
      <template #header>11 Audio Formats — All Free</template>
      <template #description>
        Convert between MP3, WAV, OGG, FLAC, AAC, M4A, Opus, WebM, WMA, ALAC and APE. High-quality output with no loss of audio fidelity — completely free.
      </template>
    </information>
    <information>
      <template #header>Convert Unlimited Audio Files</template>
      <template #description>
        Process an entire music library or podcast archive at once. No cap on file count — convert as many audio files as you need in a single batch.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit on Audio</template>
      <template #description>
        Convert large lossless audio files, studio recordings or long podcasts without hitting any file size cap. No paid plan required.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>100% Free — No Account Required</template>
      <template #description>
        No signup, no email, no credit card required. Every audio conversion is completely free with no daily limits, no quotas, no hidden costs.
      </template>
    </information>
    <information>
      <template #header>Fast & Private Conversion</template>
      <template #description>
        Audio is converted directly in your browser — never uploaded to any server. Processing is fast and your files stay private on your device.
      </template>
    </information>
    <information>
      <template #header>Convert MP3 to WAV, FLAC & More</template>
      <template #description>
        Popular conversions include MP3 to WAV, FLAC to MP3, WAV to OGG, M4A to MP3, AAC to WAV and many more — all free online.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Audio Converter FAQ</h3>
    <faq :faqs="faqs" @toggle="toggleFaq" />
  </div>
</template>

<script>
import FormatSelector from "@/components/format-selector.vue";
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import Faq from "@/components/faq.vue";
import { useMeta } from "vue-meta";
export default {
  name: "AudioHome",
  data() {
    return {
      faqs: [
        {
          question: "What audio formats can I convert for free?",
          answer: "You can convert between MP3, WAV, OGG, FLAC, AAC, M4A, Opus, WebM audio, WMA, ALAC and APE — all free with no restrictions.",
          open: false,
        },
        {
          question: "Is there a file size limit for audio conversion?",
          answer: "No. You can convert audio files of any size — from short clips to multi-hour recordings and large lossless files — with no restrictions.",
          open: false,
        },
        {
          question: "How many audio files can I convert at once?",
          answer: "There is no limit. Add as many audio files as you want and convert them all in a single batch.",
          open: false,
        },
        {
          question: "Do I need to create an account?",
          answer: "No. No signup, no email, no credit card. Just open the audio converter and start converting immediately.",
          open: false,
        },
        {
          question: "Are my audio files uploaded to a server?",
          answer: "No. All audio processing happens directly in your browser. Your files are never uploaded anywhere — they stay on your device.",
          open: false,
        },
        {
          question: "Does converting audio reduce quality?",
          answer: "Converting between lossless formats (FLAC, WAV, ALAC) preserves full quality. When converting to lossy formats (MP3, AAC, OGG), you may experience minimal quality reduction typical of the format.",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Free Online Audio Converter — No Limits, No Signup | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert MP3, WAV, FLAC, AAC, OGG, M4A and more audio formats free online. No file size limit, no signup, unlimited conversions. Fast, private audio converter.",
        },
        {
          name: "keywords",
          content:
            "free audio converter, convert mp3 to wav, online audio converter, free mp3 converter, flac to mp3 free, convert audio files free, no limit audio converter",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Audio Converter — No Limits, No Signup | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert MP3, WAV, FLAC, AAC, OGG, M4A and more audio formats free online. No file size limit, no signup, unlimited conversions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Audio Converter — No Limits, No Signup | No Limit Converter",
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
            "Convert MP3, WAV, FLAC, AAC, OGG, M4A and more audio formats free online. No file size limit, no signup, unlimited conversions.",
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
    Faq,
  },
  methods: {
    toggleFaq(index) {
      this.faqs[index].open = !this.faqs[index].open;
    },
  },
};
</script>

<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;

.faqSection {
  @include mid-width;
  margin-top: 1.75rem;
  margin-bottom: 2rem;
  padding: 0 0.25rem;

  &__title {
    text-align: center;
    font-size: 1.75rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
}
</style>
