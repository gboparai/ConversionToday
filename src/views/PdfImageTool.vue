<template>
  <descriptor>
    <template #header>PDF ↔ Image Tool</template>
    <template #description>
      Convert ordered JPG, PNG, and WEBP images to one PDF, or extract one PDF into page images (JPG, PNG, or WEBP) in your browser.
    </template>
  </descriptor>

  <div class="modeSelector">
    <button
      type="button"
      :class="['modeSelector__button', { 'modeSelector__button--active': mode === 'imagesToPdf' }]"
      @click="setMode('imagesToPdf')"
    >
      Images to PDF
    </button>
    <button
      type="button"
      :class="['modeSelector__button', { 'modeSelector__button--active': mode === 'pdfToImages' }]"
      @click="setMode('pdfToImages')"
    >
      PDF to Images
    </button>
  </div>

  <div v-if="mode === 'imagesToPdf'">
    <label class="fileInput">
      <input @change="inputImages" type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" />
      <div class="file">
        <p>Add JPG, PNG or WEBP Files Here</p>
      </div>
    </label>

    <div class="batchBar">
      <button class="batchBar__button" :disabled="imageFiles.length <= 0 || isProcessing" @click="processImagesToPdf">
        <div>Create PDF</div>
      </button>
      <button class="batchBar__button" :disabled="imageFiles.length <= 0 && !hasPdfOutput" @click="clearAll">
        <div>Clear All</div>
      </button>
    </div>

    <p v-if="unsupportedCount > 0" class="notice">
      {{ unsupportedCount }} file(s) were skipped. Only JPG, PNG, and WEBP are supported.
    </p>

    <div v-if="showProgressCard" class="progressCard">
      <div class="progressCard__top">
        <strong>{{ statusHeading }}</strong>
        <span>{{ progress }}%</span>
      </div>
      <div class="progressBar">
        <div class="progressBar__fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p>{{ statusMessage }}</p>
    </div>

    <div class="downloadCard" v-if="hasPdfOutput">
      <div>
        <strong>{{ pdfOutput.name }}</strong>
        <p>Your PDF file is ready.</p>
      </div>
      <a :href="pdfOutput.url" :download="pdfOutput.name">Download</a>
    </div>

    <div class="files">
      <p v-if="imageFiles.length > 1" class="queueHint">Drag files to change page order.</p>
      <div
        v-for="file in imageFiles"
        :key="file.id"
        class="fileRow"
        :class="{ 'fileRow--dragging': draggedId === file.id }"
        draggable="true"
        @dragstart="dragStart(file.id)"
        @dragover.prevent
        @drop="dropOn(file.id)"
      >
        <span class="fileRow__handle" aria-hidden="true">⋮⋮</span>
        <div class="fileRow__copy">
          <div class="fileRow__name">{{ file.name }}</div>
        </div>
        <button
          class="iconButton iconButton--remove"
          type="button"
          :disabled="isProcessing"
          @click="removeImageFile(file.id)"
          title="Remove"
          aria-label="Remove file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    </div>
  </div>

  <div v-else>
    <div class="formatBar">
      <label for="imageFormat">Output Image Format</label>
      <select id="imageFormat" v-model="selectedImageFormat" :disabled="isProcessing">
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
        <option value="webp">WEBP</option>
      </select>
    </div>

    <label class="fileInput">
      <input @change="inputPdf" type="file" accept=".pdf,application/pdf" />
      <div class="file">
        <p>{{ pdfFile ? pdfFile.name : 'Add One PDF File Here' }}</p>
      </div>
    </label>

    <div class="batchBar">
      <button class="batchBar__button" :disabled="!pdfFile || isProcessing" @click="processPdfToImages">
        <div>Extract Pages</div>
      </button>
      <button class="batchBar__button" :disabled="imageOutputs.length <= 0 || isProcessing" @click="downloadAllImages">
        <div>Download All</div>
      </button>
      <button class="batchBar__button" :disabled="imageOutputs.length <= 0 || isProcessing" @click="downloadZip">
        <div>Download ZIP</div>
      </button>
      <button class="batchBar__button" :disabled="!pdfFile && imageOutputs.length <= 0" @click="clearAll">
        <div>Clear All</div>
      </button>
    </div>

    <div v-if="showProgressCard" class="progressCard">
      <div class="progressCard__top">
        <strong>{{ statusHeading }}</strong>
        <span>{{ progress }}%</span>
      </div>
      <div class="progressBar">
        <div class="progressBar__fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p>{{ statusMessage }}</p>
    </div>

    <div class="files" v-if="imageOutputs.length > 0">
      <div v-for="output in imageOutputs" :key="output.name" class="fileRow fileRow--download">
        <div class="fileRow__copy">
          <div class="fileRow__name">{{ output.name }}</div>
        </div>
        <a class="iconButton iconButton--download" :href="output.url" :download="output.name" title="Download" aria-label="Download image">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20h14v-2H5v2zm7-18v10.17l-3.59-3.58L7 10l5 5 5-5-1.41-1.41L13 12.17V2h-1z"/></svg>
        </a>
      </div>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Ordered Output</template>
      <template #description>
        Drag image files to set exact page order before creating the PDF.
      </template>
    </information>
    <information>
      <template #header>Flexible Downloads</template>
      <template #description>
        PDF-to-image extraction supports per-page downloads, Download All, or one ZIP package.
      </template>
    </information>
    <information>
      <template #header>Local Processing</template>
      <template #description>
        Conversion runs in-browser with pdf-lib, PDF.js, canvas and JSZip so your files stay on your device.
      </template>
    </information>
  </div>
