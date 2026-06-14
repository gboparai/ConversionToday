<template>
  <div class="familySelector">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="['familySelector__button', { 'familySelector__button--active': option.value === modelValue }]"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: "RadioGroup",
  props: {
    options: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: [String, Number],
      required: true,
    },
  },
  emits: ["update:modelValue"],
};
</script>

<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;

.familySelector {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 1rem;

  &__button {
    padding: 0.55rem 0.95rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-weight: 700;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;

    &:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    &--active {
      background-color: var(--accent);
      border-color: var(--accent);
      color: var(--accent-text);
      cursor: default;
      transform: none;
    }
  }
}
</style>
