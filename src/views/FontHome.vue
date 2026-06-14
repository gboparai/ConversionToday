<template>
  <descriptor>
    <template #header>Free Online Font Converter — TTF, OTF, WOFF, WOFF2</template>
    <template #description>
      Convert TTF, OTF, WOFF, WOFF2, EOT and SVG fonts free online. No file size limits, no signup, unlimited batch conversions for web and desktop.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="font" name="from" mediaType="font"></format-selector>

  <div class="informationContainer">
    <information>
      <template #header>6 Font Formats — All Free</template>
      <template #description>
        Convert between TTF, OTF, WOFF, WOFF2, EOT and SVG. All major web and desktop font formats covered with high-fidelity output — completely free.
      </template>
    </information>
    <information>
      <template #header>Convert Unlimited Fonts at Once</template>
      <template #description>
        Convert multiple font files at once for your design or development workflow. No cap on file count. Great for preparing font packages for web projects.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Convert font files of any size without restrictions. No paid plans, no upload caps, no throttling — unlimited free font conversion.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Web & Desktop Ready — 30 Conversion Pairs</template>
      <template #description>
        Convert TTF and OTF fonts to WOFF or WOFF2 for web use, or convert web fonts back to desktop formats. All 30 conversion pairs supported free.
      </template>
    </information>
    <information>
      <template #header>100% Free — No Signup, No Account</template>
      <template #description>
        No registration, no email, no credit card required. Every font conversion is completely free with no daily limits or hidden costs.
      </template>
    </information>
    <information>
      <template #header>Private & Secure — Fonts Stay on Your Device</template>
      <template #description>
        Font files are processed directly in your browser and never uploaded to any server. Your typefaces stay private on your device.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Font Converter FAQ</h3>
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
  name: "FontHome",
  data() {
    return {
      faqs: [
        {
          question: "What font formats can I convert for free?",
          answer: "You can convert between TTF, OTF, WOFF, WOFF2, EOT and SVG fonts — all 30 possible conversion pairs are free.",
          open: false,
        },
        {
          question: "How do I convert TTF to WOFF2 for web use?",
          answer: "Select TTF as the input format, add your TTF font files, choose WOFF2 as the output format, and click convert. Your web-ready WOFF2 files will be ready to download.",
          open: false,
        },
        {
          question: "Is there a file size limit?",
          answer: "No. Convert font files of any size with no restrictions whatsoever.",
          open: false,
        },
        {
          question: "Can I convert multiple fonts at once?",
          answer: "Yes. Add as many font files as you need and convert them all in a single batch. There is no limit on file count.",
          open: false,
        },
        {
          question: "Are my font files uploaded to a server?",
          answer: "No. All font processing happens locally in your browser. Your font files are never uploaded anywhere.",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Free Online Font Converter (TTF, OTF, WOFF, WOFF2) — No Limits | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert TTF, OTF, WOFF, WOFF2, EOT and SVG font files free online. No file size limit, no signup, unlimited conversions. Convert fonts for web and desktop instantly.",
        },
        {
          name: "keywords",
          content:
            "free font converter, convert ttf to woff2, online font converter, otf to woff free, woff2 converter, convert fonts free, no limit font converter",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Font Converter (TTF, OTF, WOFF, WOFF2) — No Limits | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert TTF, OTF, WOFF, WOFF2, EOT and SVG font files free online. No file size limit, no signup, unlimited conversions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Font Converter (TTF, OTF, WOFF, WOFF2) — No Limits | No Limit Converter",
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
            "Convert TTF, OTF, WOFF, WOFF2, EOT and SVG font files free online. No file size limit, no signup, unlimited conversions.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/font" }],
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
