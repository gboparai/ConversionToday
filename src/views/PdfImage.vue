<template>
  <descriptor>
    <template #header>{{ pageHeader }}</template>
    <template #description>{{ pageDescription }}</template>
  </descriptor>

  <div class="informationBar">
    <card
      path="/pdf-image"
      :formats="inputFormats"
      :selectedFormat="resolvedInputFormat"
      :handleChange="handleChangeFormat1"
    >
      <template #header>{{ selectedInputInfo.title }}</template>
      <template #description>{{ selectedInputInfo.description }}</template>
    </card>

    <card
      :path="`/pdf-image/${resolvedInputFormat}`"
      :formats="outputFormats"
      :selectedFormat="resolvedOutputFormat"
      :handleChange="handleChangeFormat2"
    >
      <template #header>{{ selectedOutputInfo.title }}</template>
      <template #description>{{ selectedOutputInfo.description }}</template>
    </card>
  </div>

  <label
    class="fileInput"
    :class="{ 'fileInput--disabled': isPdfToImages && hasPdfFile }"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <input
      :disabled="isPdfToImages && hasPdfFile"
      @change="onInputChange"
      type="file"
      :multiple="isImagesToPdf"
      :accept="acceptAttr"
    />
    <div class="file">
      <p>{{ inputPrompt }}</p>
    </div>
  </label>

  <p v-if="isPdfToImages && hasPdfFile" class="notice">
    One PDF is already added. Remove it to enable drag and drop again.
  </p>

  <div v-if="isImagesToPdf" class="settingsBar">
    <div class="settingsCard">
      <div class="settingsCard__item">
        <span class="settingsCard__label">Page Orientation</span>
        <searchable-select
          :options="orientationOptions"
          :model-value="pageOrientation"
          :full-width="true"
          @change="pageOrientation = $event"
        />
      </div>
      <div class="settingsCard__item">
        <span class="settingsCard__label">Page Size</span>
        <searchable-select
          :options="pageSizeOptions"
          :model-value="pageSize"
          :full-width="true"
          @change="pageSize = $event"
        />
      </div>
      <div class="settingsCard__item">
        <span class="settingsCard__label">Margin</span>
        <searchable-select
          :options="marginOptions"
          :model-value="pageMargin"
          :full-width="true"
          @change="pageMargin = $event"
        />
      </div>
    </div>
  </div>

  <div class="batchBar">
    <button class="batchBar__button" :disabled="!canProcess" @click="process">
      <div>{{ processLabel }}</div>
    </button>
    <button class="batchBar__button" :disabled="!canDownloadAll" @click="downloadAll">
      <div>Download All</div>
    </button>
    <button class="batchBar__button" :disabled="!canDownloadAll" @click="downloadZip">
      <div>Download ZIP</div>
    </button>
    <button class="batchBar__button" :disabled="!canClear" @click="clearAll">
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

  <div class="downloadCard" v-if="isImagesToPdf && hasPdfOutput">
    <div>
      <strong>{{ pdfOutput.name }}</strong>
      <p>Your PDF file is ready.</p>
    </div>
    <a :href="pdfOutput.url" :download="pdfOutput.name">Download</a>
  </div>

  <div class="files" v-if="isImagesToPdf && imageFiles.length > 0">
    <p v-if="imageFiles.length > 1" class="queueHint">Drag files to change the page order.</p>
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

  <div class="files" v-if="isPdfToImages && hasPdfFile">
    <div class="fileRow">
      <div class="fileRow__copy">
        <div class="fileRow__name">{{ pdfFile.name }}</div>
      </div>
      <button
        class="iconButton iconButton--remove"
        type="button"
        :disabled="isProcessing"
        @click="removePdfFile"
        title="Remove"
        aria-label="Remove file"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    </div>
  </div>

  <div class="files" v-if="isPdfToImages && imageOutputs.length > 0">
    <div v-for="output in imageOutputs" :key="output.name" class="fileRow">
      <div class="fileRow__copy">
        <div class="fileRow__name">{{ output.name }}</div>
      </div>
      <a
        class="iconButton iconButton--download"
        :href="output.url"
        :download="output.name"
        title="Download"
        :aria-label="'Download ' + output.name"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20h14v-2H5v2zm7-18v10.17l-3.59-3.58L7 10l5 5 5-5-1.41-1.41L13 12.17V2h-1z"/></svg>
      </a>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Clear File Queue Visibility</template>
      <template #description>
        Every selected file is listed so it is always clear what is queued for conversion, helping avoid mistakes before processing.
      </template>
    </information>
    <information>
      <template #header>Optimized PDF-to-Image Flow</template>
      <template #description>
        In PDF-to-image mode, a single PDF is processed at a time so each page can be exported cleanly as PNG, JPG, JPEG, or WEBP files.
      </template>
    </information>
    <information>
      <template #header>Private Local Processing</template>
      <template #description>
        Conversion runs in-browser using pdf-lib, PDF.js, and canvas APIs without uploading files to a remote server.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Step 1</template>
      <template #description>
        Pick input and output formats from the cards above.
      </template>
    </information>
    <information>
      <template #header>Step 2</template>
      <template #description>
        Add files using the input area. Drag rows to set the page order.
      </template>
    </information>
    <information>
      <template #header>Step 3</template>
      <template #description>
        Process, then download individually, in bulk, or as ZIP.
      </template>
    </information>
  </div>
