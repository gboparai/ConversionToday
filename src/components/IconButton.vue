<template>
  <component
    :is="componentTag"
    class="iconButton"
    :class="`iconButton--${variant}`"
    :type="type"
    :disabled="disabled"
    :href="href"
    :download="download"
    :title="title"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <!-- REMOVE SVG -->
    <svg v-if="variant === 'remove'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>

    <!-- DOWNLOAD SVG -->
    <svg v-else-if="variant === 'download'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20h14v-2H5v2zm7-18v10.17l-3.59-3.58L7 10l5 5 5-5-1.41-1.41L13 12.17V2h-1z"/></svg>
    
    <!-- PREVIEW SVG -->
    <svg v-else-if="variant === 'preview'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
    
    <slot v-else></slot>
  </component>
</template>

<script>
export default {
  name: "IconButton",
  props: {
    variant: {
      type: String,
      required: true,
      validator: (val) => ["remove", "download", "preview"].includes(val)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    },
    ariaLabel: {
      type: String,
      default: ""
    },
    href: {
      type: String,
      default: null
    },
    download: {
      type: String,
      default: null
    }
  },
  computed: {
    componentTag() {
      return this.href ? "a" : "button";
    },
    type() {
      return this.componentTag === "button" ? "button" : null;
    }
  },
  methods: {
    handleClick(event) {
      if (this.disabled) {
        event.preventDefault();
        return;
      }
      this.$emit("click", event);
    }
  }
};
</script>

<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;

.iconButton {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
  }

  &--remove {
    background: var(--negative);
    color: #fff;
  }

  &--download {
    background: var(--accent);
    color: var(--accent-text);
  }

  &--preview {
    background: var(--accent);
    color: var(--accent-text);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
