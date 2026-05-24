<style scoped lang="scss">
@import "src/styles/_utilities";

.ss-wrapper {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 160px;
  margin: 0 auto;
  user-select: none;
}

.ss-wrapper--full {
  display: flex;
  width: 100%;
  align-items: stretch;
  min-width: 0;
}

.ss-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
  white-space: nowrap;

  &:hover {
    background-color: var(--bg-surface-hover);
    border-color: var(--accent);
  }

  &:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: var(--shadow-focus);
  }

  .ss-caret {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 4px 0 4px;
    border-color: var(--text-secondary) transparent transparent transparent;
    transition: transform 0.2s;
    flex-shrink: 0;

    &--open {
      transform: rotate(180deg);
    }
  }
}

.ss-wrapper--full .ss-trigger {
  width: 100%;
}

.ss-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  min-width: 100%;
  width: max-content;
  max-width: min(90vw, 320px);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  animation: ss-fade-in 0.12s ease;
}

.ss-wrapper--full .ss-dropdown {
  left: 0;
  transform: none;
  width: 100%;
  max-width: none;
}

@keyframes ss-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.ss-search {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border);

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.35rem 0.65rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: calc(#{$default-radius} - 2px);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.15s;

    &::placeholder {
      color: var(--text-secondary);
    }

    &:focus {
      border-color: var(--border-focus);
      box-shadow: var(--shadow-focus);
    }
  }
}

.ss-options {
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 3px;
  }
}

.ss-option {
  padding: 0.45rem 0.85rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.1s;

  &:hover,
  &--focused {
    background-color: var(--bg-surface-hover);
  }

  &--selected {
    color: var(--accent);
    font-weight: 700;
  }
}

.ss-no-results {
  padding: 0.6rem 0.85rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: center;
}
</style>

<template>
  <div class="ss-wrapper" :class="{ 'ss-wrapper--full': fullWidth }" ref="wrapperRef">
    <button
      type="button"
      class="ss-trigger"
      :aria-haspopup="true"
      :aria-expanded="isOpen"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span>{{ selectedLabel }}</span>
      <span class="ss-caret" :class="{ 'ss-caret--open': isOpen }"></span>
    </button>

    <div v-if="isOpen" class="ss-dropdown" role="listbox">
      <div class="ss-search">
        <input
          ref="searchRef"
          v-model="query"
          type="search"
          :placeholder="searchPlaceholder"
          autocomplete="off"
          @keydown="onSearchKeydown"
        />
      </div>
      <div class="ss-options">
        <div
          v-if="filtered.length === 0"
          class="ss-no-results"
        >No results</div>
        <div
          v-for="(opt, idx) in filtered"
          :key="opt.value"
          class="ss-option"
          :class="{
            'ss-option--selected': opt.value === modelValue,
            'ss-option--focused': idx === focusedIndex,
          }"
          role="option"
          :aria-selected="opt.value === modelValue"
          @click="select(opt)"
          @mouseenter="focusedIndex = idx"
        >
          {{ opt.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchableSelect",
  emits: ["update:modelValue", "change"],
  props: {
    options: {
      type: Array,
      required: true,
      // [{ value: String, label: String }]
    },
    modelValue: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "Select…",
    },
    searchPlaceholder: {
      type: String,
      default: "Search…",
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isOpen: false,
      query: "",
      focusedIndex: -1,
    };
  },
  computed: {
    filtered() {
      const q = this.query.trim().toLowerCase();
      if (!q) return this.options;
      return this.options.filter((o) =>
        o.label.toLowerCase().includes(q)
      );
    },
    selectedLabel() {
      const found = this.options.find((o) => o.value === this.modelValue);
      return found ? found.label : this.placeholder;
    },
  },
  methods: {
    toggle() {
      this.isOpen ? this.close() : this.open();
    },
    open() {
      this.isOpen = true;
      this.query = "";
      this.focusedIndex = this.filtered.findIndex(
        (o) => o.value === this.modelValue
      );
      this.$nextTick(() => {
        this.$refs.searchRef && this.$refs.searchRef.focus();
      });
    },
    close() {
      this.isOpen = false;
      this.query = "";
      this.focusedIndex = -1;
    },
    select(opt) {
      this.$emit("update:modelValue", opt.value);
      this.$emit("change", opt.value);
      this.close();
    },
    onTriggerKeydown(e) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        this.open();
      }
    },
    onSearchKeydown(e) {
      if (e.key === "Escape") {
        this.close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.focusedIndex = Math.min(
          this.focusedIndex + 1,
          this.filtered.length - 1
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (this.focusedIndex >= 0 && this.filtered[this.focusedIndex]) {
          this.select(this.filtered[this.focusedIndex]);
        }
      }
    },
    onOutsideClick(e) {
      if (this.$refs.wrapperRef && !this.$refs.wrapperRef.contains(e.target)) {
        this.close();
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.onOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onOutsideClick);
  },
};
</script>
