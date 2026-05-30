<style scoped lang="scss">
@import "src/styles/_utilities";

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

  input {
    position: absolute;
    z-index: -1;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0);
    display: block;
    margin: 0;
    padding: 0;
  }
  input:checked + .select {
    font-weight: 900;
    background-color: var(--accent);
    color: var(--accent-text);
    cursor: default;
    > p { transform: scale(1.05); }
  }
  input:focus + .select {
    transition: all 0.6s ease, box-shadow 0.1s ease;
    box-shadow: 0 0 0 2px var(--border-focus);
    &:hover { transition: 0.1s ease; }
  }
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

.search-wrapper {
  @include mid-width;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
}

.desc {
  @include mid-width;
  text-align: center;
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
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
<template>
  <div class="search-wrapper">
    <searchable-select
      :options="formatOptions"
      :model-value="selectedFormat || ''"
      placeholder="Search & select format…"
      @change="onFormatChange"
    />
  </div>
  <div class="selectorCon">
    <div class="selector" v-for="format in formats" :key="format.name">
      <a class="select" :href="'/' + path + '/' + format.name">
        <p>
          {{ format.name }}
        </p>
      </a>
    </div>
  </div>
</template>

<script>
import SearchableSelect from "@/components/searchable-select.vue";
import { getMediaTypeConfig } from "@/js/media-types";
export default {
  name: "formatSelector",
  components: { SearchableSelect },
  props: {
    isFrom: Boolean,
    path: String,
    name: String,
    selectedFormat: String,
    mediaType: {
      type: String,
      default: 'image',
    },
  },
  computed: {
    formats() {
      const list = this.$store.state[this.formatsKey];
      if (this.isFrom) {
        return list.filter((f) => f.canConvertFrom !== false);
      }
      // For output formats, exclude input-only formats.
      return list.filter((f) => f.canConvertTo !== false);
    },
    formatsKey() {
      return getMediaTypeConfig(this.mediaType).formatsKey;
    },
    formatOptions() {
      return this.formats.map((f) => ({ value: f.name, label: f.name.toUpperCase() }));
    },
  },
  methods: {
    onFormatChange(value) {
      window.location.href = "/" + this.path + "/" + value;
    },
  },
};
</script>
