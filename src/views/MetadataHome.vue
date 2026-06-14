<template>
  <descriptor>
    <template #header>Free EXIF & Metadata Remover Online — No Limits</template>
    <template #description>
      Strip hidden tracking data, GPS location tags, camera information, and document author details from files securely within your browser. 100% free, private, and unlimited.
    </template>
  </descriptor>

  <radio-group
    :options="[
      { label: 'Images', value: 'image' },
      { label: 'Video', value: 'video' },
      { label: 'Audio', value: 'audio' },
      { label: 'Documents', value: 'document' }
    ]"
    v-model="category"
  />

  <div class="search-wrapper">
    <searchable-select
      :options="formatOptions"
      :model-value="''"
      placeholder="Search & select format…"
      @change="onFormatChange"
    />
  </div>

  <div class="selectorCon">
    <div class="selector" v-for="format in formats" :key="format.name">
      <a class="select" :href="'/metadata-remover/' + category + '/' + format.name">
        <p>{{ format.name }}</p>
      </a>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Protect Your Privacy</template>
      <template #description>
        Photos and documents often contain hidden metadata, including GPS coordinates, author names, creation dates, and camera settings. This tool strips that invisible data to protect your privacy before you share files online.
      </template>
    </information>
    <information>
      <template #header>Zero Quality Loss</template>
      <template #description>
        We strip metadata without re-encoding your media. Videos and audio files are stripped in seconds with absolute zero loss in quality. Images and documents are safely scrubbed without altering their contents.
      </template>
    </information>
    <information>
      <template #header>Works on 80+ Formats</template>
      <template #description>
        Support for 50+ image formats (JPG, HEIC, PSD), standard video and audio formats, plus 15+ document formats including PDF, DOCX, XLSX, PPTX, ODT, and EPUB.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>100% Private — Browser Based</template>
      <template #description>
        All stripping happens entirely within your web browser using WebAssembly. Your files are never uploaded to any server. Your sensitive data stays strictly on your device.
      </template>
    </information>
    <information>
      <template #header>No File Size Limits</template>
      <template #description>
        Strip metadata from massive 4K videos or giant high-res raw images without hitting any upload cap or size restriction. Truly unlimited.
      </template>
    </information>
    <information>
      <template #header>Free, No Signup</template>
      <template #description>
        No account, no email, no credit card required. Clean as many files as you want completely free with no daily caps.
      </template>
    </information>
  </div>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import SearchableSelect from "@/components/searchable-select.vue";
import RadioGroup from "@/components/RadioGroup.vue";
import { getMediaTypeConfig } from "@/js/media-types";
import { useMeta } from "vue-meta";

export default {
  name: "MetadataHome",
  components: { Descriptor, Information, SearchableSelect, RadioGroup },
  data() {
    return {
      category: "image"
    };
  },
  computed: {
    formatsKey() {
      const config = getMediaTypeConfig(this.category);
      if (this.category === 'document') {
        return 'documentMetadataFormats';
      }
      return config ? config.formatsKey : null;
    },
    formats() {
      if (!this.formatsKey) return [];
      return this.$store.state[this.formatsKey] || [];
    },
    formatOptions() {
      return this.formats.map((f) => ({ value: f.name, label: f.name.toUpperCase() }));
    }
  },
  methods: {
    onFormatChange(value) {
      if (value) {
        window.location.href = `/metadata-remover/${value}`;
      }
    }
  },
  setup() {
    useMeta({
      title: "Free EXIF & Metadata Remover Online — No Limits | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Strip hidden EXIF data, GPS location tags, and author info from images, video, audio, and documents. 100% free, private, and unlimited metadata remover.",
        },
        {
          name: "keywords",
          content:
            "free metadata remover, exif stripper, remove exif data, scrub document metadata, remove gps from photo, online privacy tool, free exif editor",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free EXIF & Metadata Remover Online — No Limits | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Strip hidden EXIF data, GPS location tags, and author info from images, video, audio, and documents. 100% free, private, and unlimited.",
        },
        {
          property: "og:title",
          content: "Free EXIF & Metadata Remover Online — No Limits | No Limit Converter",
        },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:description",
          content:
            "Strip hidden EXIF data, GPS location tags, and author info from images, video, audio, and documents. 100% free, private, and unlimited metadata remover.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/metadata-remover" }],
      htmlAttrs: { lang: "en" },
    });
  },
};
</script>

<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;



.search-wrapper {
  @include mid-width;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
}

.selectorCon {
  @include mid-width;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  gap: 0.5rem;
}

.selector {
  position: relative;
  margin: 0 0.2rem 0.4rem 0.2rem;

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
    cursor: pointer;

    &:hover {
      background-color: var(--bg-surface-hover);
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    > p {
      transition: 0.1s ease;
      margin: 0;
    }
  }
}

@media only screen and (max-width: 55rem) {
  .selectorCon {
    margin-bottom: 0.75rem;
  }
  .search-wrapper {
    flex-direction: column;
    padding: 0 1.25rem;
  }
}
</style>
