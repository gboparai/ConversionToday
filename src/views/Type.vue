<style scoped lang="scss">
@import "src/styles/_utilities";

.toTitle {
  text-align: center;
  margin-top: 0;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.FAQTitle {
  text-align: center;
  font-size: 1.75rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}
</style>

<template>
  <descriptor>
    <template #header
      ><span>{{ formatInofo.name.toUpperCase() }}</span> Converter</template
    >
    <template #description
      >Convert unlimited number of files to and from
      {{ formatInofo.name }} online. Amongst many others, we support PNG, JPG,
      GIF, WEBP and BMP.</template
    >
  </descriptor>
  <div class="informationBar">
    <card
      :path="mediaHomePath"
      :formats="formats"
      :selectedFormat="formatInofo.name"
      :handleChange="handleChange"
    >
      <template #header>{{ formatInofo.title }}</template>
      <template #description>{{ formatInofo.description }}</template>
    </card>
  </div>
  <h2 class="toTitle">Convert {{ formatInofo.name }} to:</h2>
  <format-selector
    :isFrom="false"
    :path="mediaType + '/' + format"
    name="to"
    :mediaType="mediaType"
  ></format-selector>
  <div class="infomationContainer">
    <information>
      <template #header>Fast Conversion</template>
      <template #description>
        Convert large batches of {{ formatInofo.name.toUpperCase() }} files to
        supported formats quickly in your browser.
      </template>
    </information>
    <information>
      <template #header>No Limit</template>
      <template #description>
        Convert {{ formatInofo.name.toUpperCase() }} files without any
        limitations on the size or quantity.
      </template>
    </information>
  </div>
  <div class="infomationContainer">
    <information>
      <template #header>Bulk File Conversion </template>
      <template #description>
        Bulk converts an unlimited number of
        {{ formatInofo.name.toUpperCase() }} files to any other supported file
        format with just one click.
      </template>
    </information>
    <information>
      <template #header>50+ formats supported</template>
      <template #description>
        Convert {{ formatInofo.name.toUpperCase() }} files to more than 50
        supported output formats with a simple workflow.
      </template>
    </information>
  </div>
  <div>
    <h3 class="FAQTitle">FAQ</h3>
    <faq :faqs="faqItems" @toggle="toggleFaqAnswer" />
  </div>
  <!-- <resize-config></resize-config> -->
</template>

<script>
import FormatSelector from "@/components/format-selector.vue";
import Card from "@/components/card.vue";
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import Faq from "@/components/faq";
import { getMediaTypeFromPath, getMediaTypeConfig } from "@/js/media-types";
import { useMeta } from "vue-meta";
export default {
  name: "Type",
  setup() {},

  components: {
    FormatSelector,
    Card,
    Descriptor,
    Information,
    Faq,
  },
  data() {
    useMeta({
      title:
        "Free Online " +
        this.$route.params.format.toUpperCase() +
        " Converter - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Free Online " +
            this.$route.params.format.toUpperCase() +
            " Converter. Convert to 50+ file formats in seconds with no limits on file size or number of files.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content:
            "Free Online " +
            this.$route.params.format.toUpperCase() +
            " Converter - No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Free Online " +
            this.$route.params.format.toUpperCase() +
            " Converter. Convert to 50+ file formats in seconds with no limits on file size or number of files.",
        },
        // image must be an absolute path
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        // Facebook OpenGraph
        {
          property: "og:title",
          content:
            "Free Online " +
            this.$route.params.format.toUpperCase() +
            " Converter - No Limit Converter",
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
            "Free Online " +
            this.$route.params.format.toUpperCase() +
            " Converter. Convert to 50+ file formats in seconds with no limits on file size or number of files.",
        },
      ],
      link: [
        {
          rel: "canonical",
          href:
            "https://nolimitconverter.com" + this.$route.path,
        },
      ],
      htmlAttrs: { lang: "en", amp: true },
    });
    return {
      format: this.$route.params.format,

      faqItems: [
        {
          question: `Is there a limitation on the size or number of ${this.$route.params.format} files that can be processed?`,
          answer: `No, there is no limitation on the size or number of ${this.$route.params.format} files you can process using this service. You are free to convert files of varying sizes and process as many files as needed without any restrictions.`,
          open: false,
        },
        {
          question: `How is the security of my ${this.$route.params.format} files ensured?`,
          answer: `Your ${this.$route.params.format} files never leave your browser during the conversion process. All conversions are performed locally, directly in your browser, ensuring the privacy and security of your sensitive information. Your data stays on your device, and you have complete control over your files.`,
          open: false,
        },
        {
          question: `How can we convert ${this.$route.params.format} files free of charge?`,
          answer:
            "The service is free because the entire conversion process takes place within your browser. The computing resources required for the conversion are provided by your device. This approach eliminates the need for server-side processing and infrastructure, allowing us to offer the service at no cost to users. Your browser becomes the tool for conversion, making it a convenient and cost-free solution.",
          open: false,
        },
      ],
    };
  },
  methods: {
    toggleFaqAnswer(index) {
      this.faqItems[index].open = !this.faqItems[index].open;
    },
    handleChange(event) {
      window.location.href = `/${this.mediaType}/${event.target.value}`;
    },
  },
  computed: {
    mediaType() {
      return getMediaTypeFromPath(this.$route.path);
    },
    mtConfig() {
      return getMediaTypeConfig(this.mediaType);
    },
    mediaHomePath() {
      return `/${this.mediaType}`;
    },
    formatsKey() {
      return this.mtConfig.formatsKey;
    },
    formatInofo() {
      return this.$store.state[this.formatsKey].find((formatObj) => {
        if (formatObj.name == this.format) return formatObj;
      });
    },
    formats() {
      return this.$store.state[this.formatsKey].filter(
        (format) => format.canConvertFrom !== false
      );
    },
  },
};
</script>
