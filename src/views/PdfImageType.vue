<template>
  <descriptor>
    <template #header>{{ pageHeader }}</template>
    <template #description>
      Choose output format for {{ selectedInputInfo.label }} input, then process files on the next page.
    </template>
  </descriptor>

  <h2 class="toTitle">Convert {{ selectedInputInfo.label }} to:</h2>

  <div class="search-wrapper">
    <searchable-select
      :options="outputOptions"
      :model-value="selectedOutput"
      placeholder="Search output format..."
      @change="onOutputChange"
    />
  </div>

  <div class="selectorCon">
    <div class="selector" v-for="output in outputChips" :key="output.href">
      <a class="select" :href="output.href">
        <p>{{ output.label }}</p>
      </a>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Pair-based Routing</template>
      <template #description>
        Every conversion pair has a direct route so the processing page always opens with the expected input and output formats.
      </template>
    </information>
    <information>
      <template #header>Supported Image Inputs</template>
      <template #description>
        Image input is split by type (JPG, PNG, WEBP) so users can choose the exact workflow they need.
      </template>
    </information>
    <information>
      <template #header>Consistent Structure</template>
      <template #description>
        This follows the same three-step structure used by the main converter: home, type page, processing page.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">PDF and Image FAQ</h3>
    <faq :faqs="faqs" @toggle="toggleFaq" />
  </div>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Faq from "@/components/faq.vue";
import Information from "@/components/information.vue";
import SearchableSelect from "@/components/searchable-select.vue";
import { useMeta } from "vue-meta";

const INPUT_FORMATS = [
  {
    name: "pdf",
    label: "PDF",
    title: "PDF",
    description: "Extract every PDF page to JPG, PNG, or WEBP images.",
    outputs: ["png", "jpg", "jpeg", "webp"],
  },
  {
    name: "jpg",
    label: "JPG",
    title: "JPG",
    description: "Combine JPG files into one PDF document.",
    outputs: ["pdf"],
  },
  {
    name: "jpeg",
    label: "JPEG",
    title: "JPEG",
    description: "Combine JPEG files into one PDF document.",
    outputs: ["pdf"],
  },
  {
    name: "png",
    label: "PNG",
    title: "PNG",
    description: "Combine PNG files into one PDF document.",
    outputs: ["pdf"],
  },
  {
    name: "webp",
    label: "WEBP",
    title: "WEBP",
    description: "Combine WEBP files into one PDF document.",
    outputs: ["pdf"],
  },
];

const OUTPUT_LABEL = {
  png: "PNG",
  jpg: "JPG",
  jpeg: "JPEG",
  webp: "WEBP",
  pdf: "PDF",
};

function buildFaqs() {
  return [
    {
      question: "Why are JPG, PNG, and WEBP separate inputs now?",
      answer:
        "Splitting image input by format makes supported workflows explicit and keeps each conversion route clear.",
      open: false,
    },
    {
      question: "Which output formats are available for PDF?",
      answer: "PDF supports PNG, JPEG, and WEBP output.",
      open: false,
    },
    {
      question: "Can I output images from JPG?",
      answer:
        "No. JPG, PNG, and WEBP are designed for image-to-PDF packaging. PDF is used for PDF-to-image extraction.",
      open: false,
    },
  ];
}

export default {
  name: "PdfImageType",
  components: { Descriptor, Faq, Information, SearchableSelect },
  data() {
    useMeta({
      title: "PDF and Image Format Selector - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Choose PDF and image conversion pairs before processing. Supports PDF to PNG/JPG/WEBP and JPG/PNG/WEBP to PDF.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/pdf-image" }],
      htmlAttrs: { lang: "en" },
    });

    return {
      faqs: buildFaqs(),
    };
  },
  computed: {
    resolvedInputFormat() {
      const input = String(this.$route.params.format || "").toLowerCase();
      return INPUT_FORMATS.some((item) => item.name === input) ? input : "pdf";
    },
    pageHeader() {
      if (this.resolvedInputFormat === "pdf") return "PDF to Image Tool";
      return `${this.selectedInputInfo.title} Converter`;
    },
    selectedInputInfo() {
      return INPUT_FORMATS.find((item) => item.name === this.resolvedInputFormat) || INPUT_FORMATS[0];
    },
    selectedOutput() {
      return this.selectedInputInfo.outputs[0] || "";
    },
    outputOptions() {
      return this.selectedInputInfo.outputs.map((output) => ({
        value: output,
        label: OUTPUT_LABEL[output],
      }));
    },
    outputChips() {
      return this.selectedInputInfo.outputs.map((output) => ({
        label: OUTPUT_LABEL[output],
        href: `/pdf-image/${this.resolvedInputFormat}/${output}`,
      }));
    },
  },
  mounted() {
    if (this.selectedInputInfo.outputs.length === 1) {
      this.$router.replace(`/pdf-image/${this.resolvedInputFormat}/${this.selectedInputInfo.outputs[0]}`);
      return;
    }
    if (this.$route.path !== `/pdf-image/${this.resolvedInputFormat}`) {
      this.$router.replace(`/pdf-image/${this.resolvedInputFormat}`);
    }
  },
  methods: {
    onOutputChange(value) {
      const output = String(value || "").toLowerCase();
      if (!output) return;
      this.$router.push(`/pdf-image/${this.resolvedInputFormat}/${output}`);
    },
    toggleFaq(index) {
      this.faqs[index].open = !this.faqs[index].open;
    },
  },
};
</script>

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

.search-wrapper {
  @include mid-width;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.selectorCon {
  @include mid-width;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.selector {
  margin: 0 0.2rem 0.4rem;

  .select {
    padding: 0.4rem 0.9rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    transition: 0.15s ease;
    display: inline-block;
    text-decoration: none;
    color: var(--text-primary);
    font-size: 0.875rem;
    font-weight: 600;

    &:hover {
      background-color: var(--bg-surface-hover);
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    > p {
      margin: 0;
    }
  }
}

.faqSection {
  @include mid-width;
  margin-top: 1.75rem;
  margin-bottom: 2rem;

  &__title {
    text-align: center;
    font-size: 1.75rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
}
</style>
