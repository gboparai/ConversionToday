<template>
  <descriptor>
    <template #header>Free Sprite Sheet Generator Online</template>
    <template #description>
      Stitch up to 50 images into a single PNG sprite sheet. Generates a perfectly mapped CSS or JSON coordinate file automatically. 100% free and unlimited.
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
      <template #header>Create Sprite Sheets Instantly</template>
      <template #description>
        Upload multiple images and instantly stitch them into one large, optimized PNG. Perfect for game development, web design, or minimizing HTTP requests.
      </template>
    </information>
    <information>
      <template #header>CSS & JSON Mapping Files</template>
      <template #description>
        We automatically calculate the X, Y, Width, and Height of every single frame and generate a ready-to-use CSS or JSON map file downloaded alongside your sprite sheet.
      </template>
    </information>
    <information>
      <template #header>Zero Quality Loss, Infinite Privacy</template>
      <template #description>
        We stitch the images locally on your device using HTML5 Canvas. Your assets are never uploaded to our servers, ensuring lightning-fast speeds and total privacy.
      </template>
    </information>
  </div>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import SearchableSelect from "@/components/searchable-select.vue";
import { store } from "@/store/index";
import { useMeta } from "vue-meta";

export default {
  name: "SpriteSheetHome",
  components: { Descriptor, Information, SearchableSelect },
  
  computed: {
    formats() {
      return store.state.config.formats.map(f => ({
        value: f.name,
        label: f.name.toUpperCase(),
        href: `/sprite-sheet/${f.name}`
      }));
    },
    inputOptions() {
      return this.formats;
    }
  },

  methods: {
    onInputChange(e) {
      if (e.target.value) {
        this.$router.push({ path: `/sprite-sheet/${e.target.value}` });
      }
    }
  },

  created() {
    useMeta({
      title: "Sprite Sheet Generator — Free Online Tool | No Limit Converter",
      meta: [
        {
          name: "description",
          content: "Stitch up to 50 images into a single PNG sprite sheet. Generates CSS or JSON coordinate files automatically. 100% free, private, and fast.",
        },
        {
          property: "og:title",
          content: "Sprite Sheet Generator — Free Online Tool | No Limit Converter",
        },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:description",
          content: "Stitch up to 50 images into a single PNG sprite sheet. Generates CSS or JSON coordinate files automatically. 100% free, private, and fast.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/sprite-sheet" }],
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
