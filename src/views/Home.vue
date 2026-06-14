<template>
  <descriptor>
    <template #header>Free Online Image Converter — Unlimited, No Signup</template>
    <template #description>
      Convert JPG, PNG, WEBP, GIF, TIFF, SVG and 50+ image formats free online. No file size limit, no daily caps, no registration required.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="image" name="from"></format-selector>

  <div class="informationContainer">
    <information>
      <template #header>50+ Image Formats Supported Free</template>
      <template #description>
        Convert between JPG, PNG, GIF, WEBP, TIFF, SVG, PSD, BMP, EPS, AVIF and 40+ more image formats. One of the most complete free image converters available online.
      </template>
    </information>
    <information>
      <template #header>Convert Unlimited Images at Once</template>
      <template #description>
        Drop an entire folder of images and convert them all at once in a single click. No cap on file count. Download individually or as a ZIP file.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit — Ever</template>
      <template #description>
        Convert image files of any size without restrictions. High-resolution photos, scans and graphic files all supported — no paid plan required.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>2,500+ Image Conversion Pairs</template>
      <template #description>
        With 50+ supported formats, there are over 2,500 possible image conversion combinations — all accessible for free with no account required.
      </template>
    </information>
    <information>
      <template #header>100% Free — No Signup, No Watermarks</template>
      <template #description>
        No account, no email, no credit card required. Every image conversion on No Limit Converter is completely free with no watermarks on output.
      </template>
    </information>
    <information>
      <template #header>Private & Secure — Images Stay on Your Device</template>
      <template #description>
        Images are processed directly in your browser and never uploaded to any server. Your files stay on your device at all times.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Convert JPG to PNG, WEBP & More</template>
      <template #description>
        Popular conversions include JPG to PNG, PNG to WEBP, WEBP to JPG, TIFF to JPG, SVG to PNG, and thousands more — all free online.
      </template>
    </information>
    <information>
      <template #header>No Software to Install</template>
      <template #description>
        Works in any modern browser on Windows, Mac, Linux, iOS and Android. No Photoshop, no app download — just open and convert.
      </template>
    </information>
    <information>
      <template #header>Fast Browser-Based Processing</template>
      <template #description>
        Conversions run locally on your device at full speed. No waiting for server queues or slow uploads. Results are ready in seconds.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Image Converter FAQ</h3>
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
  name: "Home",
  data() {
    return {
      faqs: [
        {
          question: "What image formats can I convert for free?",
          answer: "You can convert between 50+ formats including JPG, PNG, WEBP, GIF, TIFF, SVG, PSD, BMP, ICO, EPS, AVIF, HEIC, TGA, PPM and many more. All conversions are free.",
          open: false,
        },
        {
          question: "Is there a limit on how many images I can convert?",
          answer: "No. There is no limit on file count. You can convert hundreds of images in a single batch with no daily caps or quotas.",
          open: false,
        },
        {
          question: "What is the maximum file size I can convert?",
          answer: "There is no maximum file size. Convert high-resolution photos, large scans, and graphic files of any size without restrictions.",
          open: false,
        },
        {
          question: "Do I need to sign up or create an account?",
          answer: "No. No Limit Converter requires no signup, no email address, and no credit card. Just open the page and start converting.",
          open: false,
        },
        {
          question: "Are my images uploaded to a server?",
          answer: "No. All image processing happens directly in your browser using WebAssembly. Your images never leave your device.",
          open: false,
        },
        {
          question: "How do I convert JPG to PNG?",
          answer: "Select JPG as the input format, add your JPG files, choose PNG as the output format, and click convert. Your PNG files will be ready to download instantly.",
          open: false,
        },
        {
          question: "Can I convert HEIC photos from my iPhone?",
          answer: "Yes. Add your HEIC or HEIF images and convert them to JPG, PNG, WEBP or any other supported format for free.",
          open: false,
        },
        {
          question: "Are converted images watermarked?",
          answer: "No. Converted images are never watermarked. You get clean, full-quality output files every time.",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Free Online Image Converter — No Limits, No Signup | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert JPG, PNG, WEBP, GIF, TIFF, SVG and 50+ image formats free online. No file size limit, no signup, no watermarks. Unlimited image conversions with No Limit Converter.",
        },
        {
          name: "keywords",
          content:
            "free image converter, convert jpg to png, online image converter, free photo converter, no limit image converter, convert images free, png to webp, webp to jpg, unlimited image conversion",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Image Converter — No Limits, No Signup | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert JPG, PNG, WEBP, GIF, TIFF, SVG and 50+ image formats free online. No file size limit, no signup, unlimited conversions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Image Converter — No Limits, No Signup | No Limit Converter",
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
            "Convert JPG, PNG, WEBP, GIF, TIFF, SVG and 50+ image formats free online. No file size limit, no signup, unlimited conversions.",
        },
      ],
      link: [
        {
          rel: "canonical",
          href: "https://nolimitconverter.com/image",
        },
      ],
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
