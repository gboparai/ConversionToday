<template>
  <descriptor>
    <template #header>{{ pageTitle }}</template>
    <template #description>
      Compress {{ formatLabel }} files in your browser. Upload as many files as you want, compress, preview, and download.
    </template>
  </descriptor>

  <div class="informationBar">
    <card
      path="/compression"
      :formats="compressionFormats"
      :selectedFormat="routeFormat"
      :handleChange="handleChangeFormat"
    >
      <template #header>{{ selectedFormatInfo.title }}</template>
      <template #description>{{ selectedFormatInfo.description }}</template>
    </card>
  </div>

  <label class="fileInput">
    <input @change="input" type="file" multiple :accept="acceptAttr" />
    <div class="file">
      <p>Add {{ formatLabel }} Images Here</p>
    </div>
  </label>

  <div class="batchBar">
    <button class="batchBar__button" :disabled="processable.length <= 0 || compressing" @click="compressAll">
      <div>Compress All</div>
    </button>
    <button class="batchBar__button" :disabled="processed.length <= 0" @click="downloadAll">
      <div>Download All</div>
    </button>
    <button class="batchBar__button" :disabled="processed.length <= 0" @click="downloadZip">
      <div>Download ZIP</div>
    </button>
    <button class="batchBar__button" :disabled="files.length <= 0" @click="clearAll">
      <div>Clear All</div>
    </button>
  </div>

  <p v-if="unsupportedCount > 0" class="notice">
    {{ unsupportedCount }} file(s) were skipped. Supported: {{ formatLabel }}.
  </p>

  <div class="files">
    <div v-for="file in files" :key="file.id" class="fileRow">
      <div class="fileRow__name">{{ file.name }}</div>
      <div v-if="file.status === FILE_STATUS.processed" class="fileRow__savings">
        {{ formatBytes(file.originalSize) }} → {{ formatBytes(file.compressedSize) }} <strong>({{ savedPercent(file) }}% saved)</strong>
      </div>
      <div class="fileRow__actions">
        <span :class="['status-badge', statusClass(file.status)]">{{ statusLabel(file.status) }}</span>
        <button
          v-if="file.status === FILE_STATUS.processed"
          class="iconButton iconButton--preview"
          @click="openPreview(file.id)"
          title="Preview compare"
          aria-label="Preview compare"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
        </button>
        <a
          v-if="file.status === FILE_STATUS.processed"
          class="iconButton iconButton--download"
          :href="file.output.url"
          :download="file.output.name"
          title="Download"
          :aria-label="'Download ' + file.output.name"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20h14v-2H5v2zm7-18v10.17l-3.59-3.58L7 10l5 5 5-5-1.41-1.41L13 12.17V2h-1z"/></svg>
        </a>
        <button
          v-if="file.status !== FILE_STATUS.processed"
          class="iconButton iconButton--remove"
          :disabled="file.status === FILE_STATUS.processing"
          @click="removeFile(file.id)"
          title="Remove"
          aria-label="Remove file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    </div>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>{{ selectedFormatInfo.benefitTitle }}</template>
      <template #description>{{ selectedFormatInfo.benefitDescription }}</template>
    </information>
    <information>
      <template #header>Batch Compression</template>
      <template #description>
        Add one file or hundreds at once, compress them all in one pass, then
        download each result individually or as a ZIP.
      </template>
    </information>
    <information>
      <template #header>Before / After Preview</template>
      <template #description>
        Preview the compressed result against the original with a slider before
        deciding which files to keep.
      </template>
    </information>
  </div>
  <div class="infomationContainer">
    <information>
      <template #header>Step 1</template>
      <template #description>
        Select your {{ formatLabel }} images and add them to the queue.
      </template>
    </information>
    <information>
      <template #header>Step 2</template>
      <template #description>
        Click "Compress All" and wait while each image is optimized locally in
        your browser.
      </template>
    </information>
    <information>
      <template #header>Step 3</template>
      <template #description>
        Download the finished files one by one or export the whole batch as a
        single ZIP.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Compression FAQ</h3>
    <faq :faqs="faqs" @toggle="toggleFaq" />
  </div>

  <transition name="fade">
    <div v-if="previewFile" class="previewModal" @click.self="closePreview">
      <div class="previewPanel">
        <button class="previewPanel__close" type="button" @click.stop="closePreview" aria-label="Close preview">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.3z"/></svg>
        </button>
        <h3>Before / After Preview</h3>
        <div class="compare">
          <img class="compare__img" :src="previewFile.originalUrl" alt="Original preview" />
          <img class="compare__img compare__img--overlay" :src="previewFile.output.url" alt="Compressed preview" :style="{ clipPath: 'inset(0 ' + (100 - slider) + '% 0 0)' }" />
          <div class="compare__divider" :style="{ left: slider + '%' }"></div>
          <div class="compare__handle" :style="{ left: slider + '%' }" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 17H8l4 4 4-4h-3V7h3l-4-4-4 4h3z"/></svg>
          </div>
          <input v-model.number="slider" class="slider" type="range" min="0" max="100" aria-label="Preview comparison slider" />
          <div class="compareLabels">
            <span>Compressed</span>
            <span>Original</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Card from "@/components/card.vue";
