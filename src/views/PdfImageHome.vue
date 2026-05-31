<template>
  <descriptor>
    <template #header>Free PDF to Image & Image to PDF Converter</template>
    <template #description>
      Extract every page of a PDF as an image, or combine unlimited images into one PDF — free, no file size limits, no restrictions.
    </template>
  </descriptor>

  <div class="search-wrapper">
    <searchable-select
      :options="inputOptions"
      :model-value="selectedInput"
      placeholder="Search and select input format..."
      @change="onInputChange"
    />
  </div>

  <div class="selectorCon">
    <div class="selector" v-for="entry in entries" :key="entry.href">
      <a class="select" :href="entry.href">
        <p>{{ entry.label }}</p>
      </a>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>PDF to Image - Bulk Extract All Pages</template>
      <template #description>
        Convert a PDF and extract every single page as a JPG, PNG or WEBP image file at once. Perfect for turning document scans into editable images.
      </template>
    </information>
    <information>
      <template #header>Image to PDF - Combine Unlimited Images</template>
      <template #description>
        Combine unlimited JPG, PNG and WEBP images into a single PDF document in the exact order you set. Ideal for creating photo books, reports or portfolios.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Convert large PDFs and high-resolution image collections without any file size restrictions. No paid plan required.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Free & No Signup Required</template>
      <template #description>
        No account, no email, no credit card needed. Every PDF to image and image to PDF conversion is completely free.
      </template>
    </information>
    <information>
      <template #header>Drag to Reorder</template>
      <template #description>
        When building a PDF from images, drag and drop files into exactly the right order before generating your document.
      </template>
    </information>
    <information>
      <template #header>Your Files Stay Private</template>
      <template #description>
        All processing happens directly in your browser. Your PDFs and images are never uploaded to any server.
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

const INPUT_OPTIONS = [
  { value: "pdf", label: "PDF", href: "/pdf-image/pdf" },
  { value: "jpg", label: "JPG", href: "/pdf-image/jpg" },
  { value: "jpeg", label: "JPEG", href: "/pdf-image/jpeg" },
  { value: "png", label: "PNG", href: "/pdf-image/png" },
  { value: "webp", label: "WEBP", href: "/pdf-image/webp" },
];

function buildFaqs() {
  return [
    {
      question: "Can I convert a PDF to multiple images?",
      answer:
        "Yes. Choose PDF input and an image output format, then extract every page as a separate image file.",
      open: false,
    },
    {
      question: "Can I combine images into one PDF?",
      answer:
        "Yes. Choose image input with PDF output, add JPG, PNG, or WEBP files, set the order, and generate one PDF.",
      open: false,
    },
    {
      question: "Are my files uploaded?",
      answer:
        "No. The full workflow runs in your browser, so files stay on your device.",
      open: false,
    },
    {
      question: "How do I pick output format for PDF extraction?",
      answer:
        "On the processing page, select JPG, PNG, or WEBP output before running extraction.",
      open: false,
    },
  ];
}

export default {
  name: "PdfImageHome",
  components: { Descriptor, Faq, Information, SearchableSelect },
  data() {
    return {
      selectedInput: "",
      entries: [
        { label: "PDF", href: "/pdf-image/pdf" },
        { label: "JPG", href: "/pdf-image/jpg" },
        { label: "JPEG", href: "/pdf-image/jpeg" },
        { label: "PNG", href: "/pdf-image/png" },
        { label: "WEBP", href: "/pdf-image/webp" },
      ],
      faqs: buildFaqs(),
    };
  },
  computed: {
    inputOptions() {
      return INPUT_OPTIONS;
    },
  },
  setup() {
    useMeta({
      title: "Free PDF to Image & Image to PDF Converter — No Limits | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert PDF pages to JPG, PNG or WEBP images, or combine unlimited images into a single PDF free online. No file size limits, no signup, no restrictions.",
        },
        {
          name: "keywords",
          content:
            "free pdf to image, pdf to jpg free, image to pdf free, convert pdf to png, combine images to pdf, free pdf converter, no limit pdf tool",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free PDF to Image & Image to PDF Converter — No Limits | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert PDF pages to JPG, PNG or WEBP images, or combine unlimited images into a single PDF free online. No file size limits, no signup.",
        },
        {
          property: "og:title",
          content: "Free PDF to Image & Image to PDF Converter — No Limits | No Limit Converter",
        },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:description",
          content:
            "Convert PDF pages to JPG, PNG or WEBP images, or combine unlimited images into a single PDF free online. No file size limits, no signup.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/pdf-image" }],
      htmlAttrs: { lang: "en" },
    });
  },
  methods: {
    onInputChange(value) {
      this.selectedInput = value;
      const picked = INPUT_OPTIONS.find((option) => option.value === value);
      if (picked) window.location.href = picked.href;
    },
    toggleFaq(index) {
      this.faqs[index].open = !this.faqs[index].open;
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.search-wrapper {
  @include mid-width;
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
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
