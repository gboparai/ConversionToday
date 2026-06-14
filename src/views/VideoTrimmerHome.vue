<template>
  <descriptor>
    <template #header>Free Online Video Trimmer — Cut MP4, WebM, MOV</template>
    <template #description>
      Trim, cut, and crop video files free online. Select your start and end times to easily remove unwanted sections from your MP4, WebM, MOV, and other video files.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="video-trimmer" name="from" mediaType="video"></format-selector>

  <div class="informationContainer">
    <information>
      <template #header>Trim Any Video Format</template>
      <template #description>
        Support for MP4, WebM, MOV, AVI, MKV, and more. Upload your file, use the dual-slider to select the exact section you want to keep, and download the trimmed version.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Trim large video files without any size restrictions. It's completely free and processes directly in your browser.
      </template>
    </information>
    <information>
      <template #header>100% Free & Private</template>
      <template #description>
        No signup required. All video cutting happens on your device, meaning your files are never uploaded to our servers, ensuring your privacy.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Video Trimmer FAQ</h3>
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
  name: "VideoTrimmerHome",
  components: {
    FormatSelector,
    Descriptor,
    Information,
    Faq,
  },
  data() {
    return {
      faqs: [
        {
          question: "How do I trim a video file?",
          answer: "Select your video file format above, upload your file, and use the sliders on the next page to set the start and end times. Click trim to download the cropped video.",
          open: false,
        },
        {
          question: "Are my video files uploaded to a server?",
          answer: "No. The trimming process happens entirely locally in your web browser using WebAssembly. Your files remain private and never leave your device.",
          open: false,
        },
        {
          question: "Is there a file size limit?",
          answer: "No, there are no file size limits or restrictions.",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Free Online Video Trimmer — Cut MP4, WebM, MOV | No Limit Converter",
      meta: [
        {
          name: "description",
          content: "Trim and cut video files like MP4, WebM, and MOV free online. Easy to use video cutter with no size limits and no signup required. Processed privately in your browser.",
        },
        {
          name: "keywords",
          content: "video trimmer, cut video, trim mp4 online, free video cutter, crop video file",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/video-trimmer" }],
    });
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
