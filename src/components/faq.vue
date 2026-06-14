<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;

.faq {
  max-width: 640px;
  margin: 0 auto 1.5rem;
}

.faqItem {
  margin-bottom: 0.75rem;
  border-radius: $default-radius;
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.faqQuestion {
  cursor: pointer;
  font-weight: 700;
  padding: 0.85rem 1rem;
  background-color: var(--bg-surface);
  color: var(--text-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.15s;
  font-size: 0.95rem;

  &:hover {
    background-color: var(--bg-surface-hover);
  }
}

.arrow {
  width: 0;
  height: 0;
  border-style: solid;
  flex-shrink: 0;
  margin-left: 0.75rem;
  transition: transform 0.2s;
}

.arrowDown {
  border-width: 5px 4px 0 4px;
  border-color: var(--text-secondary) transparent transparent transparent;
  transform: rotate(180deg);
}

.arrowUp {
  border-width: 5px 4px 0 4px;
  border-color: var(--text-secondary) transparent transparent transparent;
}

.faqAnswer {
  padding: 0.85rem 1rem;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  border-top: 1px solid var(--border);
}
</style>

<template>
  <div class="faq">
    <div v-for="(faq, index) in faqs" :key="index" class="faqItem">
      <div class="faqQuestion" @click="toggleAnswer(index)">
        {{ faq.question }}
        <span
          class="arrow"
          :class="{ arrowDown: faq.open, arrowUp: !faq.open }"
        ></span>
      </div>
      <div v-if="faq.open" class="faqAnswer">{{ faq.answer }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    faqs: {
      type: Array,
      required: true,
    },
  },
  methods: {
    toggleAnswer(index) {
      this.$emit("toggle", index);
    },
  },
};
</script>

