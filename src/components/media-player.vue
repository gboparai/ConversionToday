<template>
  <div class="media-player">
    <video 
      v-if="type === 'video'" 
      ref="media" 
      :src="src" 
      class="media-player__video"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      controls
    ></video>
    
    <audio 
      v-else-if="type === 'audio'" 
      ref="media" 
      :src="src" 
      class="media-player__audio"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      controls
    ></audio>
  </div>
</template>

<script>
export default {
  name: 'MediaPlayer',
  props: {
    src: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'video' // 'video' or 'audio'
    },
    range: {
      type: Array,
      default: () => [0, 0]
    }
  },
  data() {
    return {
      duration: 0
    };
  },
  watch: {
    range: {
      deep: true,
      handler(newRange) {
        const media = this.$refs.media;
        if (!media) return;
        
        // If current time is outside the new range, seek to the start of the range
        if (media.currentTime < newRange[0] || media.currentTime > newRange[1]) {
          media.currentTime = newRange[0];
        }
      }
    }
  },
  methods: {
    onLoadedMetadata(e) {
      this.duration = e.target.duration;
      this.$emit('durationchange', this.duration);
      // Initialize the range if it's currently [0,0]
      if (this.range[0] === 0 && this.range[1] === 0) {
        this.$emit('update:range', [0, this.duration]);
      }
    },
    onTimeUpdate(e) {
      const media = e.target;
      // Loop or stop if we hit the end of the range
      // Allow a small buffer (0.1s) for floating point inaccuracies
      if (this.range[1] > 0 && media.currentTime >= this.range[1] - 0.1) {
        media.pause();
        media.currentTime = this.range[0];
      }
    }
  }
};
</script>

<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;

.media-player {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  
  &__video {
    max-width: 100%;
    max-height: 50vh;
    border-radius: $default-radius;
    background-color: #000;
  }
  
  &__audio {
    width: 100%;
    max-width: 40rem;
  }
}
</style>
