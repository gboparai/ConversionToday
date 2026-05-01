<style scoped lang="scss">
@import "src/styles/_utilities";

.file-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background-color: lighten($alBlack, 10);
  border-radius: $default-radius;
  overflow: hidden;
  position: relative;

  .processing-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    z-index: 0;
    background: linear-gradient(
      90deg,
      rgba($alBlack, 0) 0%,
      rgba($alBlack, 0.6) 25%,
      rgba($alBlack, 0) 50%,
      rgba($alBlack, 0.6) 75%,
      rgba($alBlack, 0) 100%
    );
    animation-name: scan;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    pointer-events: none;
  }

  .file-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.95rem;
    position: relative;
    z-index: 1;
  }

  .status-badge {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.55rem;
    border-radius: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    position: relative;
    z-index: 1;

    &--waiting    { background-color: rgba($alWhite, 0.25); color: $white; }
    &--converting { background-color: $blue;                color: $black; }
    &--failed     { background-color: $negative;            color: $white; }
    &--successful { background-color: $positive;            color: $white; }
  }

  .download-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: $positive;
    color: $white;
    text-decoration: none;
    position: relative;
    z-index: 1;

    svg {
      width: 1rem;
      height: 1rem;
      fill: currentColor;
    }

    &--hidden {
      visibility: hidden;
      pointer-events: none;
    }
  }
}

@keyframes scan {
  0%   { transform: translateX(-50%); }
  100% { transform: translateX(0%); }
}
</style>
<template>
  <div class="file-row">
    <transition name="fade">
      <div v-if="file.status === FILE_STATUS.processing" class="processing-bar"></div>
    </transition>

    <span class="file-name">{{ file.name }}</span>

    <span :class="['status-badge', statusClass]">{{ statusLabel }}</span>

    <a
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
export default {
  name: "fileCell",
  props: {
    file: Object,
  },
  computed: {
    FILE_STATUS() {
      return FILE_STATUS;
    },
    blobURL() {
      let url = null;
      if (
        this.file.output.blob !== null &&
        this.file.output.blob !== undefined
      ) {
        url = URL.createObjectURL(this.file.output.blob);
      }
      this.$store.commit("setUrl", { id: this.file.id, url: url });
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
      this.$store.commit("setName", { id: this.file.id, name: name });
      return name;
    },
    statusLabel() {
      switch (this.file.status) {
        case FILE_STATUS.waiting:    return "Waiting";
        case FILE_STATUS.processing: return "Converting";
        case FILE_STATUS.failed:     return "Failed";
        case FILE_STATUS.processed:  return "Successful";
        default:                     return "Waiting";
      }
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
};
</script>
