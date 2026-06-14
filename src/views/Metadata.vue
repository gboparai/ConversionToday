<template>
  <descriptor>
    <template #header>EXIF & Metadata Remover</template>
    <template #description>
      Select a category below, then drop your files to instantly strip hidden tracking data, GPS tags, and author information. 100% free and private.
    </template>
  </descriptor>

  <radio-group
    :options="familyOptions"
    v-model="category"
    @update:modelValue="handleFamilyChange"
  />

  <div class="informationBar">
    <card :path="'/metadata-remover/' + category" :formats="availableFormats" :selectedFormat="format" :handleChange="handleFormatChange">
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


  <action-bar
    :actions="[
      { label: 'Strip Metadata', disabled: loadedFiles.length === 0 || isProcessing, onClick: processFiles },
      { label: 'Download All', disabled: outputFiles.length === 0, onClick: downloadAll },
      { label: 'Download ZIP', disabled: outputFiles.length === 0 || !zipUrl, onClick: downloadZip },
      { label: 'Clear All', disabled: loadedFiles.length === 0 && outputFiles.length === 0, onClick: clearAll }
    ]"
  />

  <div class="files" v-if="loadedFiles.length > 0">
    <div v-for="(file, index) in loadedFiles" :key="index" class="fileRow">
      <div class="fileRow__copy">
        <div class="fileRow__name">{{ file.name }}</div>
      </div>
      <icon-button variant="remove" @click="removeFile(index)" title="Remove file" ariaLabel="Remove file" />
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
        <icon-button variant="download" :href="file.url" :download="file.name" title="Download" ariaLabel="Download" />
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
import ActionBar from "@/components/ActionBar.vue";
import RadioGroup from "@/components/RadioGroup.vue";
import IconButton from "@/components/IconButton.vue";
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
  components: { FilePicker, Card, Descriptor, Information, ErrorCard, ActionBar, RadioGroup, IconButton },
  
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
    category: {
      get() {
        return this.$route.params.family || "image";
      },
      set(value) {
        this.handleFamilyChange(value);
      }
    },
    familyOptions() {
      return [
        { label: "Images", value: "image" },
        { label: "Videos", value: "video" },
        { label: "Audio", value: "audio" },
        { label: "Documents", value: "document" }
      ];
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
      if (this.category === 'image') return this.$store.state.formats || [];
      if (this.category === 'video') return this.$store.state.videoFormats || [];
      if (this.category === 'audio') return this.$store.state.audioFormats || [];
      if (this.category === 'document') return this.$store.state.documentMetadataFormats || [];
      return [];
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
      this.$router.push({ path: `/metadata-remover/${this.category}/${e.target.value}` });
    },

    handleFamilyChange(value) {
      let defaultFormat = "jpg";
      if (value === "video") defaultFormat = "mp4";
      if (value === "audio") defaultFormat = "mp3";
      if (value === "document") defaultFormat = "pdf";
      this.$router.push({ path: `/metadata-remover/${value}/${defaultFormat}` });
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
@use "@/styles/_utilities.scss" as *;



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


</style>