</template>

<script>
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import { useMeta } from "vue-meta";

const IMAGE_MIME_BY_FORMAT = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

export default {
  name: "PdfImageTool",
  components: { Descriptor, Information },
  setup() {
    useMeta({
      title: "PDF ↔ Image Tool - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Convert JPG, PNG and WEBP files to one PDF, or extract PDF pages to JPG, PNG or WEBP with download-all and ZIP output in-browser.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/pdf-image" }],
      htmlAttrs: { lang: "en" },
    });
  },
  data() {
    return {
      mode: "imagesToPdf",
      imageFiles: [],
      nextId: 0,
      draggedId: null,
      unsupportedCount: 0,
      isProcessing: false,
      progress: 0,
      statusMessage: "Waiting to start.",
      hasError: false,
      pdfOutput: { blob: null, url: null, name: null },
      pdfFile: null,
      selectedImageFormat: "png",
      imageOutputs: [],
      pdfjsLibRef: null,
    };
  },
  computed: {
    hasPdfOutput() {
      return !!(this.pdfOutput && this.pdfOutput.url && this.pdfOutput.name);
    },
    showProgressCard() {
      return this.isProcessing || this.hasPdfOutput || this.imageOutputs.length > 0 || this.hasError;
    },
    statusHeading() {
      if (this.isProcessing) return "Processing";
      if (this.hasError) return "Failed";
      if (this.hasPdfOutput || this.imageOutputs.length > 0) return "Complete";
      return "Ready";
    },
  },
  beforeUnmount() {
    this.revokePdfOutput();
    this.revokeImageOutputs();
  },
  methods: {
    setMode(mode) {
      if (this.mode === mode || this.isProcessing) return;
      this.mode = mode;
      this.clearAll();
    },
    resetStatus() {
      this.progress = 0;
      this.statusMessage = "Waiting to start.";
      this.hasError = false;
    },
    revokePdfOutput() {
      if (this.pdfOutput && this.pdfOutput.url) {
        URL.revokeObjectURL(this.pdfOutput.url);
      }
      this.pdfOutput = { blob: null, url: null, name: null };
    },
    revokeImageOutputs() {
      this.imageOutputs.forEach((output) => {
        if (output.url) URL.revokeObjectURL(output.url);
      });
      this.imageOutputs = [];
    },
    clearAll() {
      if (this.isProcessing) return;
      this.imageFiles = [];
      this.draggedId = null;
      this.nextId = 0;
      this.unsupportedCount = 0;
      this.pdfFile = null;
      this.revokePdfOutput();
      this.revokeImageOutputs();
      this.resetStatus();
    },
    inputImages(event) {
      if (this.isProcessing) return;
      const list = event.target.files || [];
      let skipped = 0;
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        if (!file) continue;
        if (!this.isSupportedImage(file)) {
          skipped++;
          continue;
        }
        this.imageFiles.push({
          id: this.nextId,
          file,
          name: file.name,
        });
        this.nextId++;
      }
      this.unsupportedCount += skipped;
      this.revokePdfOutput();
      this.resetStatus();
      event.target.value = "";
    },
    inputPdf(event) {
      if (this.isProcessing) return;
      const list = event.target.files || [];
      const file = list[0] || null;
      if (file && this.isPdf(file)) {
        this.pdfFile = file;
      } else {
        this.pdfFile = null;
      }
      this.revokeImageOutputs();
      this.resetStatus();
      event.target.value = "";
    },
    isPdf(file) {
      const extension = this.fileExtension(file.name);
      return extension === "pdf" || String(file.type || "").toLowerCase() === "application/pdf";
    },
    isSupportedImage(file) {
      const extension = this.fileExtension(file.name);
      if (["jpg", "jpeg", "png", "webp"].includes(extension)) return true;
      const mime = String(file.type || "").toLowerCase();
      return mime === "image/jpeg" || mime === "image/png" || mime === "image/webp";
    },
    fileExtension(name) {
      const parts = String(name || "").toLowerCase().split(".");
      return parts.length > 1 ? parts.pop() : "";
    },
    baseName(name, fallback) {
      const cleaned = String(name || fallback || "file").replace(/\.[^/.]+$/, "");
      return cleaned || fallback || "file";
    },
    removeImageFile(id) {
      if (this.isProcessing) return;
      this.imageFiles = this.imageFiles.filter((file) => file.id !== id);
      this.revokePdfOutput();
      this.resetStatus();
    },
    dragStart(id) {
      if (this.isProcessing) return;
      this.draggedId = id;
    },
    dropOn(targetId) {
      if (this.draggedId === null || this.draggedId === targetId || this.isProcessing) {
        this.draggedId = null;
        return;
      }
      const ids = this.imageFiles.map((file) => file.id);
      const fromIndex = ids.indexOf(this.draggedId);
      const targetIndex = ids.indexOf(targetId);
      if (fromIndex === -1 || targetIndex === -1) {
        this.draggedId = null;
        return;
      }
      const [moved] = ids.splice(fromIndex, 1);
      ids.splice(targetIndex, 0, moved);
      const byId = new Map(this.imageFiles.map((file) => [file.id, file]));
      this.imageFiles = ids.map((id) => byId.get(id)).filter(Boolean);
      this.draggedId = null;
      this.revokePdfOutput();
      this.resetStatus();
    },
    async imageBytesForPdf(file) {
      const extension = this.fileExtension(file.name);
      if (extension === "png" || file.type === "image/png") {
        return { type: "png", bytes: new Uint8Array(await file.arrayBuffer()) };
      }
      if (["jpg", "jpeg"].includes(extension) || file.type === "image/jpeg") {
        return { type: "jpg", bytes: new Uint8Array(await file.arrayBuffer()) };
      }
      if (extension === "webp" || file.type === "image/webp") {
        return { type: "png", bytes: await this.webpToPngBytes(file) };
      }
      throw new Error(`Unsupported image format: ${file.name}`);
    },
    async webpToPngBytes(file) {
      const url = URL.createObjectURL(file);
      try {
        const image = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Failed to decode WEBP image"));
          img.src = url;
        });
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        if (!pngBlob) throw new Error("Failed to convert WEBP image");
        return new Uint8Array(await pngBlob.arrayBuffer());
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    async processImagesToPdf() {
      if (!this.imageFiles.length || this.isProcessing) return;
      this.isProcessing = true;
      this.hasError = false;
      this.progress = 1;
      this.statusMessage = "Preparing";
      this.revokePdfOutput();
      try {
        const pdfDoc = await PDFDocument.create();
        for (let i = 0; i < this.imageFiles.length; i++) {
          this.progress = Math.round(5 + ((i / this.imageFiles.length) * 75));
          this.statusMessage = `Preparing ${i + 1} of ${this.imageFiles.length}`;
          const source = this.imageFiles[i];
          const encoded = await this.imageBytesForPdf(source.file);
          const image = encoded.type === "png"
            ? await pdfDoc.embedPng(encoded.bytes)
            : await pdfDoc.embedJpg(encoded.bytes);
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
        this.progress = 90;
        this.statusMessage = "Finalizing";
        const pdfBytes = await pdfDoc.save();
        const outputBlob = new Blob([pdfBytes], { type: "application/pdf" });
        const base = this.baseName(this.imageFiles[0] && this.imageFiles[0].name, "images");
        const name = `${base}-merged.pdf`;
        this.pdfOutput = {
          blob: outputBlob,
          url: URL.createObjectURL(outputBlob),
          name,
        };
        this.progress = 100;
        this.statusMessage = "PDF ready for download.";
      } catch (error) {
        this.hasError = true;
        this.progress = 0;
        this.statusMessage = error && error.message ? error.message : "Failed to create PDF.";
      } finally {
        this.isProcessing = false;
      }
    },
    async loadPdfJs() {
      if (this.pdfjsLibRef) return this.pdfjsLibRef;
      const workerSrc = `${window.location.origin}/vendor/pdfjs/pdf.worker.mjs`;
      const pdfjsLib = await import(/* webpackIgnore: true */ `${window.location.origin}/vendor/pdfjs/pdf.mjs`);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      this.pdfjsLibRef = pdfjsLib;
      return pdfjsLib;
    },
    async processPdfToImages() {
      if (!this.pdfFile || this.isProcessing) return;
      this.isProcessing = true;
      this.hasError = false;
      this.progress = 1;
      this.statusMessage = "Preparing";
      this.revokeImageOutputs();
      try {
        const pdfjsLib = await this.loadPdfJs();
        const arrayBuffer = await this.pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const outputs = [];
        const mimeType = IMAGE_MIME_BY_FORMAT[this.selectedImageFormat] || "image/png";
        const quality = this.selectedImageFormat === "png" ? undefined : 0.92;
        const base = this.baseName(this.pdfFile.name, "document");

        for (let i = 1; i <= pdf.numPages; i++) {
          this.progress = Math.round(5 + ((i - 1) / pdf.numPages) * 85);
          this.statusMessage = `Rendering page ${i} of ${pdf.numPages}`;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d");
          await page.render({ canvasContext: context, viewport }).promise;
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
          if (!blob) {
            throw new Error(`Failed to encode page ${i} as ${this.selectedImageFormat.toUpperCase()}`);
          }
          const outputName = `${base}-page-${i}.${this.selectedImageFormat}`;
          outputs.push({
            name: outputName,
            blob,
            url: URL.createObjectURL(blob),
          });
        }

        this.imageOutputs = outputs;
        this.progress = 100;
        this.statusMessage = "Images ready for download.";
      } catch (error) {
        this.hasError = true;
        this.progress = 0;
        this.statusMessage = error && error.message ? error.message : "Failed to extract PDF pages.";
      } finally {
        this.isProcessing = false;
      }
    },
    downloadAllImages() {
      this.imageOutputs.forEach((output) => {
        const a = document.createElement("a");
        a.href = output.url;
        a.download = output.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    },
    async downloadZip() {
      const zip = new JSZip();
      this.imageOutputs.forEach((output) => {
        zip.file(output.name, output.blob);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${this.baseName(this.pdfFile && this.pdfFile.name, "pdf-pages")}-images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.modeSelector,
.formatBar,
.fileInput,
.batchBar,
.notice,
.queueHint,
.progressCard,
.downloadCard,
.files {
  @include mid-width;
}

.modeSelector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;

  &__button {
    padding: 0.55rem 0.95rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-weight: 700;
    cursor: pointer;

    &--active {
      background-color: var(--accent);
      border-color: var(--accent);
      color: var(--accent-text);
    }
  }
}

.formatBar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;

  select {
    background-color: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    padding: 0.45rem 0.6rem;
  }
}

.fileInput {
  display: block;
  height: 8.5rem;
  margin-bottom: 1rem;
  position: relative;
  cursor: pointer;

  > .file {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $default-radius;
    border: 2px dashed var(--border);
    background-color: var(--bg-surface);
    color: var(--text-secondary);
    font-weight: 700;
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;

  &__button {
    flex: 1;
    min-width: 145px;
    border: 1px solid var(--border);
    background-color: var(--bg-surface);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0;
    cursor: pointer;

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

.notice,
.queueHint {
  margin-top: 0;
  margin-bottom: 0.85rem;
  color: var(--text-secondary);
}

.progressCard,
.downloadCard {
  margin-bottom: 1rem;
  padding: 1rem 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
}

.progressCard {
  &__top {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  p {
    margin: 0.75rem 0 0;
    color: var(--text-secondary);
  }
}

.progressBar {
  height: 0.55rem;
  border-radius: 999px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.08);

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e 0%, #06b6d4 100%);
    transition: width 0.2s ease;
  }
}

.downloadCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  p {
    margin: 0.35rem 0 0;
    color: var(--text-secondary);
  }

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 7.5rem;
    padding: 0.65rem 1rem;
    border-radius: $default-radius;
    background-color: var(--accent);
    color: var(--accent-text);
    text-decoration: none;
    font-weight: 800;
  }
}

.files {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-bottom: 1.5rem;
}

.fileRow {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.8rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;

  &--dragging {
    opacity: 0.65;
  }

  &--download {
    justify-content: space-between;
  }

  &__handle {
    color: var(--text-secondary);
    font-size: 1.1rem;
    cursor: grab;
  }

  &__copy {
    flex: 1;
    min-width: 0;
  }

  &__name {
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.iconButton {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  text-decoration: none;
  cursor: pointer;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
  }

  &--remove {
    background: var(--negative);
    color: #fff;
  }

  &--download {
    background: var(--accent);
    color: var(--accent-text);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@media only screen and (max-width: 55rem) {
  .downloadCard,
  .fileRow,
  .formatBar {
    flex-direction: column;
    align-items: flex-start;
  }

  .downloadCard a,
  .modeSelector__button {
    width: 100%;
  }
}
</style>
