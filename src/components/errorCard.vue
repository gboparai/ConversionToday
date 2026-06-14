<template>
  <div class="errorCard" v-if="show">
    <strong>{{ title || '⚠️ Error' }}</strong>
    <p><slot>{{ message }}</slot></p>
  </div>
</template>

<script>
export default {
  name: 'ErrorCard',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.errorCard {
  @include mid-width;
  margin-bottom: 1rem;
  padding: 1rem 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--negative, #e74c3c);
  border-radius: $default-radius;
  color: var(--negative, #e74c3c);

  strong {
    display: block;
    margin-bottom: 0.35rem;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--negative, #e74c3c);
  }
}
</style>
