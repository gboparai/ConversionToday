<style scoped lang="scss">
@import "src/styles/_utilities";

.descriptorContainer {
  max-width: 55rem;
  margin: auto;
  margin-bottom: 2rem;
  padding: 0 1.25rem;
}

.decreptorHeader {
  text-align: center;
  font-size: 2.75rem;
  margin-bottom: 0;
  max-width: 100%;
  color: var(--text-primary);
  line-height: 1.2;
}

.decreptorDescription {
  text-align: center;
  font-size: 1.25rem;
  margin-top: 0.75rem;
  max-width: 100%;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media only screen and (max-width: 55rem) {
  .descriptorContainer {
    margin-bottom: 1.25rem;
  }
  .decreptorHeader {
    font-size: 1.85rem;
  }
  .decreptorDescription {
    font-size: 1.1rem;
  }
}
</style>

<template>
  <div class="descriptorContainer">
    <h1 class="decreptorHeader"><slot name="header"></slot></h1>
    <p class="decreptorDescription"><slot name="description"></slot></p>
  </div>
</template>

<script>
export default {
  name: "descriptor",
};
</script>
