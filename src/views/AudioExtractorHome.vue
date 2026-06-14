<template>
  <descriptor>
    <template #header>Free Online Audio Extractor — Extract Audio from Video</template>
    <template #description>
      Extract MP3, WAV, FLAC and more audio formats from any video. No file size limit, no daily caps, no registration required.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="audio-extractor" name="from" mediaType="audio-extractor"></format-selector>

  <div class="informationContainer">
    <information>
      <template #header>Extract Audio from Any Video Format</template>
      <template #description>
        Extract audio tracks from MP4, WebM, MKV, MOV, AVI, and more. Get high quality MP3, WAV, or AAC files — all free online.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit — Even Large Videos</template>
      <template #description>
        Extract audio from large video files — long recordings, podcasts, and movies — without hitting any size cap. No paid plan or subscription needed.
      </template>
    </information>
    <information>
      <template #header>Batch Extract Audio</template>
      <template #description>
        Process multiple videos simultaneously in a single batch. No need to process files one at a time. No daily limits. Download all or get a ZIP.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>100% Free — No Account Needed</template>
      <template #description>
        No signup, no email, no credit card required. Every audio extraction is completely free. No watermarks, no quality restrictions, no quotas.
      </template>
    </information>
    <information>
      <template #header>Fast & Private — Stays on Your Device</template>
      <template #description>
        Videos are processed directly in your browser and never uploaded to any server. Your files stay private on your device at all times.
      </template>
    </information>
    <information>
      <template #header>Convert MP4 to MP3 & More</template>
      <template #description>
        Popular extractions include MP4 to MP3, MOV to WAV, AVI to MP3, and many more — all free online.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Audio Extractor FAQ</h3>
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
  name: "AudioExtractorHome",
  data() {
    return {
      faqs: [
        {
          question: "What video formats are supported as input?",
          answer: "You can extract audio from MP4, WebM, MKV, MOV, AVI, WMV, FLV, and more — all for free with no restrictions.",
          open: false,
        },
        {
          question: "What audio formats can I extract to?",
          answer: "You can extract audio to MP3, WAV, OGG, FLAC, AAC, M4A, and more.",
          open: false,
        },
        {
          question: "Is there a file size limit for extracting audio?",
          answer: "No. You can extract audio from videos of any size — including multi-hour recordings — without any restrictions.",
          open: false,
        },
        {
          question: "How many videos can I process at once?",
          answer: "There is no limit. Add as many video files as you need and extract their audio in a single batch.",
          open: false,
        },
        {
          question: "Do I need to sign up?",
          answer: "No. No account, no email, no credit card required. Just open the audio extractor and start immediately.",
          open: false,
        },
        {
          question: "Are my videos uploaded to a server?",
          answer: "No. All processing happens locally in your browser using FFmpeg WebAssembly. Your videos never leave your device.",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Free Online Audio Extractor — Extract Audio from Video | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Extract MP3, WAV, and more from MP4, MOV, MKV, AVI, and other video formats free online. No file size limit, no signup, no watermarks. Unlimited extractions with No Limit Converter.",
        },
        {
          name: "keywords",
          content:
            "free audio extractor, extract audio from video online, mp4 to mp3 free, mov to wav, extract audio free, no limit audio extractor",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Audio Extractor — Extract Audio from Video | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Extract MP3, WAV, and more from video formats free online. No file size limit, no signup, unlimited extractions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Audio Extractor — Extract Audio from Video | No Limit Converter",
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
            "Extract MP3, WAV, and more from video formats free online. No file size limit, no signup, unlimited extractions.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/audio-extractor" }],
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
