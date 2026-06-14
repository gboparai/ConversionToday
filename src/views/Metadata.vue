<template>
  <descriptor>
    <template #header>EXIF & Metadata Remover</template>
    <template #description>
      Select a category below, then drop your files to instantly strip hidden tracking data, GPS tags, and author information. 100% free and private.
    </template>
  </descriptor>

  <div class="informationBar">
    <card path="/metadata-remover" :formats="availableFormats" :selectedFormat="format" :handleChange="handleFormatChange">
      <template #header>{{ selectedFormatObj.title }}</template>
      <template #description>{{ selectedFormatObj.description }}</template>
    </card>
  </div>

  <file-picker
    :format-obj="selectedFormatObj"
    :media-type-label="categoryLabel"
    overlay-text="Drop to Strip Metadata"
    :label="categoryLabel"
    @files-selected="handleFilesSelected"
  />

  <div class="informationContainer">
    <information v-if="category === 'image'">
      <template #header>What Gets Removed: Images</template>
      <template #description>
        Image files often hide GPS coordinates, camera model info, exposure settings, timestamps, and author tags. We securely strip all EXIF, IPTC, and XMP data without re-compressing the image itself, ensuring zero quality loss.
      </template>
    </information>
    <information v-if="category === 'video' || category === 'audio'">
      <template #header>What Gets Removed: Media</template>
      <template #description>
        Video and audio files contain global metadata tags including author, title, creation time, encoding software, and sometimes location data. We wipe these tags completely without re-encoding the file, meaning it processes instantly with zero quality loss.
      </template>
    </information>
    <information v-if="category === 'document'">
      <template #header>What Gets Removed: Documents</template>
      <template #description>
        Office documents (Word, Excel, PowerPoint) and PDFs store the names of everyone who created or edited them, alongside timestamps and software info. We dig into the document structure and wipe these entries entirely.
      </template>
    </information>
  </div>


  <div class="batchBar">
    <button class="batchBar__button" :disabled="loadedFiles.length === 0 || isProcessing" @click="processFiles">
      <div>Strip Metadata</div>
    </button>
    <button class="batchBar__button" :disabled="outputFiles.length === 0" @click="downloadAll">
      <div>Download All</div>
    </button>
    <button class="batchBar__button" :disabled="outputFiles.length === 0 || !zipUrl" @click="downloadZip">
      <div>Download ZIP</div>
    </button>
    <button class="batchBar__button" :disabled="loadedFiles.length === 0 && outputFiles.length === 0" @click="clearAll">
      <div>Clear All</div>
    </button>
  </div>

  <div class="files" v-if="loadedFiles.length > 0">
    <div v-for="(file, index) in loadedFiles" :key="index" class="fileRow">
      <div class="fileRow__copy">
        <div class="fileRow__name">{{ file.name }}</div>
      </div>
      <button class="iconButton iconButton--remove" @click="removeFile(index)" title="Remove file" aria-label="Remove file">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    </div>
  </div>

  <div v-if="isProcessing" class="progressCard">
    <div class="progressCard__top">
      <strong>Processing...</strong>
      <span>{{ progress }}%</span>
    </div>
    <div class="progressBar">
      <div class="progressBar__fill" :style="{ width: progress + '%' }"></div>
    </div>
    <p>{{ statusMessage }}</p>
  </div>

  <error-card :show="hasError" :message="errorMessage" />
  
  <div class="files" v-if="outputFiles.length > 0">
    <div class="pageList">
      <div v-for="file in outputFiles" :key="file.name" class="fileRow">
        <div class="fileRow__copy">
          <div class="fileRow__name">{{ file.name }}</div>
        </div>
        <a class="iconButton iconButton--download" :href="file.url" :download="file.name" title="Download" aria-label="Download">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        </a>
      </div>
    </div>
  </div>

</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import ErrorCard from "@/components/errorCard.vue";
import Card from "@/components/card.vue";
import FilePicker from "@/components/file-picker.vue";
import { useMeta } from "vue-meta";
import JSZip from "jszip";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import MetadataWorker from "worker-loader!@/js/metadata-worker";
import { initializeImageMagick, ImageMagick } from "@imagemagick/magick-wasm";
let initPromise = null;
function ensureMagick() {
  if (!initPromise) {
    initPromise = fetch('/magick.wasm')
      .then(res => res.arrayBuffer())
      .then(buffer => initializeImageMagick(new Uint8Array(buffer)));
  }
  return initPromise;
}

