<template>
  <div class="file-picker">
    <label class="fileInput" :class="{ 'fileInput--disabled': disabled }">
      <input
        :disabled="disabled"
        @change="inputChange"
        type="file"
        multiple
        :accept="acceptMimeTypes"
        :aria-label="ariaLabel"
      />
      <div class="file">
        <p>Add {{ label }} Here</p>
      </div>
    </label>

    <p v-if="skippedCount > 0" class="skippedNotice">
      {{ skippedCount }} file{{ skippedCount === 1 ? '' : 's' }} skipped &mdash; only
      <strong>{{ allowedExtensionsDisplay }}</strong>
      files are accepted on this page.
      <button class="skippedNotice__dismiss" @click="resetSkippedCount" aria-label="Dismiss">✕</button>
    </p>

    <transition name="fade">
      <p v-if="fileInDropZone > 0" class="dropTarget">{{ overlayText }}</p>
    </transition>
  </div>
</template>

<script>
export default {
  name: "FilePicker",
  props: {
    formatObj: {
      type: Object,
      default: null,
      // Object containing { name, extension, mimeType, etc. }
    },
    fallbackAccept: {
      type: String,
      default: "*/*", // e.g., "image/*" or ".pdf,.doc"
    },
    label: {
      type: String,
      default: "Files", // e.g., "Images", "PDFs"
    },
    overlayText: {
      type: String,
      default: "Drop Here", // e.g., "Drop Here"
    },
    ariaLabel: {
      type: String,
      default: "Add files",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    trackSkippedMetrics: {
      type: Function,
      default: null, // Hook to track skipped metrics (e.g. mixpanel)
    },
    filterFn: {
      type: Function,
      default: null,
    }
  },
  emits: ["files-selected"],
  data() {
    return {
      fileInDropZone: 0,
      skippedCount: 0,
    };
  },
  computed: {
    acceptMimeTypes() {
      if (this.formatObj) {
        const ext = String(this.formatObj.extension || this.formatObj.name || '').trim().toLowerCase();
        const parts = ext ? [`.${ext}`] : [];
        const mime = this.formatObj.mimeType ? String(this.formatObj.mimeType).trim() : null;
        if (mime) parts.push(mime);
        if (parts.length) return parts.join(',');
      }
      return this.fallbackAccept;
    },
    allowedExtensionsDisplay() {
      if (this.formatObj) {
        return `.${this.formatObj.extension || this.formatObj.name}`;
      }
      // Very basic fallback parser for fallbackAccept string displaying extensions
      if (this.fallbackAccept && this.fallbackAccept !== "*/*") {
        if (this.fallbackAccept.includes('/')) {
            return this.label.toLowerCase(); // e.g. "images"
        }
        return this.fallbackAccept.replace(/,/g, ', ');
      }
      return "supported";
    }
  },
  methods: {
    filterFiles(fileList) {
      if (this.filterFn) {
        return this.filterFn(fileList);
      }
      
      if (!this.formatObj) return Array.from(fileList);

      const allowedExt = String(this.formatObj.extension || this.formatObj.name || '').trim().toLowerCase();
      const allowedMimes = new Set(
        this.formatObj.mimeType
          ? [this.formatObj.mimeType.trim().toLowerCase().split(';')[0].trim()]
          : []
      );

      return Array.from(fileList).filter((file) => {
        const fileExt = (file.name.split('.').pop() || '').toLowerCase();
        const fileMime = (file.type || '').toLowerCase().split(';')[0].trim();
        const extMatch = allowedExt && fileExt === allowedExt;
        const mimeMatch = allowedMimes.size > 0 && allowedMimes.has(fileMime);
        return extMatch || mimeMatch;
      });
    },
    processFiles(filesArray) {
      this.resetSkippedCount();
      const filtered = this.filterFiles(filesArray);
      const skipped = filesArray.length - filtered.length;
      
      if (skipped > 0) {
        this.skippedCount += skipped;
        if (this.trackSkippedMetrics) {
          this.trackSkippedMetrics(skipped);
        }
      }
      
      if (filtered.length > 0) {
        this.$emit("files-selected", filtered);
      }
    },
    inputChange(e) {
      const allFiles = Array.from(e.target.files);
      if (!allFiles.length) return;
      this.processFiles(allFiles);
      e.target.value = ""; // reset input
    },
    fileDrop(e) {
      e.preventDefault();
      if (this.disabled) return;
      const allFiles = Array.from(e.dataTransfer.files);
      if (allFiles.length) {
        this.processFiles(allFiles);
      }
      this.fileInDropZone = 0;
    },
    fileOver(e) {
      e.preventDefault();
    },
    fileEnter(e) {
      e.preventDefault();
      if (this.disabled) return;
      this.fileInDropZone++;
    },
    fileLeave(e) {
      e.preventDefault();
      this.fileInDropZone--;
    },
    resetSkippedCount() {
      this.skippedCount = 0;
    }
  },
  mounted() {
    // We attach global window listeners so the drag overlay works over the whole page
    window.addEventListener("dragover", this.fileOver);
    window.addEventListener("dragenter", this.fileEnter);
    window.addEventListener("dragleave", this.fileLeave);
    window.addEventListener("drop", this.fileDrop);
  },
  beforeUnmount() {
    window.removeEventListener("dragover", this.fileOver);
    window.removeEventListener("dragenter", this.fileEnter);
    window.removeEventListener("dragleave", this.fileLeave);
    window.removeEventListener("drop", this.fileDrop);
  }
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.fileInput {
  @include mid-width;
  display: block;
  height: 9rem;
  margin-bottom: 1.25rem;
  position: relative;
  cursor: pointer;
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);

  > .file {
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
    border-radius: $default-radius;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-surface);
    border: 2px dashed var(--border);
    color: var(--text-secondary);
    font-size: 1rem;
    font-weight: 700;
  }
  &:hover > .file {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
    color: var(--text-primary);
  }
  &:active > .file {
    transform: translateY(0);
  }
  > input {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    z-index: -1;
  }
  > input:focus + .file {
    transition: 0.1s ease;
    box-shadow: 0 0 0 2px var(--border-focus);
  }
}

.dropTarget {
  @include abs-overlay;
  position: fixed;
  z-index: 100;
  margin: 0;
  background-color: rgba(15, 17, 23, 0.85);
  backdrop-filter: blur(6px);
  border: 3px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  font-weight: 900;
  pointer-events: none;
  overflow: hidden;
  text-align: center;
  color: var(--text-primary);
}

.skippedNotice {
  text-align: center;
  color: var(--negative);
  font-size: 0.95rem;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &__dismiss {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1.1rem;
    padding: 0 0.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    &:hover { color: var(--negative); }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
