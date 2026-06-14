<template>
  <div class="range-slider" ref="slider">
    <div class="range-slider__track" @mousedown="onTrackDown"></div>
    <div class="range-slider__fill" :style="fillStyle" @mousedown="onTrackDown"></div>
    <div 
      class="range-slider__thumb range-slider__thumb--start" 
      :style="leftThumbStyle" 
      @mousedown.stop.prevent="onThumbDown('start', $event)"
      @touchstart.stop.prevent="onThumbDown('start', $event)"
    >
      <div class="range-slider__tooltip">{{ formattedStart }}</div>
    </div>
    <div 
      class="range-slider__thumb range-slider__thumb--end" 
      :style="rightThumbStyle" 
      @mousedown.stop.prevent="onThumbDown('end', $event)"
      @touchstart.stop.prevent="onThumbDown('end', $event)"
    >
      <div class="range-slider__tooltip">{{ formattedEnd }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RangeSlider',
  props: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    modelValue: {
      type: Array,
      default: () => [0, 100]
    }
  },
  data() {
    return {
      activeThumb: null,
      sliderRect: null,
    };
  },
  computed: {
    startVal() {
      return this.modelValue[0];
    },
    endVal() {
      return this.modelValue[1];
    },
    range() {
      return this.max - this.min;
    },
    startPercent() {
      if (this.range === 0) return 0;
      return ((this.startVal - this.min) / this.range) * 100;
    },
    endPercent() {
      if (this.range === 0) return 100;
      return ((this.endVal - this.min) / this.range) * 100;
    },
    fillStyle() {
      return {
        left: `${this.startPercent}%`,
        width: `${this.endPercent - this.startPercent}%`
      };
    },
    leftThumbStyle() {
      return {
        left: `${this.startPercent}%`
      };
    },
    rightThumbStyle() {
      return {
        left: `${this.endPercent}%`
      };
    },
    formattedStart() {
      return this.formatTime(this.startVal);
    },
    formattedEnd() {
      return this.formatTime(this.endVal);
    }
  },
  methods: {
    formatTime(seconds) {
      if (isNaN(seconds)) return "00:00";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const mStr = m.toString().padStart(2, '0');
      const sStr = s.toString().padStart(2, '0');
      if (h > 0) {
        return `${h}:${mStr}:${sStr}`;
      }
      return `${mStr}:${sStr}`;
    },
    onTrackDown(e) {
      if (this.range === 0) return;
      this.sliderRect = this.$refs.slider.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      if (clientX === undefined) return;
      
      const percent = (clientX - this.sliderRect.left) / this.sliderRect.width;
      const value = this.min + percent * this.range;
      
      const distToStart = Math.abs(value - this.startVal);
      const distToEnd = Math.abs(value - this.endVal);
      
      let thumbToMove = 'start';
      if (distToEnd < distToStart) {
        thumbToMove = 'end';
      }
      
      this.updateValue(thumbToMove, value);
      this.onThumbDown(thumbToMove, e);
    },
    onThumbDown(thumb, e) {
      this.activeThumb = thumb;
      this.sliderRect = this.$refs.slider.getBoundingClientRect();
      
      window.addEventListener('mousemove', this.onMove);
      window.addEventListener('touchmove', this.onMove, { passive: false });
      window.addEventListener('mouseup', this.onUp);
      window.addEventListener('touchend', this.onUp);
    },
    onMove(e) {
      if (!this.activeThumb) return;
      if (e.cancelable) e.preventDefault(); // prevent scrolling
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      if (clientX === undefined) return;
      
      let percent = (clientX - this.sliderRect.left) / this.sliderRect.width;
      percent = Math.max(0, Math.min(1, percent));
      
      let value = this.min + percent * this.range;
      this.updateValue(this.activeThumb, value);
    },
    onUp() {
      this.activeThumb = null;
      window.removeEventListener('mousemove', this.onMove);
      window.removeEventListener('touchmove', this.onMove);
      window.removeEventListener('mouseup', this.onUp);
      window.removeEventListener('touchend', this.onUp);
      
      this.$emit('change', this.modelValue);
    },
    updateValue(thumb, value) {
      let newStart = this.startVal;
      let newEnd = this.endVal;
      
      if (thumb === 'start') {
        newStart = Math.min(Math.max(this.min, value), newEnd);
      } else {
        newEnd = Math.max(Math.min(this.max, value), newStart);
      }
      
      this.$emit('update:modelValue', [newStart, newEnd]);
      this.$emit('input', [newStart, newEnd]); // For convenience if we listen to @input
    }
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('touchmove', this.onMove);
    window.removeEventListener('mouseup', this.onUp);
    window.removeEventListener('touchend', this.onUp);
  }
};
</script>

<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;

.range-slider {
  position: relative;
  width: 100%;
  height: 24px;
  margin: 30px 0 20px;
  user-select: none;
  
  &__track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 6px;
    transform: translateY(-50%);
    background-color: var(--border);
    border-radius: 3px;
    cursor: pointer;
  }
  
  &__fill {
    position: absolute;
    top: 50%;
    height: 6px;
    transform: translateY(-50%);
    background-color: var(--accent);
    border-radius: 3px;
    cursor: pointer;
  }
  
  &__thumb {
    position: absolute;
    top: 50%;
    width: 20px;
    height: 20px;
    background-color: #fff;
    border: 2px solid var(--accent);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: grab;
    z-index: 2;
    box-shadow: var(--shadow-sm);
    
    &:active {
      cursor: grabbing;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }
  
  &__tooltip {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--bg-surface);
    color: var(--text-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid var(--border);
    white-space: nowrap;
    box-shadow: var(--shadow-sm);
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 4px 4px 0;
      border-style: solid;
      border-color: var(--border) transparent transparent transparent;
    }
  }
}
</style>
