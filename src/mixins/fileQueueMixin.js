export default {
  data() {
    return {
      skippedCount: 0,
    };
  },
  methods: {
    resetSkippedCount() {
      this.skippedCount = 0;
    },
    trackSkipped(count) {
      if (count > 0) {
        this.skippedCount += count;
      }
    },
  },
};