</template>

<script>
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import Card from "@/components/card.vue";
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import SearchableSelect from "@/components/searchable-select.vue";
import { useMeta } from "vue-meta";

const FORMAT_INFO = {
  pdf: {
    title: "Portable Document Format",
    description:
      "A PDF file is a multi-platform document created in Adobe's Portable Document Format. PDF files can contain text, images, and other content from any source application and are viewable on virtually every device.",
  },
  jpg: {
    title: "Joint Photographic Experts Group",
    description:
      "A JPG file is a raster image saved in the JPEG format, commonly used to store digital photographs and graphics. JPEG features lossy compression that can significantly reduce the size of an image without much degradation and supports up to 16,777,216 colors.",
  },
  jpeg: {
    title: "Joint Photographic Experts Group",
    description:
      "A JPEG file is an image saved in a compressed graphic format standardized by the Joint Photographic Experts Group (JPEG). It supports up to 24-bit color and utilizes lossy compression. Users commonly save digital photos and web graphics as JPEG files.",
  },
  png: {
    title: "Portable Network Graphic",
    description:
      "A PNG file is an image saved in the Portable Network Graphic (PNG) format, commonly used to store web graphics, digital photographs, and images with transparent backgrounds. It is compressed with lossless compression and supports transparency.",
  },
  webp: {
    title: "WebP",
    description:
      "A WEBP file is an image saved in the WebP raster image format developed by Google for web graphics. The WebP format reduces file size more than standard JPEG compression while maintaining similar or better image quality. It supports both lossy and lossless compression.",
  },
};

const INPUT_FORMATS = [
  { name: "pdf", title: FORMAT_INFO.pdf.title, description: FORMAT_INFO.pdf.description, outputFormats: ["png", "jpg", "jpeg", "webp"] },
  { name: "jpg", title: FORMAT_INFO.jpg.title, description: FORMAT_INFO.jpg.description, outputFormats: ["pdf"] },
  { name: "jpeg", title: FORMAT_INFO.jpeg.title, description: FORMAT_INFO.jpeg.description, outputFormats: ["pdf"] },
  { name: "png", title: FORMAT_INFO.png.title, description: FORMAT_INFO.png.description, outputFormats: ["pdf"] },
  { name: "webp", title: FORMAT_INFO.webp.title, description: FORMAT_INFO.webp.description, outputFormats: ["pdf"] },
];

const OUTPUT_FORMATS = {
  pdf: { name: "pdf", title: FORMAT_INFO.pdf.title, description: FORMAT_INFO.pdf.description },
  png: { name: "png", title: FORMAT_INFO.png.title, description: FORMAT_INFO.png.description },
  jpg: { name: "jpg", title: FORMAT_INFO.jpg.title, description: FORMAT_INFO.jpg.description },
  jpeg: { name: "jpeg", title: FORMAT_INFO.jpeg.title, description: FORMAT_INFO.jpeg.description },
  webp: { name: "webp", title: FORMAT_INFO.webp.title, description: FORMAT_INFO.webp.description },
};