import Descriptor from "@/components/descriptor.vue";
import Faq from "@/components/faq.vue";
import Information from "@/components/information.vue";
import { FILE_STATUS } from "@/js/constants";
import { useMeta } from "vue-meta";
import JSZip from "jszip";

const SUPPORTED = ["jpg", "png", "webp", "avif"];
const COMPRESSION_OPTIONS = {
  // The JPEG encoder expects snake_case option names.
  jpg: { quality: 72, progressive: true, optimize_coding: true },
  webp: { quality: 70, method: 6 },
  avif: { quality: 45, speed: 6 },
};

const COMPRESSION_FORMATS = [
  {
    name: "jpg",
    title: "Joint Photographic Experts Group",
    shortLabel: "JPG",
    description:
      "A JPG file is a raster image saved in the JPEG format, commonly used for digital photographs and web images. It uses lossy compression to reduce file size while preserving strong visual quality.",
    benefitTitle: "Smaller Photo Uploads",
    benefitDescription:
      "JPG compression is ideal for shrinking photos, screenshots, and product images so they load faster and take less storage space.",
  },
  {
    name: "png",
    title: "Portable Network Graphic",
    shortLabel: "PNG",
    description:
      "A PNG file is a raster image format commonly used for web graphics, interface elements, and images with transparent backgrounds. PNG preserves fine detail and sharp edges while supporting transparency.",
    benefitTitle: "Cleaner UI Graphics",
    benefitDescription:
      "PNG compression helps reduce the size of logos, icons, screenshots, and transparent assets without changing the file format you already use.",
  },
  {
    name: "webp",
    title: "WebP",
    shortLabel: "WEBP",
    description:
      "A WEBP file is a modern image format designed for the web. It supports both lossy and lossless compression, transparency, and excellent size-to-quality efficiency.",
    benefitTitle: "Optimized for the Web",
    benefitDescription:
      "WebP compression is a strong fit for website images when you want smaller file sizes and modern browser-friendly delivery.",
  },
  {
    name: "avif",
    title: "AV1 Image File Format",
    shortLabel: "AVIF",
    description:
      "An AVIF file is a next-generation image format based on the AV1 codec. It can deliver very small files at high visual quality and supports transparency and HDR content.",
    benefitTitle: "Maximum Size Reduction",
    benefitDescription:
      "AVIF compression is useful when you want aggressive file size savings while keeping strong visual quality for modern browsers and apps.",
  },
];

