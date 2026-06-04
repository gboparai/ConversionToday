<style scoped lang="scss">
@import "src/styles/_utilities";

.file-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  overflow: hidden;
  position: relative;

  .processing-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0.3rem;
    z-index: 0;
    background-color: rgba(255, 255, 255, 0.08);
    overflow: hidden;
    pointer-events: none;
  }

  .processing-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e 0%, #06b6d4 100%);
    transition: width 0.2s ease;
    pointer-events: none;
  }

  .processing-fill--indeterminate {
    position: absolute;
    left: -30%;
    width: 30%;
    animation: progress-indeterminate 1.4s ease-in-out infinite;
    transition: none;
  }

  @keyframes progress-indeterminate {
    0%   { left: -30%; width: 30%; }
    50%  { left: 20%;  width: 60%; }
    100% { left: 110%; width: 30%; }
  }

  .file-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9rem;
    position: relative;
    z-index: 1;
    color: var(--text-primary);
  }

  .status-badge {
    flex-shrink: 0;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.55rem;
    border-radius: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    position: relative;
    z-index: 1;

    &--waiting    { background-color: var(--bg-surface-hover); color: var(--text-secondary); }
    &--converting { background-color: var(--accent);           color: var(--accent-text); }
    &--failed     { background-color: var(--negative);         color: #fff; }
    &--successful { background-color: var(--positive);         color: var(--positive-text); }
  }

  .remove-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: $negative;
    color: $white;
    border: none;
    cursor: pointer;
    position: relative;
    z-index: 1;

    svg {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
    }

    &:hover {
      background-color: darken($negative, 10%);
      color: $white;
    }
  }

  .download-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: var(--positive);
    color: var(--positive-text);
    text-decoration: none;
    position: relative;
    z-index: 1;
    transition: transform 0.15s, box-shadow 0.15s;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    svg {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
    }

    &--hidden {
      visibility: hidden;
      pointer-events: none;
    }
  }
}

</style>

<template>
  <div class="file-row">
    <transition name="fade">
      <div v-if="file.status === FILE_STATUS.processing" class="processing-bar">
        <div
          class="processing-fill"
          :class="{ 'processing-fill--indeterminate': !trackProgress }"
          :style="trackProgress ? { width: progressPercent + '%' } : {}"
        ></div>
      </div>
    </transition>

    <span class="file-name">{{ file.name }}</span>

    <span :class="['status-badge', statusClass]">{{ statusLabel }}</span>

    <button
      v-if="file.status === FILE_STATUS.waiting || file.status === FILE_STATUS.initialized || file.status === FILE_STATUS.failed"
      class="remove-btn"
      @click="removeFile"
      title="Remove"
      aria-label="Remove file"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
      </svg>
    </button>
    <a
      v-else
      :class="['download-btn', newFileName === null ? 'download-btn--hidden' : '']"
      :href="blobURL"
      :download="newFileName"
      title="Download"
      :aria-label="newFileName ? 'Download ' + newFileName : 'Download'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 20h14v-2H5v2zm7-18v10.17l-3.59-3.58L7 10l5 5 5-5-1.41-1.41L13 12.17V2h-1z"/>
      </svg>
    </a>
  </div>
</template>

<script>
import { FILE_STATUS } from "@/js/constants";
import { getMediaTypeConfig } from "@/js/media-types";
export default {
  name: "fileCell",
  props: {
    file: Object,
    mediaType: {
      type: String,
      default: 'image',
    },
  },
  computed: {
    FILE_STATUS() {
      return FILE_STATUS;
    },
    mtConfig() {
      return getMediaTypeConfig(this.mediaType);
    },
    trackProgress() {
      return this.mtConfig.trackProgress !== false;
    },
    blobURL() {
      let url = null;
      if (
        this.file.output.blob !== null &&
        this.file.output.blob !== undefined
      ) {
        url = URL.createObjectURL(this.file.output.blob);
      }
      this.$store.commit(this.mtConfig.setUrl, { id: this.file.id, url: url });
      return url;
    },
    newFileName() {
      let name = null;
      if (this.file.status === FILE_STATUS.processed) {
        name =
          this.file.name.split(".").slice(0, -1).join(".") +
          "." +
          this.file.output.config.format.extension;
      }
      this.$store.commit(this.mtConfig.setName, { id: this.file.id, name: name });
      return name;
    },
    statusLabel() {
      switch (this.file.status) {
        case FILE_STATUS.waiting:    return "Waiting";
        case FILE_STATUS.processing: return this.trackProgress ? `Converting ${this.progressPercent}%` : "Converting";
        case FILE_STATUS.failed:     return "Failed";
        case FILE_STATUS.processed:  return "Successful";
        default:                     return "Waiting";
      }
    },
    progressPercent() {
      return Math.max(0, Math.min(100, Number(this.file.progress) || 0));
    },
    statusClass() {
      switch (this.file.status) {
        case FILE_STATUS.waiting:    return "status-badge--waiting";
        case FILE_STATUS.processing: return "status-badge--converting";
        case FILE_STATUS.failed:     return "status-badge--failed";
        case FILE_STATUS.processed:  return "status-badge--successful";
        default:                     return "status-badge--waiting";
      }
    },
  },
  methods: {
    removeFile() {
      this.$store.commit(this.mtConfig.removeFile, this.file.id);
    },
  },
};
</script>
