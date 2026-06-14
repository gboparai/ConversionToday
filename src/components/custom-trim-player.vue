<template>
  <div class="new-trim-player">
    <div class="media-stage" @click="!totalUnsupported && togglePlay()">
      
      <template v-if="!totalUnsupported">
        <video
          ref="videoElement"
          v-if="type === 'video'"
          class="media-layer"
          :src="src"
          playsinline
          preload="metadata"
          :muted="isMuted"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @play="onPlay"
          @pause="onPause"
          @ended="onPause"
          @error="onError"
        ></video>
        <audio
          ref="audioElement"
          v-if="type === 'audio'"
          class="media-layer"
          :src="src"
          preload="metadata"
          :muted="isMuted"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @play="onPlay"
          @pause="onPause"
          @ended="onPause"
          @error="onError"
        ></audio>

        <!-- Audio Unsupported Banner -->
        <transition name="fade">
          <div v-if="audioUnsupported" class="audio-warning-banner">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <span>Browser cannot preview this audio format. Video muted. Trimming will keep original audio.</span>
          </div>
        </transition>

        <!-- Play Overlay -->
        <transition name="fade">
          <div v-if="!isPlaying && duration > 0" class="play-overlay">
            <svg viewBox="0 0 24 24" class="play-icon"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </transition>
      </template>

      <!-- Total Unsupported State -->
      <div v-else class="unsupported-full-state">
        <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <h3>Preview Not Available</h3>
        <p>Browsers cannot play this file format. You can still trim it blindly below if you know the timestamps.</p>
      </div>
    </div>

    <div class="controls-deck">
      <template v-if="!totalUnsupported">
        <button class="btn-play" @click.stop="togglePlay" title="Play/Pause">
        <svg v-if="!isPlaying" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg v-else viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>

      <button v-if="!audioUnsupported" class="btn-mute" @click.stop="toggleMute" :title="isMuted ? 'Unmute' : 'Mute'">
        <svg v-if="!isMuted" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        <svg v-else viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
      </button>
      <button v-else class="btn-mute disabled" title="Audio format not supported by browser" disabled>
        <svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
      </button>

      <div class="time-label">{{ formatTime(currentTime) }}</div>

      <div class="timeline-area" ref="timeline" @mousedown="onTimelineDown" @touchstart.prevent="onTimelineDown">
        <div class="track-bg"></div>
        <div class="track-active" :style="{ left: startPercent + '%', width: (endPercent - startPercent) + '%' }"></div>
        
        <!-- Trim Handles -->
        <div class="trim-handle handle-left" 
             :style="{ left: startPercent + '%' }"
             @mousedown.stop.prevent="startDrag('start', $event)"
             @touchstart.stop.prevent="startDrag('start', $event)">
          <div class="handle-tooltip">{{ formatTime(startVal) }}</div>
        </div>
        
        <div class="trim-handle handle-right" 
             :style="{ left: endPercent + '%' }"
             @mousedown.stop.prevent="startDrag('end', $event)"
             @touchstart.stop.prevent="startDrag('end', $event)">
          <div class="handle-tooltip">{{ formatTime(endVal) }}</div>
        </div>

        <!-- Playhead -->
        <div class="playhead" :style="{ left: currentPercent + '%' }"></div>
      </div>

      <div class="time-label">{{ formatTime(duration) }}</div>
      </template>

      <!-- Blind Trimming Controls -->
      <template v-else>
        <div class="blind-trim-inputs">
          <span class="label">Start:</span>
          <input type="number" v-model.number="manualStartMin" @change="updateManualValue" min="0" placeholder="0" />
          <span class="unit">m</span>
          <input type="number" v-model.number="manualStartSec" @change="updateManualValue" min="0" max="59" placeholder="0" />
          <span class="unit">s</span>
          
          <span class="divider">to</span>
          
          <span class="label">End:</span>
          <input type="number" v-model.number="manualEndMin" @change="updateManualValue" min="0" placeholder="0" />
          <span class="unit">m</span>
          <input type="number" v-model.number="manualEndSec" @change="updateManualValue" min="0" max="59" placeholder="10" />
          <span class="unit">s</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomTrimPlayer',
  props: {
    src: { type: String, required: true },
    type: { type: String, default: 'video' },
    modelValue: { type: Array, default: () => [0, 0] }
  },
  data() {
    return {
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      isMuted: false,
      audioUnsupported: false,
      totalUnsupported: false,
      manualStartMin: 0,
      manualStartSec: 0,
      manualEndMin: 0,
      manualEndSec: 10,
      dragTarget: null, // 'start', 'end', or 'playhead'
      watchdogTimer: null,
      lastTimeUpdate: 0
    };
  },
  computed: {
    startVal() { 
      const val = parseFloat(this.modelValue[0]);
      return isNaN(val) ? 0 : val;
    },
    endVal() { 
      const val = parseFloat(this.modelValue[1]);
      const dur = parseFloat(this.duration);
      if (val > 0) return val;
      if (dur > 0) return dur;
      return 999999; // Safe fallback so it doesn't instantly pause
    },
    startPercent() { return this.duration ? (this.startVal / this.duration) * 100 : 0; },
    endPercent() { return this.duration ? (this.endVal / this.duration) * 100 : 100; },
    currentPercent() { return this.duration ? (this.currentTime / this.duration) * 100 : 0; },
    mediaEl() {
      const el = this.type === 'video' ? this.$refs.videoElement : this.$refs.audioElement;
      if (el) return el;
      return this.$el ? this.$el.querySelector('.media-layer') : null;
    }
  },
  watch: {
    src() {
      this.isPlaying = false;
      this.duration = 0;
      this.currentTime = 0;
      this.isMuted = false;
      this.audioUnsupported = false;
      this.totalUnsupported = false;
      this.manualStartMin = 0;
      this.manualStartSec = 0;
      this.manualEndMin = 0;
      this.manualEndSec = 10;
      this.stopWatchdog();
      this.$nextTick(() => {
        const media = this.mediaEl;
        if (media) media.load();
      });
    }
  },
  methods: {
    formatTime(sec) {
      if (isNaN(sec) || sec === 999999) return "00:00";
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      const ms = m.toString().padStart(2, '0');
      const ss = s.toString().padStart(2, '0');
      return h > 0 ? `${h}:${ms}:${ss}` : `${ms}:${ss}`;
    },
    startWatchdog() {
      this.stopWatchdog();
      this.lastTimeUpdate = Date.now();
      this.watchdogTimer = setInterval(() => {
        if (!this.isPlaying) return;
        // If a local blob URL stalls for >1000ms, the Chromium decoder has silently crashed.
        if (Date.now() - this.lastTimeUpdate > 1000 && !this.mediaEl.paused) {
          if (!this.isMuted) {
            console.warn("Watchdog detected silent decoder crash! Recovering...");
            this.audioUnsupported = true;
            this.isMuted = true;
            this.mediaEl.muted = true;
            this.mediaEl.load();
            this.mediaEl.currentTime = this.currentTime;
            this.mediaEl.play().catch(e => console.error(e));
          }
        }
      }, 500);
    },
    stopWatchdog() {
      if (this.watchdogTimer) {
        clearInterval(this.watchdogTimer);
        this.watchdogTimer = null;
      }
    },
    onLoadedMetadata(e) {
      this.duration = e.target.duration;
      this.$emit('durationchange', this.duration);
      if (!this.modelValue[1] || this.modelValue[1] === 0) {
        this.$emit('update:modelValue', [0, this.duration]);
      }
    },
    onPlay() { 
      this.isPlaying = true; 
      this.startWatchdog();
    },
    onPause() { 
      this.isPlaying = false; 
      this.stopWatchdog();
    },
    onError(e) {
      const media = e.target;
      if (media && media.error) {
        console.error("Media Error:", media.error.code, media.error.message);

        // Code 4 = MEDIA_ERR_SRC_NOT_SUPPORTED
        if (media.error.code === 4 && this.duration === 0) {
          this.totalUnsupported = true;
          this.stopWatchdog();
          this.manualStartMin = 0;
          this.manualStartSec = 0;
          this.manualEndMin = 0;
          this.manualEndSec = 10;
          this.$emit('update:modelValue', [0, 10]);
          return;
        }

        // Code 3 = MEDIA_ERR_DECODE, Code 4 = MEDIA_ERR_SRC_NOT_SUPPORTED (after metadata)
        if (media.error.code === 3 || media.error.code === 4) {
          if (!this.isMuted) {
            console.warn("Recovering from asynchronous decode crash by muting...");
            this.audioUnsupported = true;
            this.isMuted = true;
            media.muted = true;
            // The pipeline is likely crashed, so we must reload it
            media.load();
            media.currentTime = this.currentTime;
            const p = media.play();
            if (p !== undefined) {
              p.catch(err => console.error("Recovery play failed:", err));
            }
          }
        }
      }
    },
    onTimeUpdate(e) {
      this.lastTimeUpdate = Date.now();
      if (this.dragTarget === 'playhead') return;
      this.currentTime = e.target.currentTime;
      
      const media = this.mediaEl;
      if (!media) return;

      
      // Use 0.1s tolerance to prevent floating point boundary bouncing
      if (!media.paused && this.currentTime >= this.endVal - 0.1) {
        media.pause();
        media.currentTime = this.startVal;
        this.currentTime = this.startVal;
        this.isPlaying = false;
      }
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
    },
    togglePlay() {
      const media = this.mediaEl;
      if (!media) return;
      
      if (this.duration === 0 && media.duration > 0) {
        this.duration = media.duration;
        this.$emit('durationchange', this.duration);
        if (!this.modelValue[1] || this.modelValue[1] === 0) {
          this.$emit('update:modelValue', [0, this.duration]);
        }
      }

      if (media.paused) {
        // Use 0.1s tolerance to prevent floating point triggering constant seeking!
        // Seeking instantly before playing causes the play() promise to AbortError in Chrome.
        if (media.currentTime > this.endVal - 0.1 || media.currentTime < this.startVal - 0.1) {
          media.currentTime = this.startVal;
          this.currentTime = this.startVal;
        }
        
        // Force play and explicitly update state
        this.isPlaying = true;
        const p = media.play();
        if (p !== undefined) {
          p.catch(err => {
            console.error("Playback failed:", err);
            // Fallback: If browser rejects due to unsupported audio codec, try muting it!
            if (!media.muted) {
              console.warn("Attempting to play muted...");
              this.isMuted = true;
              media.muted = true;
              const retry = media.play();
              if (retry !== undefined) {
                retry.then(() => {
                  this.audioUnsupported = true;
                }).catch(retryErr => {
                  console.error("Muted playback also failed:", retryErr);
                  this.isPlaying = false;
                });
              }
            } else {
              this.isPlaying = false;
            }
          });
        }
      } else {
        media.pause();
        this.isPlaying = false;
      }
    },
    startDrag(target, e) {
      this.dragTarget = target;
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag);
      window.addEventListener('touchmove', this.onDrag, { passive: false });
      window.addEventListener('touchend', this.stopDrag);
    },
    onTimelineDown(e) {
      if (this.totalUnsupported || this.duration === 0) return;
      const rect = this.$refs.timeline.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const val = p * this.duration;
      
      const dStart = Math.abs(val - this.startVal);
      const dEnd = Math.abs(val - this.endVal);
      
      if (dStart < this.duration * 0.05 && dStart <= dEnd) {
        this.startDrag('start', e);
      } else if (dEnd < this.duration * 0.05) {
        this.startDrag('end', e);
      } else {
        this.dragTarget = 'playhead';
        this.updateValue(val);
        this.startDrag('playhead', e);
      }
    },
    onDrag(e) {
      if (!this.dragTarget) return;
      if (e.cancelable) e.preventDefault();
      const rect = this.$refs.timeline.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      this.updateValue(p * this.duration);
    },
    updateValue(val) {
      if (this.dragTarget === 'start') {
        const newStart = Math.min(val, this.endVal - 0.1);
        this.$emit('update:modelValue', [newStart, this.endVal]);
        this.mediaEl.currentTime = newStart;
        this.currentTime = newStart;
      } else if (this.dragTarget === 'end') {
        const newEnd = Math.max(val, this.startVal + 0.1);
        this.$emit('update:modelValue', [this.startVal, newEnd]);
        this.mediaEl.currentTime = newEnd;
        this.currentTime = newEnd;
      } else if (this.dragTarget === 'playhead') {
        this.mediaEl.currentTime = val;
        this.currentTime = val;
      }
    },
    updateManualValue() {
      let start = (parseInt(this.manualStartMin) || 0) * 60 + (parseInt(this.manualStartSec) || 0);
      let end = (parseInt(this.manualEndMin) || 0) * 60 + (parseInt(this.manualEndSec) || 0);
      
      if (start < 0) start = 0;
      if (end <= start) end = start + 1;
      
      this.manualStartMin = Math.floor(start / 60);
      this.manualStartSec = start % 60;
      this.manualEndMin = Math.floor(end / 60);
      this.manualEndSec = end % 60;

      this.$emit('update:modelValue', [start, end]);
    },
    stopDrag() {
      this.dragTarget = null;
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.stopDrag);
      window.removeEventListener('touchmove', this.onDrag);
      window.removeEventListener('touchend', this.stopDrag);
    }
  },
  beforeUnmount() {
    this.stopWatchdog();
    this.stopDrag();
  }
};
</script>