function buildFaqs(formatLabel) {
  return [
    {
      question: `How does ${formatLabel} compression work here?`,
      answer: `Your ${formatLabel} files are processed directly in the browser, then re-encoded with compression settings tuned for smaller file sizes while keeping usable image quality.`,
      open: false,
    },
    {
      question: "Are my images uploaded to a server?",
      answer:
        "No. Compression runs locally in your browser, so your files stay on your device throughout the process.",
      open: false,
    },
    {
      question: "Can I compress multiple files at once?",
      answer:
        "Yes. You can queue multiple images, compress them in a batch, and then download them individually or as a ZIP archive.",
      open: false,
    },
    {
      question: "Will compression reduce image quality?",
      answer:
        "Some formats use lossy compression, so there can be some visual change. The built-in preview makes it easy to compare the original and compressed versions before downloading.",
      open: false,
    },
  ];
}

export default {
  name: "Compression",
  components: { Card, Descriptor, Faq, Information },
  computed: {
    routeFormat() {
      const f = (this.$route.params.format || '').toLowerCase();
      return f === 'jpeg' ? 'jpg' : f;
    },
    formatLabel() {
      const labels = { jpg: 'JPG', png: 'PNG', webp: 'WebP', avif: 'AVIF' };
      return labels[this.routeFormat] || 'JPG, PNG, WebP & AVIF';
    },
    pageTitle() {
      const titles = { jpg: 'Compress JPEG Images', png: 'Compress PNG Images', webp: 'Compress WebP Images', avif: 'Compress AVIF Images' };
      return titles[this.routeFormat] || 'Image Compression';
    },
    compressionFormats() {
      return COMPRESSION_FORMATS;
    },
    selectedFormatInfo() {
      return COMPRESSION_FORMATS.find((format) => format.name === this.routeFormat) || COMPRESSION_FORMATS[0];
    },
    acceptAttr() {
      const map = {
        jpg: '.jpg,.jpeg,image/jpeg',
        png: '.png,image/png',
        webp: '.webp,image/webp',
        avif: '.avif,image/avif',
      };
      return map[this.routeFormat] || '.jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif';
    },
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
  data() {
    useMeta({
      title: "Free Online Image Compression (JPG, PNG, WEBP, AVIF) - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Compress JPG, PNG, WEBP and AVIF files online for free. Files stay local in your browser with batch compression and before/after preview.",
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
      faqs: buildFaqs((this.$route.params.format || "jpg").toUpperCase()),
    };
  },
  watch: {
    routeFormat() {
      this.files.forEach((file) => {
        if (file.originalUrl) URL.revokeObjectURL(file.originalUrl);
        if (file.output.url) URL.revokeObjectURL(file.output.url);
      });
      this.files = [];
      this.unsupportedCount = 0;
      this.previewFileId = null;
      this.faqs = buildFaqs(this.formatLabel);
    },
  },
  methods: {
    handleChangeFormat(e) {
      this.$router.push(`/compression/${e.target.value}`);
    },
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
        if (!format || (this.routeFormat && format !== this.routeFormat)) {
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
      const locateFile = (path) => `/${path}`;

      if (key === "jpg") {
        const [decodeModule, encodeModule] = await Promise.all([
          import("@jsquash/jpeg/decode.js"),
          import("@jsquash/jpeg/encode.js"),
        ]);
        await Promise.all([
          decodeModule.init({ locateFile }),
          encodeModule.init({ locateFile }),
        ]);
        codec = {
          decode: decodeModule.default,
          encode: encodeModule.default,
        };
      }

      if (key === "png") {
        const [decodeModule, encodeModule] = await Promise.all([
          import("@jsquash/png/decode.js"),
          import("@jsquash/png/encode.js"),
        ]);
        await Promise.all([
          decodeModule.init("/squoosh_png_bg.wasm"),
          encodeModule.init("/squoosh_png_bg.wasm"),
        ]);
        codec = {
          decode: decodeModule.default,
          encode: encodeModule.default,
        };
      }

      if (key === "webp") {
        const [decodeModule, encodeModule] = await Promise.all([
          import("@jsquash/webp/decode.js"),
          import("@jsquash/webp/encode.js"),
        ]);
        await Promise.all([
          decodeModule.init({ locateFile }),
          encodeModule.init({ locateFile }),
        ]);
        codec = {
          decode: decodeModule.default,
          encode: encodeModule.default,
        };
      }

      if (key === "avif") {
        const [decodeModule, encodeModule] = await Promise.all([
          import("@jsquash/avif/decode.js"),
          import("@jsquash/avif/encode.js"),
        ]);
        await Promise.all([
          decodeModule.init({ locateFile }),
          encodeModule.init({ locateFile }),
        ]);
        codec = {
          decode: decodeModule.default,
          encode: encodeModule.default,
        };
      }

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
      if (status === FILE_STATUS.initialized) return "Waiting";
      if (status === FILE_STATUS.processing) return "Compressing";
      if (status === FILE_STATUS.processed) return "Successful";
      return "Failed";
    },
    statusClass(status) {
      if (status === FILE_STATUS.initialized) return "status-badge--waiting";
      if (status === FILE_STATUS.processing) return "status-badge--converting";
      if (status === FILE_STATUS.processed) return "status-badge--successful";
      return "status-badge--failed";
    },
    async downloadZip() {
      const zip = new JSZip();
      for (const file of this.processed) {
        try {
          const response = await fetch(file.output.url);
          const blob = await response.blob();
          zip.file(file.output.name, blob);
        } catch (error) {
          console.error(`Error adding ${file.output.name} to zip:`, error);
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.download = "compressed_images.zip";
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    formatBytes(bytes) {
      // Intentionally catches both null and undefined values.
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
    toggleFaq(index) {
      this.faqs = this.faqs.map((faq, faqIndex) => ({
        ...faq,
        open: faqIndex === index ? !faq.open : faq.open,
      }));
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

.informationBar {
  @include mid-width;
  margin-bottom: 1.25rem;
}

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
  margin-bottom: 1.5rem;
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

.status-badge {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &--waiting    { background-color: var(--bg-surface-hover); color: var(--text-secondary); }
  &--converting { background-color: var(--accent);           color: var(--accent-text); }
  &--failed     { background-color: var(--negative);         color: #fff; }
  &--successful { background-color: var(--positive);         color: var(--positive-text); }
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

  &--preview {
    background: var(--accent);
    color: var(--accent-text);
  }
  &--download {
    background: var(--positive);
    color: var(--positive-text);
    &:hover { transform: scale(1.1); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
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
  padding: 1rem 1rem 1.1rem;
  box-shadow: var(--shadow-md);

  h3 {
    margin: 0 0 0.9rem;
    text-align: center;
    color: var(--text-primary);
  }

  &__close {
    position: absolute;
    right: 0.6rem;
    top: 0.6rem;
    border: none;
    width: 2.15rem;
    height: 2.15rem;
    border-radius: 0;
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: none;
    transition: transform 0.15s, color 0.15s;

    svg {
      width: 1.1rem;
      height: 1.1rem;
      fill: currentColor;
    }

    &:hover {
      transform: translateY(-1px);
      color: var(--accent);
    }
  }
}

.compare {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: $default-radius;
  background: #0f1117;

  &__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__img--overlay {
    z-index: 1;
  }

  &__divider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    background: rgba(255, 255, 255, 0.96);
    transform: translateX(-1px);
    z-index: 2;
  }

  &__handle {
    position: absolute;
    top: 50%;
    width: 2.4rem;
    height: 2.4rem;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.96);
    color: #1f2937;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.24);
    z-index: 3;
    pointer-events: none;

    svg {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
      transform: rotate(90deg);
    }
  }
}

.compareLabels {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0.9rem;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.55) 100%);
  z-index: 2;
}

.slider {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  z-index: 4;
}

.faqSection {
  @include mid-width;
  margin-top: 1.75rem;
  margin-bottom: 2rem;

  &__title {
    text-align: center;
    font-size: 1.75rem;
    margin: 0 0 1rem;
    color: var(--text-primary);
  }
}

@media only screen and (max-width: 55rem) {
  .fileRow {
    flex-wrap: wrap;
    &__savings {
      width: 100%;
    }
  }
}
</style>
