<template>
  <descriptor>
    <template #header>Image Compression</template>
    <template #description>
      Compress JPG, PNG, WEBP and AVIF files in your browser using JSquash. Upload as many files as you want, compress, preview, and download.
    </template>
  </descriptor>

  <label class="fileInput">
    <input @change="input" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif" />
    <div class="file">
      <p>Add Images Here</p>
    </div>
  </label>

  <div class="batchBar">
    <button class="batchBar__button" :disabled="processable.length <= 0 || compressing" @click="compressAll">
      <div>Compress All</div>
    </button>
    <button class="batchBar__button" :disabled="processed.length <= 0" @click="downloadAll">
      <div>Download All</div>
    </button>
    <button class="batchBar__button" :disabled="files.length <= 0" @click="clearAll">
      <div>Clear All</div>
    </button>
  </div>

  <p v-if="unsupportedCount > 0" class="notice">
    {{ unsupportedCount }} file(s) were skipped. Supported formats: JPG, PNG, WEBP, AVIF.
  </p>

  <div class="files">
    <div v-for="file in files" :key="file.id" class="fileRow">
      <div class="fileRow__name">{{ file.name }}</div>
      <div class="fileRow__status">{{ statusLabel(file.status) }}</div>
      <div v-if="file.status === FILE_STATUS.processed" class="fileRow__savings">
        {{ formatBytes(file.originalSize) }} → {{ formatBytes(file.compressedSize) }}
        <strong>({{ savedPercent(file) }}% saved)</strong>
      </div>
      <div class="fileRow__actions">
        <button
          v-if="file.status === FILE_STATUS.processed"
          class="iconButton iconButton--preview"
          @click="openPreview(file.id)"
          title="Preview compare"
          aria-label="Preview compare"
        >👁</button>
        <a
          v-if="file.status === FILE_STATUS.processed"
          class="iconButton iconButton--download"
          :href="file.output.url"
          :download="file.output.name"
          title="Download"
          :aria-label="'Download ' + file.output.name"
        >⬇</a>
        <button
          class="iconButton iconButton--remove"
          :disabled="file.status === FILE_STATUS.processing"
          @click="removeFile(file.id)"
          title="Remove"
          aria-label="Remove file"
        >✕</button>
      </div>
    </div>
  </div>

  <transition name="fade">
    <div v-if="previewFile" class="previewModal" @click.self="closePreview">
      <div class="previewPanel">
        <button class="previewPanel__close" @click="closePreview" aria-label="Close preview">✕</button>
        <h3>Before / After Preview</h3>
        <div class="compare">
          <img class="compare__img" :src="previewFile.output.url" alt="Compressed preview" />
          <div class="compare__overlay" :style="{ width: slider + '%' }">
            <img class="compare__img" :src="previewFile.originalUrl" alt="Original preview" />
          </div>
          <div class="compare__divider" :style="{ left: slider + '%' }"></div>
        </div>
        <div class="compareLabels">
          <span>Compressed</span>
          <span>Original</span>
        </div>
        <input v-model.number="slider" class="slider" type="range" min="0" max="100" />
      </div>
    </div>
  </transition>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import { FILE_STATUS } from "@/js/constants";
import { useMeta } from "vue-meta";

const SUPPORTED = ["jpg", "png", "webp", "avif"];
const COMPRESSION_OPTIONS = {
  jpg: { quality: 72, progressive: true, optimize_coding: true },
  webp: { quality: 70, method: 6 },
  avif: { quality: 45, speed: 6 },
};