const IMAGE_MIME_BY_FORMAT = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export default {
  name: "PdfImage",
  components: { Card, Descriptor, Information, SearchableSelect },
  data() {
    useMeta({
      title: "PDF and Image Tool - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert PDF pages to PNG, JPG, JPEG, or WEBP, or combine images into one PDF online. Free browser-based processing with no signup and local file handling.",
        },
        {
          name: "keywords",
          content:
            "pdf to image converter, pdf to png, pdf to jpg, image to pdf converter, jpg to pdf, png to pdf, webp to pdf, free pdf converter",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "PDF and Image Tool - No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert PDF pages to images or merge images into a PDF online. Free, no signup, and secure on-device processing.",
        },
        {
          property: "og:title",
          content: "PDF and Image Tool - No Limit Converter",
        },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:description",
          content:
            "Convert PDF pages to PNG/JPG/JPEG/WEBP or convert images to PDF with fast secure on-device processing.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/pdf-image" }],
      htmlAttrs: { lang: "en" },
    });

    return {
      imageFiles: [],
      nextId: 0,
      isProcessing: false,
      progress: 0,
      statusMessage: "Waiting to start.",
      hasError: false,
      pdfOutput: { blob: null, url: null, name: null },
      pdfFile: null,
      imageOutputs: [],
      pdfjsLibRef: null,
      draggedId: null,
      pageOrientation: "portrait",
      pageSize: "fit",
      pageMargin: "none",
    };
  },
  computed: {
    resolvedInputFormat() {
      const input = String(this.$route.params.format || "").toLowerCase();
      return ["pdf", "jpg", "jpeg", "png", "webp"].includes(input) ? input : "pdf";
    },
    resolvedOutputFormat() {
      const output = String(this.$route.params.format2 || "").toLowerCase();
      if (this.resolvedInputFormat !== "pdf") return "pdf";
      return ["png", "jpg", "jpeg", "webp"].includes(output) ? output : "png";
    },
    selectedInputInfo() {
      return INPUT_FORMATS.find((item) => item.name === this.resolvedInputFormat) || INPUT_FORMATS[0];
    },
    selectedOutputInfo() {
      return OUTPUT_FORMATS[this.resolvedOutputFormat] || OUTPUT_FORMATS.png;
    },
    inputFormats() {
      return INPUT_FORMATS.map((format) => ({
        name: format.name,
        title: format.title,
        description: format.description,
      }));
    },
    outputFormats() {
      return this.selectedInputInfo.outputFormats.map((name) => OUTPUT_FORMATS[name]);
    },
    isImagesToPdf() {
      return this.resolvedInputFormat !== "pdf";
    },
    isPdfToImages() {
      return this.resolvedInputFormat === "pdf";
    },
    pageHeader() {
      return this.isImagesToPdf
        ? `${this.resolvedInputFormat.toUpperCase()} to PDF Tool`
        : "PDF to Image Tool";
    },
    pageDescription() {
      if (this.isImagesToPdf) {
        return `Add ${this.resolvedInputFormat.toUpperCase()} files, drag to set order, then generate one PDF.`;
      }
      return `Add one PDF, then extract all pages as ${this.selectedOutputInfo.title} images.`;
    },
    inputPrompt() {
      if (this.isImagesToPdf) return `Add ${this.resolvedInputFormat.toUpperCase()} Files Here`;
      if (this.hasPdfFile) return `Added: ${this.pdfFile.name}`;
      return "Add One PDF File Here";
    },
    acceptAttr() {
      if (!this.isImagesToPdf) return ".pdf,application/pdf";
      if (this.resolvedInputFormat === "jpg" || this.resolvedInputFormat === "jpeg") return ".jpg,.jpeg,image/jpeg";
      if (this.resolvedInputFormat === "png") return ".png,image/png";
      return ".webp,image/webp";
    },
    hasPdfFile() {
      return !!this.pdfFile;
    },
    hasPdfOutput() {
      return !!(this.pdfOutput && this.pdfOutput.url && this.pdfOutput.name);
    },
    canProcess() {
      if (this.isProcessing) return false;
      return this.isImagesToPdf ? this.imageFiles.length > 0 : this.hasPdfFile;
    },
    canDownloadAll() {
      if (this.isProcessing) return false;
      return this.isImagesToPdf ? this.hasPdfOutput : this.imageOutputs.length > 0;
    },
    canClear() {
      if (this.isProcessing) return false;
      return this.imageFiles.length > 0 || this.hasPdfFile || this.hasPdfOutput || this.imageOutputs.length > 0;
    },
    orientationOptions() {
      return [
        { value: "portrait", label: "Portrait" },
        { value: "landscape", label: "Landscape" },
      ];
    },
    pageSizeOptions() {
      return [
        { value: "fit", label: "Fit (Same size as image)" },
        { value: "a4", label: "A4" },
        { value: "letter", label: "US Letter" },
      ];
    },
    marginOptions() {
      return [
        { value: "none", label: "No Margin" },
        { value: "small", label: "Small" },
        { value: "big", label: "Big" },
      ];
    },
    processLabel() {
      return this.isImagesToPdf ? "Create PDF" : "Extract Pages";
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
  watch: {
    $route(to, from) {
      const wasNormalize = this._normalizing;
      this._normalizing = false;
      this.normalizeRoute();
      if (!wasNormalize) this.clearAll();
    },
    pageOrientation() { this.revokePdfOutput(); this.resetStatus(); },
    pageSize()        { this.revokePdfOutput(); this.resetStatus(); },
    pageMargin()      { this.revokePdfOutput(); this.resetStatus(); },
  },
  mounted() {
    this.normalizeRoute();
  },
  beforeUnmount() {
    this.revokePdfOutput();
    this.revokeImageOutputs();
  },
  methods: {
    handleChangeFormat1(event) {
      const input = String(event.target.value || "pdf").toLowerCase();
      const selected = INPUT_FORMATS.find((format) => format.name === input) || INPUT_FORMATS[0];
      const nextOutput = selected.outputFormats[0] || "pdf";
      this.$router.push(`/pdf-image/${selected.name}/${nextOutput}`);
    },
    handleChangeFormat2(event) {
      const output = String(event.target.value || "pdf").toLowerCase();
      this.$router.push(`/pdf-image/${this.resolvedInputFormat}/${output}`);
    },
    normalizeRoute() {
      const expected = `/pdf-image/${this.resolvedInputFormat}/${this.resolvedOutputFormat}`;
      if (this.$route.path !== expected) {
        this._normalizing = true;
        this.$router.replace(expected);
      }
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
      this.imageFiles = [];
      this.nextId = 0;
      this.pdfFile = null;
      this.revokePdfOutput();
      this.revokeImageOutputs();
      this.resetStatus();
    },
    onInputChange(event) {
      if (this.isProcessing) return;
      const list = event.target.files || [];
      if (this.isImagesToPdf) {
        this.addImageFiles(list);
      } else {
        this.addPdfFile(list[0]);
      }
      event.target.value = "";
    },
    onDragOver(event) {
      if (this.isPdfToImages && this.hasPdfFile) {
        event.dataTransfer.dropEffect = "none";
        return;
      }
      event.dataTransfer.dropEffect = "copy";
    },
    onDrop(event) {
      if (this.isProcessing) return;
      const list = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files : [];
      if (this.isImagesToPdf) {
        this.addImageFiles(list);
      } else if (!this.hasPdfFile) {
        this.addPdfFile(list[0]);
      }
    },
    addImageFiles(list) {
      this.revokePdfOutput();
      this.resetStatus();
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        if (!file || !this.isSupportedSelectedImage(file)) continue;
        this.imageFiles.push({ id: this.nextId, file, name: file.name });
        this.nextId++;
      }
    },
    addPdfFile(file) {
      this.revokeImageOutputs();
      this.resetStatus();
      if (file && this.isPdf(file)) {
        this.pdfFile = file;
      }
    },
    removeImageFile(id) {
      if (this.isProcessing) return;
      this.imageFiles = this.imageFiles.filter((file) => file.id !== id);
      this.revokePdfOutput();
      this.resetStatus();
    },
    removePdfFile() {
      if (this.isProcessing) return;
      this.pdfFile = null;
      this.revokeImageOutputs();
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
      const from = this.imageFiles.findIndex((f) => f.id === this.draggedId);
      const to = this.imageFiles.findIndex((f) => f.id === targetId);
      if (from === -1 || to === -1) {
        this.draggedId = null;
        return;
      }
      const newList = [...this.imageFiles];
      const [moved] = newList.splice(from, 1);
      newList.splice(to, 0, moved);
      this.imageFiles = newList;
      this.draggedId = null;
      this.revokePdfOutput();
      this.resetStatus();
    },
    fileExtension(name) {
      const parts = String(name || "").toLowerCase().split(".");
      return parts.length > 1 ? parts.pop() : "";
    },
    baseName(name, fallback) {
      const cleaned = String(name || fallback || "file").replace(/\.[^/.]+$/, "");
      return cleaned || fallback || "file";
    },
    isPdf(file) {
      const extension = this.fileExtension(file.name);
      return extension === "pdf" || String(file.type || "").toLowerCase() === "application/pdf";
    },
    isSupportedSelectedImage(file) {
      const extension = this.fileExtension(file.name);
      const mime = String(file.type || "").toLowerCase();
      if (this.resolvedInputFormat === "jpg" || this.resolvedInputFormat === "jpeg") {
        return extension === "jpg" || extension === "jpeg" || mime === "image/jpeg";
      }
      if (this.resolvedInputFormat === "png") {
        return extension === "png" || mime === "image/png";
      }
      if (this.resolvedInputFormat === "webp") {
        return extension === "webp" || mime === "image/webp";
      }
      return false;
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
    async loadPdfJs() {
      if (this.pdfjsLibRef) return this.pdfjsLibRef;
      const workerSrc = `${window.location.origin}/vendor/pdfjs/pdf.worker.mjs`;
      const pdfjsLib = await import(/* webpackIgnore: true */ `${window.location.origin}/vendor/pdfjs/pdf.mjs`);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      this.pdfjsLibRef = pdfjsLib;
      return pdfjsLib;
    },
    async process() {
      if (!this.canProcess) return;
      if (this.isImagesToPdf) {
        await this.processImagesToPdf();
      } else {
        await this.processPdfToImages();
      }
    },
    _computePageLayout(imgW, imgH) {
      const MARGIN_PT = { none: 0, small: 28.35, big: 56.7 };
      const marginPt = MARGIN_PT[this.pageMargin] ?? 0;
      let pageW, pageH;
      if (this.pageSize === "a4") {
        [pageW, pageH] = [595.28, 841.89];
      } else if (this.pageSize === "letter") {
        [pageW, pageH] = [612, 792];
      } else {
        // fit: page = image size + margin whitespace
        return {
          pageW: imgW + marginPt * 2,
          pageH: imgH + marginPt * 2,
          x: marginPt,
          y: marginPt,
          drawW: imgW,
          drawH: imgH,
        };
      }
      // Apply orientation
      if (this.pageOrientation === "landscape" && pageW <= pageH) [pageW, pageH] = [pageH, pageW];
      else if (this.pageOrientation === "portrait" && pageW > pageH) [pageW, pageH] = [pageH, pageW];
      // Scale image to fill drawable area (maintain aspect ratio)
      const drawableW = pageW - marginPt * 2;
      const drawableH = pageH - marginPt * 2;
      const scale = Math.min(drawableW / imgW, drawableH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      return {
        pageW,
        pageH,
        x: marginPt + (drawableW - drawW) / 2,
        y: marginPt + (drawableH - drawH) / 2,
        drawW,
        drawH,
      };
    },
    async processImagesToPdf() {
      this.isProcessing = true;
      this.hasError = false;
      this.progress = 1;
      this.statusMessage = "Preparing";
      this.revokePdfOutput();
      try {
        const pdfDoc = await PDFDocument.create();
        for (let i = 0; i < this.imageFiles.length; i++) {
          this.progress = Math.round(5 + (i / this.imageFiles.length) * 80);
          this.statusMessage = `Adding image ${i + 1} of ${this.imageFiles.length}`;
          const source = this.imageFiles[i];
          const encoded = await this.imageBytesForPdf(source.file);
          const image = encoded.type === "png"
            ? await pdfDoc.embedPng(encoded.bytes)
            : await pdfDoc.embedJpg(encoded.bytes);
          const layout = this._computePageLayout(image.width, image.height);
          const page = pdfDoc.addPage([layout.pageW, layout.pageH]);
          page.drawImage(image, { x: layout.x, y: layout.y, width: layout.drawW, height: layout.drawH });
        }
        this.progress = 90;
        this.statusMessage = "Finalizing";
        const pdfBytes = await pdfDoc.save();
        const outputBlob = new Blob([pdfBytes], { type: "application/pdf" });
        const base = this.baseName(this.imageFiles[0] && this.imageFiles[0].name, "images");
        this.pdfOutput = { blob: outputBlob, url: URL.createObjectURL(outputBlob), name: `${base}-merged.pdf` };
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
    async processPdfToImages() {
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
        const mimeType = IMAGE_MIME_BY_FORMAT[this.resolvedOutputFormat] || "image/png";
        const quality = this.resolvedOutputFormat === "png" ? undefined : 0.92;
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
            throw new Error(`Failed to encode page ${i} as ${this.resolvedOutputFormat.toUpperCase()}`);
          }
          outputs.push({
            name: `${base}-page-${i}.${this.resolvedOutputFormat}`,
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
    _downloadItem(url, name) {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    downloadAll() {
      if (this.isImagesToPdf && this.hasPdfOutput) {
        this._downloadItem(this.pdfOutput.url, this.pdfOutput.name);
        return;
      }
      this.imageOutputs.forEach((o) => this._downloadItem(o.url, o.name));
    },
    async downloadZip() {
      const zip = new JSZip();
      if (this.isImagesToPdf && this.hasPdfOutput) {
        zip.file(this.pdfOutput.name, this.pdfOutput.blob);
      } else {
        this.imageOutputs.forEach((o) => zip.file(o.name, o.blob));
      }
      const blobZip = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blobZip);
      const base = this.isImagesToPdf
        ? this.baseName(this.imageFiles[0] && this.imageFiles[0].name, "images")
        : this.baseName(this.pdfFile && this.pdfFile.name, "pdf-pages");
      this._downloadItem(url, `${base}-results.zip`);
      URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.fileInput,
.batchBar,
.notice,
.queueHint,
.progressCard,
.downloadCard,
.files {
  @include mid-width;
}

.fileInput {
  display: block;
  height: 8.75rem;
  margin-bottom: 1rem;
  position: relative;
  cursor: pointer;
  border-radius: $default-radius;

  > .file {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $default-radius;
    border: 2px dashed var(--border);
    background-color: var(--bg-surface);
    color: var(--text-secondary);
    font-size: 1rem;
    font-weight: 700;
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  }

  &:hover > .file {
    transform: translateY(-3px);
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
    color: var(--text-primary);
  }

  > input {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    z-index: -1;
  }

  &--disabled {
    cursor: not-allowed;

    > .file {
      border-style: solid;
      opacity: 0.7;
      transform: none;
      box-shadow: none;
    }

    &:hover > .file {
      transform: none;
      border-color: var(--border);
      box-shadow: none;
      color: var(--text-secondary);
    }
  }
}

.batchBar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;

  &__button {
    flex: 1;
    min-width: 130px;
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

.notice {
  margin-top: 0;
  margin-bottom: 0.85rem;
  color: var(--text-secondary);
}

.settingsBar {
  @include mid-width;
  margin-bottom: 1rem;
}

.settingsCard {
  padding: 1.25rem 1.5rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  &__label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
}

@media only screen and (max-width: 40rem) {
  .settingsCard {
    grid-template-columns: 1fr;
  }
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

.queueHint {
  margin-top: 0;
  margin-bottom: 0.55rem;
  color: var(--text-secondary);
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
  transition: transform 0.15s, box-shadow 0.15s;

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
    background: var(--positive);
    color: var(--positive-text);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not([disabled]):hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

@media only screen and (max-width: 55rem) {
  .downloadCard {
    flex-direction: column;
    align-items: flex-start;
  }

  .downloadCard a {
    width: 100%;
  }
}
</style>
