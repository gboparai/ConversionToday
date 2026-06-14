<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;

.information {
  padding: 1rem 1.25rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  color: var(--text-primary);
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--border-accent);
  }
}

.informationName {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.informationDescription {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.55;
}
</style>

<template>
  <div class="information">
    <h2 class="informationName"><slot name="header"></slot></h2>
    <p class="informationDescription"><slot name="description"></slot></p>
  </div>
</template>

<script>
export default {
  name: "information",
};
</script>