export default {
  name: "Compression",
  components: { Descriptor },
  data() {
    useMeta({
      title: "Free Online Image Compression (JPG, PNG, WEBP, AVIF) - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Compress JPG, PNG, WEBP and AVIF files online for free using JSquash. Files stay local in your browser with batch compression and before/after preview.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/compression" }],
      htmlAttrs: { lang: "en" },
    });
    return {
      FILE_STATUS,
      nextId: 0,
      files: [],
      codecCache: {},
      unsupportedCount: 0,
      previewFileId: null,
      slider: 50,
    };
  },
  computed: {
    processable() {
      return this.files.filter((f) => f.status === FILE_STATUS.initialized || f.status === FILE_STATUS.failed);
    },
    processed() {
      return this.files.filter((f) => f.status === FILE_STATUS.processed);
    },
    compressing() {
      return this.files.some((f) => f.status === FILE_STATUS.processing);
    },
    previewFile() {
      return this.files.find((f) => f.id === this.previewFileId) || null;
    },
  },
  methods: {
    input(e) {
      this.addFiles(e.target.files);
      e.target.value = "";
    },
    normalizeFormat(format) {
      return format === "jpeg" ? "jpg" : format;
    },
    formatFromFile(file) {
      const ext = file.name.toLowerCase().split(".").pop() || "";
      if (ext === "jpeg") return "jpg";
      if (SUPPORTED.includes(ext)) return ext;
      if (file.type === "image/jpeg") return "jpg";
      if (file.type === "image/png") return "png";
      if (file.type === "image/webp") return "webp";
      if (file.type === "image/avif") return "avif";
      return null;
    },
    addFiles(list) {
      let skipped = 0;
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const format = this.formatFromFile(file);
        if (!format) {
          skipped++;
          continue;
        }
        this.files.push({
          id: this.nextId++,
          originalFile: file,
          format,
          name: file.name,
          status: FILE_STATUS.initialized,
          originalSize: file.size,
          compressedSize: null,
          originalUrl: URL.createObjectURL(file),
          output: { blob: null, url: null, name: null },
        });
      }
      this.unsupportedCount += skipped;
    },
    async codecFor(format) {
      const key = this.normalizeFormat(format);
      if (this.codecCache[key]) return this.codecCache[key];
      let codec = null;
      if (key === "jpg") codec = await import("@jsquash/jpeg");
      if (key === "png") codec = await import("@jsquash/png");
      if (key === "webp") codec = await import("@jsquash/webp");
      if (key === "avif") codec = await import("@jsquash/avif");
      this.codecCache[key] = codec;
      return codec;
    },
    encodeOptions(format) {
      const key = this.normalizeFormat(format);
      return COMPRESSION_OPTIONS[key] || {};
    },
    mimeType(format) {
      const key = this.normalizeFormat(format);
      if (key === "jpg") return "image/jpeg";
      if (key === "png") return "image/png";
      if (key === "webp") return "image/webp";
      return "image/avif";
    },
    async compressAll() {
      const targets = this.processable.map((f) => f.id);
      for (let i = 0; i < targets.length; i++) {
        await this.compressFile(targets[i]);
      }
    },
    async compressFile(id) {
      const file = this.files.find((f) => f.id === id);
      if (!file) return;
      file.status = FILE_STATUS.processing;
      try {
        const codec = await this.codecFor(file.format);
        const input = await file.originalFile.arrayBuffer();
        const decoded = await codec.decode(input);
        const encoded = await codec.encode(decoded, this.encodeOptions(file.format));
        const blob = new Blob([encoded], { type: this.mimeType(file.format) });
        if (file.output.url) URL.revokeObjectURL(file.output.url);
        file.output.blob = blob;
        file.output.url = URL.createObjectURL(blob);
        const extension = this.normalizeFormat(file.format);
        file.output.name = `${file.name.replace(/\.[^/.]+$/, "")}-compressed.${extension}`;
        file.compressedSize = blob.size;
        file.status = FILE_STATUS.processed;
      } catch (error) {
        console.error("Compression failed", error);
        file.status = FILE_STATUS.failed;
      }
    },
    downloadAll() {
      this.processed.forEach((file) => {
        const a = document.createElement("a");
        a.download = file.output.name;
        a.href = file.output.url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    },
    removeFile(id) {
      const file = this.files.find((f) => f.id === id);
      if (!file) return;
      if (file.originalUrl) URL.revokeObjectURL(file.originalUrl);
      if (file.output.url) URL.revokeObjectURL(file.output.url);
      if (this.previewFileId === id) this.closePreview();
      this.files = this.files.filter((f) => f.id !== id);
    },
    clearAll() {
      this.files.forEach((file) => {
        if (file.originalUrl) URL.revokeObjectURL(file.originalUrl);
        if (file.output.url) URL.revokeObjectURL(file.output.url);
      });
      this.files = [];
      this.previewFileId = null;
    },
    statusLabel(status) {
      if (status === FILE_STATUS.initialized) return "Ready";
      if (status === FILE_STATUS.processing) return "Compressing";
      if (status === FILE_STATUS.processed) return "Successful";
      return "Failed";
    },
    formatBytes(bytes) {
      if (bytes == null) return "0 B";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    },
    savedPercent(file) {
      if (!file.compressedSize || file.originalSize <= 0) return 0;
      const pct = ((file.originalSize - file.compressedSize) / file.originalSize) * 100;
      return Math.max(0, Math.round(pct));
    },
    openPreview(id) {
      this.previewFileId = id;
      this.slider = 50;
    },
    closePreview() {
      this.previewFileId = null;
    },
  },
  unmounted() {
    this.files.forEach((file) => {
      if (file.originalUrl) URL.revokeObjectURL(file.originalUrl);
      if (file.output.url) URL.revokeObjectURL(file.output.url);
    });
  },
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

  > input {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    z-index: -1;
  }
}

.batchBar {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.25rem;

  &__button {
    flex: 1;
    min-width: 150px;
    border: 1px solid var(--border);
    background-color: var(--bg-surface);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0;
    cursor: pointer;
    box-shadow: var(--shadow-sm);

    > div {
      background-color: var(--bg-secondary);
      padding: 0.55rem 1rem;
      border-radius: $default-radius;
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }
}

.notice {
  @include mid-width;
  color: var(--text-secondary);
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
}

.files {
  @include mid-width;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.fileRow {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  padding: 0.6rem 0.8rem;

  &__name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-primary);
  }

  &__status {
    font-size: 0.8rem;
    color: var(--text-secondary);
    min-width: 6rem;
    text-align: right;
  }

  &__savings {
    color: var(--text-secondary);
    font-size: 0.82rem;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
}

.iconButton {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;

  &--preview {
    background: var(--accent);
    color: var(--accent-text);
  }
  &--download {
    background: var(--positive);
    color: var(--positive-text);
  }
  &--remove {
    background: var(--negative);
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.previewModal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.previewPanel {
  width: min(900px, 95vw);
  position: relative;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  padding: 1rem;
  box-shadow: var(--shadow-md);

  h3 {
    margin: 0 0 0.8rem;
    text-align: center;
    color: var(--text-primary);
  }

  &__close {
    position: absolute;
    right: 0.75rem;
    top: 0.75rem;
    border: none;
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 50%;
    background: var(--negative);
    color: #fff;
    cursor: pointer;
  }
}

.compare {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: $default-radius;
  background: #111;

  &__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__overlay {
    position: absolute;
    inset: 0 auto 0 0;
    overflow: hidden;
    border-right: 2px solid #fff;
  }

  &__divider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #fff;
    transform: translateX(-1px);
  }
}

.compareLabels {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.45rem;
}

.slider {
  width: 100%;
  margin-top: 0.75rem;
}

@media only screen and (max-width: 55rem) {
  .fileRow {
    flex-wrap: wrap;
    &__status {
      min-width: auto;
      text-align: left;
    }
    &__savings {
      width: 100%;
    }
  }
}
</style>