<style scoped>
.new-trim-player {
  width: 100%;
  background: var(--bg-surface, #1e1e24);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(0,0,0,0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
}

.media-stage {
  position: relative;
  width: 100%;
  background: #000;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.media-layer {
  width: 100%;
  max-height: 55vh;
  object-fit: contain;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  pointer-events: none;
}

.play-overlay svg {
  width: 40px;
  height: 40px;
  fill: currentColor;
  margin-left: 5px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.controls-deck {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 20px;
  background: var(--bg-surface, #1e1e24);
}

.btn-play {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: transform 0.1s;
  flex-shrink: 0;
}

.btn-play:active {
  transform: scale(0.95);
}

.btn-play svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.btn-mute {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
  color: var(--text-primary, #333);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-mute:hover {
  background: var(--border, rgba(0, 0, 0, 0.1));
}

.btn-mute.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: transparent;
  border-color: transparent;
  color: var(--text-secondary, #9ca3af);
}

.btn-mute.disabled:hover {
  background: transparent;
}

.btn-mute svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.audio-warning-banner {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(245, 158, 11, 0.95);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(4px);
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  max-width: 90%;
  text-align: left;
  line-height: 1.3;
}

.audio-warning-banner svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  flex-shrink: 0;
}

.time-label {
  font-family: monospace;
  font-size: 14px;
  color: var(--text-secondary, #9ca3af);
  user-select: none;
}

.timeline-area {
  flex: 1;
  height: 36px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.track-bg {
  position: absolute;
  width: 100%;
  height: 6px;
  background: rgba(150, 150, 150, 0.2);
  border-radius: 3px;
}

.track-active {
  position: absolute;
  height: 6px;
  background: linear-gradient(90deg, #22c55e, #10b981);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
}

.trim-handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 28px;
  background: #fff;
  border-radius: 6px;
  transform: translate(-50%, -50%);
  z-index: 10;
  cursor: ew-resize;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 2px solid #10b981;
}

.trim-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 12px;
  background: #10b981;
  border-radius: 1px;
}

.unsupported-full-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary, #9ca3af);
  height: 100%;
  min-height: 250px;
}

.unsupported-full-state svg {
  width: 48px;
  height: 48px;
  fill: currentColor;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.unsupported-full-state h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.unsupported-full-state p {
  margin: 0;
  font-size: 0.95rem;
  max-width: 400px;
  line-height: 1.4;
}

.blind-trim-inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  color: var(--text-primary, #333);
  font-weight: 500;
  flex-wrap: wrap;
}

.blind-trim-inputs .label {
  margin-right: 4px;
}

.blind-trim-inputs .unit {
  color: var(--text-secondary, #9ca3af);
  font-size: 0.9rem;
}

.blind-trim-inputs .divider {
  margin: 0 12px;
  color: var(--text-secondary, #9ca3af);
  font-size: 0.9rem;
  text-transform: uppercase;
}

.blind-trim-inputs input {
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border, rgba(0, 0, 0, 0.2));
  color: var(--text-primary, #333);
  padding: 8px 8px;
  border-radius: 6px;
  width: 56px;
  font-family: monospace;
  font-size: 1rem;
  text-align: center;
}

.blind-trim-inputs input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.handle-tooltip {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-surface, #27272a);
  color: var(--text-primary, #fff);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  white-space: nowrap;
  border: 1px solid var(--border, #444);
}

.trim-handle:hover .handle-tooltip,
.trim-handle:active .handle-tooltip {
  opacity: 1;
}

.playhead {
  position: absolute;
  top: 50%;
  width: 4px;
  height: 24px;
  background: #fff;
  transform: translate(-50%, -50%);
  border-radius: 2px;
  z-index: 15;
  pointer-events: none;
  box-shadow: 0 0 6px rgba(0,0,0,0.5);
}
</style>
