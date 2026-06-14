<template>
  <transition name="fade">
    <div class="toast" v-if="visible">
      {{ message }}
    </div>
  </transition>
</template>

<script>
export default {
  name: "Toast",
  data() {
    return {
      visible: false,
      message: ""
    };
  },
  methods: {
    show(msg, duration = 3000) {
      this.message = msg;
      this.visible = true;
      setTimeout(() => {
        this.visible = false;
      }, duration);
    }
  }
};
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text-primary);
  color: var(--bg-primary);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 9999;
  font-size: 0.95rem;
  font-weight: 600;
  pointer-events: none;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
