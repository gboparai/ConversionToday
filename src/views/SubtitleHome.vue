<template>
  <descriptor>
    <template #header>Free Online Subtitle Converter — SRT, VTT, ASS & More</template>
    <template #description>
      Convert SRT, VTT, ASS, SSA, SBV, LRC, TTML, STL and more subtitle formats free online. No file size limit, no daily caps, no registration. Files never leave your device.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="subtitle" name="from" mediaType="subtitle"></format-selector>

  <div class="infomationContainer">
    <information>
      <template #header>11 Subtitle Formats — All Free</template>
      <template #description>
        Convert between SRT, VTT, ASS, SSA, SBV, LRC, TTML, DFXP, STL, SCC, and plain TXT — all the major subtitle and caption formats used by video players, streaming platforms, and broadcasting tools.
      </template>
    </information>
    <information>
      <template #header>Convert Unlimited Subtitle Files</template>
      <template #description>
        Drop an entire folder of subtitle files and convert them all in one batch with a single click. No cap on file count — ideal for localisation projects and large video libraries.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Convert subtitle files of any length — feature films, series, audiobooks — without hitting any size cap. No paid plan required.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>100% Free — No Account Needed</template>
      <template #description>
        No signup, no email, no credit card. Every subtitle conversion is completely free with no daily limits or quotas.
      </template>
    </information>
    <information>
      <template #header>Private &amp; Secure — Files Never Leave Your Device</template>
      <template #description>
        All subtitle processing happens directly in your browser using JavaScript. Your files are never uploaded to any server — your scripts and translations stay on your device.
      </template>
    </information>
    <information>
      <template #header>Works in Any Browser</template>
      <template #description>
        No software to install. Works instantly in Chrome, Firefox, Safari, and Edge on Windows, Mac, Linux, iOS, and Android.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>Convert SRT to VTT for Web Video</template>
      <template #description>
        The HTML5 &lt;video&gt; element requires WebVTT (.vtt) format. Convert your SRT subtitles to VTT in seconds — no command line tools needed.
      </template>
    </information>
    <information>
      <template #header>YouTube SBV &amp; ASS Fansub Support</template>
      <template #description>
        Export to SBV for direct upload to YouTube Studio, or convert anime fansub ASS files to SRT for use with any media player like VLC or Kodi.
      </template>
    </information>
    <information>
      <template #header>Broadcast &amp; Streaming Formats</template>
      <template #description>
        Support for TTML / DFXP used by Netflix, Amazon, and broadcast pipelines, and STL (Spruce) used in DVD and professional captioning workflows.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Subtitle Converter FAQ</h3>
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
  name: "SubtitleHome",
  data() {
    return {
      faqs: [
        {
          question: "What subtitle formats can I convert for free?",
          answer: "You can convert between 11 formats: SRT, VTT (WebVTT), ASS (Advanced SubStation Alpha), SSA (SubStation Alpha), SBV (YouTube), LRC (lyrics), TTML, DFXP, STL (Spruce), SCC (Scenarist), and plain TXT.",
          open: false,
        },
        {
          question: "How do I convert SRT to VTT?",
          answer: "Select SRT as the input format on this page, then choose VTT as the output format. Add your .srt files, click Process All, then download the converted .vtt files.",
          open: false,
        },
        {
          question: "Can I convert ASS/SSA anime subtitles to SRT?",
          answer: "Yes. The converter strips ASS override tags (colours, positioning, fonts) and extracts the plain dialogue text, outputting clean SRT cues compatible with all media players.",
          open: false,
        },
        {
          question: "Is there a file size limit?",
          answer: "No. Subtitle files are plain text and are typically very small, but there is no imposed size limit regardless.",
          open: false,
        },
        {
          question: "Can I convert multiple subtitle files at once?",
          answer: "Yes. Drop as many subtitle files as you like at once. All files are converted in parallel in your browser.",
          open: false,
        },
        {
          question: "Are my subtitle files uploaded to a server?",
          answer: "No. All conversion happens locally in your browser using JavaScript. Your subtitle files — which may contain copyrighted scripts or private translations — are never uploaded anywhere.",
          open: false,
        },
        {
          question: "What is the difference between SRT and VTT?",
          answer: "SRT is the most widely compatible format, supported by virtually every media player and platform. VTT (WebVTT) is the HTML5 web standard and adds support for cue positioning, styling, and regions. For web video use VTT; for desktop players use SRT.",
          open: false,
        },
        {
          question: "Does converting ASS to SRT preserve styling?",
          answer: "Styling (colours, fonts, animations) is stripped during conversion since SRT only supports plain text. The subtitle text itself is fully preserved.",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Free Online Subtitle Converter — SRT, VTT, ASS & More | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert SRT, VTT, ASS, SSA, SBV, LRC, TTML and STL subtitle formats free online. No file size limit, no signup, unlimited conversions. Private browser-based subtitle converter.",
        },
        {
          name: "keywords",
          content:
            "subtitle converter, srt to vtt, vtt to srt, convert subtitles online, ass to srt, free subtitle converter, convert srt online, webvtt converter, subtitle format converter",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Subtitle Converter — SRT, VTT, ASS & More | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert SRT, VTT, ASS, SSA, SBV, LRC, TTML and STL subtitle formats free online. No file size limit, no signup.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Subtitle Converter — SRT, VTT, ASS & More | No Limit Converter",
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
            "Convert SRT, VTT, ASS, SSA, SBV, LRC, TTML and STL subtitle formats free online. No file size limit, no signup, unlimited conversions.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/subtitle" }],
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
@import "src/styles/_utilities";

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