export default {
  name: "MetadataRemover",
  components: { FilePicker, Card, Descriptor, Information, ErrorCard },
  
  data() {
    return {
      ffmpeg: null,
      metadataWorker: null,
      loadedFiles: [],
      outputFiles: [],
      zipUrl: null,
      zipBlob: null,
      zipName: "stripped-files.zip",
      isProcessing: false,
      progress: 0,
      statusMessage: "",
      hasError: false,
      errorMessage: ""
    };
  },

  computed: {
    format() {
      return this.$route.params.format || "jpg";
    },
    category() {
      const formatName = this.format;
      const formatsByMediaType = {
        image: this.$store.state.formats || [],
        video: this.$store.state.videoFormats || [],
        audio: this.$store.state.audioFormats || [],
        document: this.$store.state.documentFormats || []
      };
      for (const [cat, list] of Object.entries(formatsByMediaType)) {
        if (list.find(f => f.name === formatName)) {
          return cat;
        }
      }
      return "image";
    },
    categoryLabel() {
      const labels = {
        image: "Images",
        video: "Videos",
        audio: "Audio",
        document: "Documents"
      };
      return labels[this.category] || "Files";
    },

    availableFormats() {
      const docs = this.$store.state.documentMetadataFormats || [];

      return [
        ...(this.$store.state.formats || []),
        ...(this.$store.state.videoFormats || []),
        ...(this.$store.state.audioFormats || []),
        ...docs
      ];
    },
    selectedFormatObj() {
      return this.availableFormats.find(f => f.name === this.format) || this.availableFormats[0];
    }
  },

  created() {
    useMeta({
      title: "Strip EXIF & Metadata — Free Online Privacy Tool | No Limit Converter"
    });
    // Pre-initialize ImageMagick to avoid delay during processing
    ensureMagick().catch(() => {});
  },

  mounted() {
    this.metadataWorker = new MetadataWorker();
  },

  beforeUnmount() {
    this.revokeUrls();
    if (this.metadataWorker) {
      this.metadataWorker.terminate();
    }
  },

  methods: {
    handleFormatChange(e) {
      this.$router.push({ path: `/metadata-remover/${e.target.value}` });
    },

    handleCategoryChange() {
      this.clearAll();
    },

    revokeUrls() {
      this.outputFiles.forEach(f => URL.revokeObjectURL(f.url));
      if (this.zipUrl) URL.revokeObjectURL(this.zipUrl);
    },

    clearAll() {
      this.revokeUrls();
      this.loadedFiles = [];
      this.outputFiles = [];
      this.zipUrl = null;
      this.zipBlob = null;
      this.isProcessing = false;
      this.progress = 0;
      this.statusMessage = "";
      this.errorMessage = "";
    },

    removeFile(index) {
      this.loadedFiles.splice(index, 1);
    },

    handleFilesSelected(files) {
      this.hasError = false;
      for (const file of files) {
        this.loadedFiles.push(file);
      }
    },

    async initFFmpeg() {
      if (this.ffmpeg) return;
      this.ffmpeg = new FFmpeg({
        coreURL: new URL('/ffmpeg-core.js', window.location.origin).href,
        wasmURL: new URL('/ffmpeg-core.wasm', window.location.origin).href
      });
      await this.ffmpeg.load();
    },

    getOutputName(originalName) {
      const parts = originalName.split('.');
      if (parts.length === 1) return `${originalName}-removed`;
      const ext = parts.pop();
      return `${parts.join('.')}-removed.${ext}`;
    },

    async processFiles() {
      this.isProcessing = true;
      this.hasError = false;
      this.progress = 0;
      
      const zip = new JSZip();
      
      // Repackage existing output files into the zip so they aren't lost
      this.outputFiles.forEach(f => {
        zip.file(f.name, f.blob);
      });
      const total = this.loadedFiles.length;

      try {
        for (let i = 0; i < total; i++) {
          const file = this.loadedFiles[i];
          this.statusMessage = `Stripping metadata from ${file.name}...`;
          this.progress = Math.round((i / total) * 90);
          
          let cleanBlob;

          if (this.category === "image") {
            cleanBlob = await this.processImage(file);
          } else if (this.category === "video" || this.category === "audio") {
            cleanBlob = await this.processMedia(file);
          } else if (this.category === "document") {
            if (file.name.toLowerCase().endsWith(".pdf")) {
              cleanBlob = await this.processPDF(file);
            } else {
              cleanBlob = await this.processArchiveDoc(file);
            }
          }

          const outName = this.getOutputName(file.name);
          const outUrl = URL.createObjectURL(cleanBlob);
          this.outputFiles.push({ name: outName, blob: cleanBlob, url: outUrl });
          zip.file(outName, cleanBlob);
        }

        this.statusMessage = "Packaging ZIP...";
        this.progress = 95;

        if (this.outputFiles.length > 1) {
          const zipBlob = await zip.generateAsync({ type: "blob" });
          this.zipBlob = zipBlob;
          this.zipUrl = URL.createObjectURL(zipBlob);
        }

        this.loadedFiles = [];
        this.progress = 100;
        this.statusMessage = "Done!";
      } catch (err) {
        this.hasError = true;
        this.errorMessage = "Failed to process files: " + (err.message || err);
        this.outputFiles = [];
      } finally {
        this.isProcessing = false;
      }
    },

    downloadZip() {
      if (!this.zipUrl) return;
      const a = document.createElement("a");
      a.href = this.zipUrl;
      a.download = this.zipName;
      a.click();
    },

    async downloadAll() {
      for (const file of this.outputFiles) {
        if (!file.url) continue;
        let a = document.createElement("a");
        a.download = file.name;
        a.href = file.url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    },

    async processImage(file) {
      await ensureMagick();
      return new Promise((resolve, reject) => {
        file.arrayBuffer().then(buffer => {
          try {
            ImageMagick.read(new Uint8Array(buffer), (image) => {
              image.strip();
              image.write(data => {
                resolve(new Blob([data], { type: file.type || "image/jpeg" }));
              });
            });
          } catch (e) {
            reject(e);
          }
        }).catch(reject);
      });
    },

    async processMedia(file) {
      await this.initFFmpeg();
      const inputName = `input_${Date.now()}_${file.name}`;
      const outputName = `output_${Date.now()}_${file.name}`;
      
      const fileData = new Uint8Array(await file.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);
      // Run ffmpeg with -map_metadata -1 to strip global metadata
      await this.ffmpeg.exec([
        "-i", inputName,
        "-map_metadata", "-1",
        "-map_chapters", "-1",
        "-c:v", "copy",
        "-c:a", "copy",
        outputName
      ]);
      
      const data = await this.ffmpeg.readFile(outputName);
      // Clean up memory
      this.ffmpeg.deleteFile(inputName);
      this.ffmpeg.deleteFile(outputName);
      
      return new Blob([data.buffer], { type: file.type });
    },

    async processPDF(file) {
      const buffer = await file.arrayBuffer();
      return new Promise((resolve, reject) => {
        const id = Math.random().toString(36).substring(7);
        
        const handler = (e) => {
          if (e.data.id === id) {
            if (e.data.status === 'done') {
              this.metadataWorker.removeEventListener('message', handler);
              resolve(new Blob([e.data.buffer], { type: "application/pdf" }));
            } else if (e.data.status === 'error') {
              this.metadataWorker.removeEventListener('message', handler);
              reject(new Error(e.data.error));
            }
          }
        };
        
        this.metadataWorker.addEventListener('message', handler);
        this.metadataWorker.postMessage({ id, type: 'processPDF', buffer }, [buffer]);
      });
    },

    async processArchiveDoc(file) {
      const buffer = await file.arrayBuffer();
      return new Promise((resolve, reject) => {
        const id = Math.random().toString(36).substring(7);
        
        const handler = (e) => {
          if (e.data.id === id) {
            if (e.data.status === 'done') {
              this.metadataWorker.removeEventListener('message', handler);
              resolve(new Blob([e.data.buffer], { type: file.type || "application/octet-stream" }));
            } else if (e.data.status === 'error') {
              this.metadataWorker.removeEventListener('message', handler);
              reject(new Error(e.data.error));
            }
          }
        };
        
        this.metadataWorker.addEventListener('message', handler);
        this.metadataWorker.postMessage({ id, type: 'processArchiveDoc', buffer }, [buffer]);
      });
    }
  }
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.informationBar {
  @include mid-width;
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.fileInputWrapper {
  @include mid-width;
  margin-bottom: 1.5rem;
}

.fileInput {
  display: block;
  border: 2px dashed var(--border);
  border-radius: $default-radius;
  background-color: var(--bg-surface);
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s, background-color 0.15s;

  input[type="file"] {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
  }

  .file {
    padding: 3rem 1rem;
    pointer-events: none;
    p {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  &:hover, &:focus-within {
    border-color: var(--accent);
    background-color: var(--bg-surface-hover);
  }
}

.files {
  @include mid-width;
  margin-bottom: 1.5rem;
}

.pageList {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 22rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.25rem;
}

.fileRow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  margin-bottom: 0.4rem;

  &__copy {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    min-width: 120px;
    border: none;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0;
    cursor: pointer;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: var(--shadow-sm);

    > div {
      background-color: var(--bg-secondary);
      padding: 0.55rem 1rem;
      border-radius: $default-radius;
      height: 100%;
      transition: background-color 0.15s, transform 0.15s;
    }

    &[disabled] {
      cursor: not-allowed;
      opacity: 0.4;
    }
    &:not([disabled]):hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-md);
      > div {
        background-color: var(--bg-surface-hover);
        transform: translateY(-2px);
      }
    }
    &:not([disabled]):active > div {
      transform: translateY(0);
    }
  }
}

.progressCard {
  @include mid-width;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.progressCard__top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
}

.progressCard p {
  margin: 0.5rem 0 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.progressBar {
  height: 6px;
  background-color: var(--border);
  border-radius: 3px;
  overflow: hidden;

  &__fill {
    height: 100%;
    background-color: var(--accent);
    transition: width 0.2s ease;
    border-radius: 3px;
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
    background: var(--negative, #e74c3c);
    color: #fff;
  }

  &--download {
    background: var(--positive, #2ecc71);
    color: var(--positive-text, #fff);
  }

  &:hover {
    transform: scale(1.1);
  }
}
</style>
