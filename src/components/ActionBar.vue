<template>
  <div class="batchBar">
    <button
      v-for="(action, index) in actions"
      :key="index"
      class="batchBar__button"
      :disabled="action.disabled"
      @click="action.onClick"
    >
      <div>{{ action.label }}</div>
    </button>
  </div>
</template>

<script>
export default {
  name: "ActionBar",
  props: {
    actions: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.batchBar {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.25rem;

  &__button {
    flex: 1;
    min-width: 120px;
    border: none;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0;
    cursor: pointer;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: var(--shadow-sm);

    > div {
      background-color: var(--bg-secondary);
      padding: 0.55rem 1rem;
      border-radius: $default-radius;
      height: 100%;
      transition: background-color 0.15s, transform 0.15s;
    }

    &[disabled] {
      cursor: not-allowed;
      opacity: 0.4;
    }
    &:not([disabled]):hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-md);
      > div {
        background-color: var(--bg-surface-hover);
        transform: translateY(-2px);
      }
    }
    &:not([disabled]):active > div {
      transform: translateY(0);
    }
  }
}
</style>
