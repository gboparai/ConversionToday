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
            "Is there a limitation on the size or number of files that can be processed?",
          answer:
            "No, there is no limitation on the size or number of files you can process using this service. You are free to convert files of varying sizes and process as many files as needed without any restrictions.",
          open: false,
        },
        {
          question: "How is the security of my files ensured?",
          answer:
            "Your files never leave your browser during the conversion process. All conversions are performed locally, directly in your browser, ensuring the privacy and security of your sensitive information. Your data stays on your device, and you have complete control over your files.",
          open: false,
        },
        {
          question: "How is the service free of charge?",
          answer:
            "The service is free because the entire conversion process takes place within your browser. The computing resources required for the conversion are provided by your device. This approach eliminates the need for server-side processing and infrastructure, allowing us to offer the service at no cost to users. Your browser becomes the tool for conversion, making it a convenient and cost-free solution.",
          open: false,
        },
        {
          question: "Can I use this service on any browser?",
          answer:
            "Yes, you can use this service on most modern web browsers. As long as your browser supports the required technologies, you should be able to access and use the conversion tool seamlessly. Please ensure that your browser is up to date for the best experience.",
          open: false,
        },
        {
          question: "Do I need to install any additional software or plugins?",
          answer:
            "No, there is no need to install any additional software or plugins. The conversion process relies on standard web technologies, making it accessible without the need for any third-party installations. Simply access the service using a compatible web browser, and you're ready to convert your files.",
          open: false,
        },
        {
          question:
            "Are there limitations on the types of files supported for conversion?",
          answer:
            "The service supports a diverse range of file formats for conversion, including documents, images, audio, and video. You can find a list of over 50 different supported formats on the homepage. Check the service documentation for a comprehensive list of supported file types.",
          open: false,
        },
        {
          question: "Can I convert files offline?",
          answer:
            "This service operates online, and an internet connection is required for file conversion. The conversion process relies on web technologies to provide a quick and efficient conversion experience. Ensure you have a stable internet connection to use the service effectively.",
          open: false,
        },
        {
          question: "Is this service open source?",
          answer:
            "Yes, our service is open source! We believe in transparency and collaboration. You can find the source code on our GitHub repository, allowing you to inspect, contribute, and even use the service on your own infrastructure. Feel free to explore the code!",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Frequently Asked Questions - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Find answers to common questions about No Limit Converter. Learn about file size limits, security measures, and supported formats. Fast, reliable, and totally free.",
        },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "Frequently Asked Questions - No Limit Converter" },
        {
          name: "twitter:description",
          content:
            "Find answers to common questions about No Limit Converter. Learn about file size limits, security measures, and supported formats. Fast, reliable, and totally free.",
        },
        // image must be an absolute path
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        // Facebook OpenGraph
        { property: "og:title", content: "Frequently Asked Questions - No Limit Converter" },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:description",
          content:
            "Find answers to common questions about No Limit Converter. Learn about file size limits, security measures, and supported formats. Fast, reliable, and totally free.",
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