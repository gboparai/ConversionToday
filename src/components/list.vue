
<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;
.list {
  width: 100%;
  padding: 0;
  list-style: none;
  margin: 0;
}
.listItem {
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
  color: var(--text-secondary);

  :deep(a) {
    color: var(--accent);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}
</style>
<template>
  <ol class="list">
    <li
      class="listItem"
      v-for="(html, index) in listOptions"
      :key="index"
      v-html="html"
    ></li>
  </ol>
</template>

<script>
export default {
  props: {
    listOptions: {
      type: Array,
      required: true,
    },
  },
};
</script>
