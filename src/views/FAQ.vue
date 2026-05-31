<template>
  <descriptor>
    <template #header>FAQ</template>
    <template #description>
      Welcome to our Frequently Asked Questions (FAQ) section. Below, you'll
      find answers to some common queries about our service.
    </template>
  </descriptor>
  <faq :faqs="faqItems" @toggle="toggleFaqAnswer" />
</template>

<script>
import Faq from "@/components/faq";
import Descriptor from "@/components/descriptor.vue";
import { useMeta } from "vue-meta";
export default {
  components: {
    Faq,
    Descriptor,
  },
  data() {
    return {
      faqItems: [
        {
          question:
            "Is No Limit Converter really 100% free?",
          answer:
            "Yes, completely free. There are no hidden costs, no premium tiers, no credit card required, and no daily limits. Every tool and every conversion is free forever.",
          open: false,
        },
        {
          question:
            "Is there a limitation on the size or number of files that can be processed?",
          answer:
            "No, there is no limitation on the size or number of files you can process. You are free to convert files of any size — including large 4K videos, high-resolution images, and multi-hundred-page documents — and process as many files as needed without any restrictions or daily caps.",
          open: false,
        },
        {
          question: "How is the security of my files ensured?",
          answer:
            "Your files never leave your browser during the conversion process. All conversions are performed locally using WebAssembly, directly in your browser. No files are ever uploaded to any server. You maintain complete control of your data at all times.",
          open: false,
        },
        {
          question: "Why is the service free of charge?",
          answer:
            "The service is free because the entire conversion process takes place within your browser using your device's computing power. There are no server-side processing costs, which allows us to offer all tools completely free without ads, subscriptions, or upsells.",
          open: false,
        },
        {
          question: "Do I need to create an account or sign up?",
          answer:
            "No. No Limit Converter requires no signup, no account creation, and no email address. Simply visit the site and start converting files immediately — no registration needed.",
          open: false,
        },
        {
          question: "Can I use this service on any browser or device?",
          answer:
            "Yes. No Limit Converter works on all modern web browsers including Chrome, Firefox, Safari, and Edge. It works on Windows, Mac, Linux, iOS, and Android devices. No app download required.",
          open: false,
        },
        {
          question: "Do I need to install any additional software or plugins?",
          answer:
            "No. Everything runs directly in your web browser using standard web technologies (WebAssembly). There is nothing to download, install, or configure. Just visit the site and convert.",
          open: false,
        },
        {
          question: "What file formats are supported?",
          answer:
            "No Limit Converter supports over 150 formats: 50+ image formats (JPG, PNG, WEBP, GIF, TIFF, SVG, PSD, AVIF, HEIC and more), 11 audio formats (MP3, WAV, FLAC, AAC, OGG, M4A and more), 11+ video formats (MP4, WebM, MOV, AVI, MKV and more), 60+ document formats (DOCX, PDF, Markdown, HTML, EPUB, LaTeX and more), 8 archive formats (ZIP, 7Z, RAR, TAR, ISO and more), and 6 font formats (TTF, OTF, WOFF, WOFF2, EOT, SVG).",
          open: false,
        },
        {
          question: "Are my converted files watermarked?",
          answer:
            "No. Converted files are never watermarked or modified in any way beyond the format conversion itself. You get clean, full-quality output every time.",
          open: false,
        },
        {
          question: "Can I convert files offline?",
          answer:
            "An internet connection is needed to load the site initially. However, once the page is loaded, conversions run entirely in your browser and do not require an active internet connection for the actual processing.",
          open: false,
        },
        {
          question: "Is this service open source?",
          answer:
            "Yes! No Limit Converter is open source. You can inspect the code on our GitHub repository, verify that files stay private, contribute improvements, or even host it on your own infrastructure.",
          open: false,
        },
        {
          question: "How fast is the conversion process?",
          answer:
            "Conversions run locally on your device at full speed — there is no waiting for server queues or slow uploads. Most conversions complete in seconds, depending on file size and your device's performance.",
          open: false,
        },
        {
          question: "Can I use converted files for commercial purposes?",
          answer:
            "Yes. There are no restrictions on how you use your converted files. Whether for personal, educational, or commercial projects — convert freely.",
          open: false,
        },
        {
          question: "What makes No Limit Converter different from other converters?",
          answer:
            "Unlike most online converters, No Limit Converter has truly no limits: no file size cap, no daily conversion quota, no signup requirement, no watermarks, and no premium upsell. Plus, all processing happens in your browser so your files remain 100% private.",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Frequently Asked Questions — Free File Converter | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Find answers to common questions about No Limit Converter. Learn about file size limits, privacy, supported formats, and why it's 100% free. No signup, no restrictions.",
        },
        {
          name: "keywords",
          content:
            "no limit converter faq, free converter questions, file size limit, free online converter help, no signup converter",
        },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "Frequently Asked Questions — Free File Converter | No Limit Converter" },
        {
          name: "twitter:description",
          content:
            "Find answers to common questions about No Limit Converter. Learn about file size limits, privacy, supported formats, and why it's 100% free.",
        },
        // image must be an absolute path
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        // Facebook OpenGraph
        { property: "og:title", content: "Frequently Asked Questions — Free File Converter | No Limit Converter" },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:description",
          content:
            "Find answers to common questions about No Limit Converter. Learn about file size limits, privacy, supported formats, and why it's 100% free.",
        },
      ],
      link: [
        {
          rel: "canonical",
          href: "https://nolimitconverter.com/faq",
        },
      ],
      htmlAttrs: { lang: "en", amp: true },
    });
  },
  methods: {
    toggleFaqAnswer(index) {
      this.faqItems[index].open = !this.faqItems[index].open;
    },
  },
};
</script>