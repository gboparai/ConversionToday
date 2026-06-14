<template>
  <div class="downloadCard">
    <div>
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
    </div>
    <a :href="url" :download="fileName">Download</a>
  </div>
</template>

<script>
export default {
  name: "DownloadCard",
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "Your file is ready.",
    },
    url: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.downloadCard {
  @include mid-width;
  margin-bottom: 1rem;
  padding: 1rem 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  p {
    margin: 0.35rem 0 0;
    color: var(--text-secondary);
  }

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 7.5rem;
    padding: 0.65rem 1rem;
    border-radius: $default-radius;
    background-color: var(--accent);
    color: var(--accent-text);
    text-decoration: none;
    font-weight: 800;
  }
}

@media only screen and (max-width: 55rem) {
  .downloadCard {
    flex-direction: column;
    align-items: flex-start;
  }

  .downloadCard a {
    width: 100%;
  }
}
</style>
