<template>
  <descriptor>
    <template #header>Free Online Video Converter — Unlimited, No Signup</template>
    <template #description>
      Convert MP4, MOV, MKV, AVI, WebM and 10+ video formats free online. No file size limit, no daily caps, no registration required.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="video" name="from" mediaType="video"></format-selector>

  <div class="informationContainer">
    <information>
      <template #header>Convert Any Video Format Free</template>
      <template #description>
        Convert between MP4, WebM, MKV, MOV, AVI, WMV, FLV, 3GP, MPEG, TS, OGV and more. Over 100 possible video conversion pairs — all free online.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit — Even 4K Videos</template>
      <template #description>
        Convert large video files — 4K footage, long recordings, high-bitrate files — without hitting any size cap. No paid plan or subscription needed.
      </template>
    </information>
    <information>
      <template #header>Convert Unlimited Videos at Once</template>
      <template #description>
        Convert multiple videos simultaneously in a single batch. No need to process files one at a time. No daily limits. Download all or get a ZIP.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>100% Free — No Account Needed</template>
      <template #description>
        No signup, no email, no credit card required. Every video conversion is completely free. No watermarks, no quality restrictions, no quotas.
      </template>
    </information>
    <information>
      <template #header>Fast & Private — Stays on Your Device</template>
      <template #description>
        Videos are processed directly in your browser and never uploaded to any server. Your files stay private on your device at all times.
      </template>
    </information>
    <information>
      <template #header>Convert MP4 to WebM, MOV & More</template>
      <template #description>
        Popular conversions include MP4 to WebM, MOV to MP4, AVI to MP4, MKV to MP4, WebM to MP4, and many more — all free online.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Video Converter FAQ</h3>
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
  name: "VideoHome",
  data() {
    return {
      faqs: [
        {
          question: "What video formats are supported?",
          answer: "You can convert between MP4, WebM, MKV, MOV, AVI, WMV, FLV, 3GP, MPEG, TS, OGV and more — all for free with no restrictions.",
          open: false,
        },
        {
          question: "Is there a file size limit for video conversion?",
          answer: "No. You can convert videos of any size — including large 4K files and multi-hour recordings — without any restrictions.",
          open: false,
        },
        {
          question: "How many videos can I convert at once?",
          answer: "There is no limit. Add as many video files as you need and convert them all in a single batch.",
          open: false,
        },
        {
          question: "Do I need to sign up?",
          answer: "No. No account, no email, no credit card required. Just open the video converter and start converting immediately.",
          open: false,
        },
        {
          question: "Are my videos uploaded to a server?",
          answer: "No. All video processing happens locally in your browser using FFmpeg WebAssembly. Your videos never leave your device.",
          open: false,
        },
        {
          question: "How do I convert MOV to MP4?",
          answer: "Select MOV as the input format, add your MOV files, choose MP4 as the output format, and click convert. Your MP4 files will be ready to download.",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Free Online Video Converter — No Limits, No Signup | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert MP4, MOV, MKV, AVI, WebM and more video formats free online. No file size limit, no signup, no watermarks. Unlimited video conversions with No Limit Converter.",
        },
        {
          name: "keywords",
          content:
            "free video converter, convert mp4 online, online video converter, mov to mp4 free, convert video free, no limit video converter, avi to mp4, mkv to mp4 free",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Video Converter — No Limits, No Signup | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert MP4, MOV, MKV, AVI, WebM and more video formats free online. No file size limit, no signup, unlimited conversions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Video Converter — No Limits, No Signup | No Limit Converter",
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
            "Convert MP4, MOV, MKV, AVI, WebM and more video formats free online. No file size limit, no signup, unlimited conversions.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/video" }],
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
