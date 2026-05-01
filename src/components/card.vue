<style scoped lang="scss">
@import "src/styles/_utilities";

.card {
  padding: 1.25rem 1.5rem 3.5rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, border-color 0.2s;
  display: block;
  text-decoration: none;
  color: var(--text-primary);
  text-align: center;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--border-accent);
  }
}

.cardTypeContainer {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.cardName {
  text-align: center;
  margin: 0.75rem 0 0.5rem;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.cardDescription {
  text-align: center;
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.cardLink {
  text-align: center;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0.6rem 0;
  position: absolute;
  bottom: 0.75rem;
  width: 100%;
  left: 0;

  a {
    cursor: pointer;
    color: var(--accent);
    text-decoration: none;
    font-weight: 700;
    &:hover { text-decoration: underline; }
  }
}
</style>

<template>
  <div class="card">
    <div class="cardTypeContainer">
      <searchable-select
        :options="formatOptions"
        :model-value="selectedFormat"
        @change="onSelectChange"
      />
    </div>
    <h2 class="cardName"><slot name="header"></slot></h2>
    <p class="cardDescription"><slot name="description"></slot></p>
    <div class="cardLink">
      <a :href="path"> change </a>
    </div>
  </div>
</template>

<script>
import SearchableSelect from "@/components/searchable-select.vue";
export default {
  name: "card",
  components: { SearchableSelect },
  props: {
    path: String,
    formats: {
      type: Array,
      required: true,
    },
    selectedFormat: {
      type: String,
      required: true,
    },
    handleChange: {
      type: Function,
      required: true,
    },
  },
  computed: {
    formatOptions() {
      return this.formats.map((f) => ({
        value: f.name,
        label: f.name.toUpperCase(),
      }));
    },
  },
  methods: {
    onSelectChange(value) {
      this.handleChange({ target: { value } });
    },
  },
};
</script>
