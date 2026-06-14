<template>
  <descriptor>
    <template #header>Free Color Palette Extractor Online</template>
    <template #description>
      Extract beautiful, dominant color palettes from any image instantly using local canvas processing. Get formatted HEX/RGB swatches for free, directly in your browser.
    </template>
  </descriptor>

  <div class="search-wrapper">
    <searchable-select
      :options="inputOptions"
      :model-value="''"
      placeholder="Search and select input format..."
      @change="onInputChange"
    />
  </div>

  <div class="selectorCon">
    <div class="selector" v-for="format in formats" :key="format.value">
      <a class="select" :href="format.href">
        <p>{{ format.label }}</p>
      </a>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Extract Dominant Colors</template>
      <template #description>
        Upload any image and we'll instantly analyze its pixels to pull out the most prominent, dominant colors, returning a beautifully formatted palette.
      </template>
    </information>
    <information>
      <template #header>Click to Copy HEX</template>
      <template #description>
        Our interactive swatches allow you to click on any extracted color to instantly copy its exact HEX code to your clipboard for use in your designs.
      </template>
    </information>
    <information>
      <template #header>Zero Quality Loss, Infinite Privacy</template>
      <template #description>
        We run a client-side clustering algorithm entirely within your browser. Your images are never uploaded to any remote server, ensuring absolute privacy.
      </template>
    </information>
  </div>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import SearchableSelect from "@/components/searchable-select.vue";
import store from "@/store/index";
import { useMeta } from "vue-meta";

export default {
  name: "ColorPaletteHome",
  components: { Descriptor, Information, SearchableSelect },
  
  computed: {
    formats() {
      return store.state.formats.map(f => ({
        value: f.name,
        label: f.name.toUpperCase(),
        href: `/color-palette/${f.name}`
      }));
    },
    inputOptions() {
      return this.formats;
    }
  },

  methods: {
    onInputChange(e) {
      if (e.target.value) {
        this.$router.push({ path: `/color-palette/${e.target.value}` });
      }
    }
  },

  created() {
    useMeta({
      title: "Color Palette Extractor — Free Online Image Tool | No Limit Converter",
      meta: [
        {
          name: "description",
          content: "Extract beautiful, dominant color palettes from any image instantly using local canvas processing. 100% free, private, and fast.",
        },
        {
          property: "og:title",
          content: "Color Palette Extractor — Free Online Image Tool | No Limit Converter",
        },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:description",
          content: "Extract beautiful, dominant color palettes from any image instantly using local canvas processing. 100% free, private, and fast.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/color-palette" }],
      htmlAttrs: { lang: "en" },
    });
  }
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

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
    font-weight: 700;
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
