<template>
  <descriptor>
    <template #header>Generate Sprite Sheet from {{ formatLabel }}</template>
    <template #description>
      Stitch multiple {{ formatLabel }} images into a single optimized PNG. We automatically generate a precise CSS or JSON coordinate map.
    </template>
  </descriptor>

  <div class="informationBar">
    <card path="/sprite-sheet" :formats="availableFormats" :selectedFormat="selectedFormat.name" :handleChange="handleFormatChange">
      <template #header>{{ formatLabel }}</template>
      <template #description>{{ selectedFormat ? selectedFormat.description : '' }}</template>
    </card>
  </div>

  <file-picker
    :filter-fn="filterImages"
    :fallback-accept="acceptAttr"
    :label="formatLabel + ' Images'"
    :overlay-text="'Drop ' + formatLabel + ' Here'"
    @files-selected="addFiles"
  />

  <div class="settingsBar" v-if="files.length > 0">
    <div class="settingsCard">
      <div class="settingsCard__item">
        <span class="settingsCard__label">Columns</span>
        <div class="settingWrap">
          <input class="settingWrap__input" type="number" v-model.number="columns" min="1" max="100" />
        </div>
      </div>
      <div class="settingsCard__item">
        <span class="settingsCard__label">Padding (px)</span>
        <div class="settingWrap">
          <input class="settingWrap__input" type="number" v-model.number="padding" min="0" max="100" />
        </div>
      </div>
      <div class="settingsCard__item">
        <span class="settingsCard__label">Mapping Format</span>
        <div class="settingWrap">
          <select class="settingWrap__input" v-model="mapFormat">
            <option value="css">CSS</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div class="batchBar">
    <button class="batchBar__button" :disabled="files.length <= 1 || isProcessing" @click="generateSpriteSheet">
      <div>{{ isProcessing ? 'Generating...' : 'Generate Sprite Sheet' }}</div>
    </button>
    <button class="batchBar__button" :disabled="files.length <= 0 && !hasOutput" @click="clearAll">
      <div>Clear All</div>
    </button>
  </div>

  <div class="downloadCard" v-if="hasOutput">
    <div>
      <strong>sprite_sheet.zip</strong>
      <p>Your sprite sheet (PNG) and mapping file ({{ mapFormat.toUpperCase() }}) are ready.</p>
    </div>
    <a :href="outputUrl" download="sprite_sheet.zip">Download ZIP</a>
  </div>

  <div class="files" v-if="files.length > 0">
    <p v-if="files.length > 1" class="queueHint">Drag files to change the sprite order.</p>
    <div
      v-for="file in files"
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
        @click="removeFile(file.id)"
        title="Remove"
        aria-label="Remove file"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Step 1</template>
      <template #description>Choose the image format of the sprites you want to combine.</template>
    </information>
    <information>
      <template #header>Step 2</template>
      <template #description>Add your images, set the grid columns, padding, and mapping format.</template>
    </information>
    <information>
      <template #header>Step 3</template>
      <template #description>Generate your sprite sheet and download the ZIP file instantly.</template>
    </information>
  </div>

  <toast ref="toast" />
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import Card from "@/components/card.vue";
import FilePicker from "@/components/file-picker.vue";
import Toast from "@/components/toast.vue";
import { getMediaTypeConfig } from "@/js/media-types";
import { useMeta } from "vue-meta";
import { initializeImageMagick, ImageMagick, MagickFormat } from "@imagemagick/magick-wasm";
import JSZip from "jszip";

export default {
  name: "SpriteSheet",
  components: { Descriptor, Card, Information, FilePicker, Toast },
  data() {
    return {
      files: [],
      mapFormat: 'css',
      columns: 5,
      padding: 0,
      isProcessing: false,
      outputUrl: null,
      draggedId: null
    };
  },
  computed: {
    formatName() {
      return this.$route.params.format;
    },
    config() {
      return getMediaTypeConfig("image");
    },
    availableFormats() {
      return this.config && this.$store ? this.$store.state[this.config.formatsKey] : [];
    },
    selectedFormat() {
      return this.availableFormats.find(f => f.name === this.formatName) || this.availableFormats[0];
    },
    formatLabel() {
      return this.selectedFormat ? this.selectedFormat.name.toUpperCase() : "Image";
    },
    acceptAttr() {
      if (!this.selectedFormat) return "image/*";
      return `.${this.selectedFormat.extension}`;
    },
    hasOutput() {
      return this.outputUrl !== null;
    }
  },
  methods: {
    handleFormatChange(formatName) {
      this.$router.push({ path: `/sprite-sheet/${formatName}` });
      this.clearAll();
    },
    addFiles(selectedFiles) {
      if (!selectedFiles.length) return;
      
      const newFiles = selectedFiles.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        name: f.name
      }));
      this.files.push(...newFiles);
    },
    removeFile(id) {
      this.files = this.files.filter(f => f.id !== id);
    },
    clearAll() {
      this.files = [];
      if (this.outputUrl) {
        URL.revokeObjectURL(this.outputUrl);
        this.outputUrl = null;
      }
    },
    dragStart(id) {
      this.draggedId = id;
    },
    dropOn(id) {
      const draggedIndex = this.files.findIndex(f => f.id === this.draggedId);
      const dropIndex = this.files.findIndex(f => f.id === id);
      if (draggedIndex === -1 || dropIndex === -1 || draggedIndex === dropIndex) {
        this.draggedId = null;
        return;
      }
      const item = this.files.splice(draggedIndex, 1)[0];
      this.files.splice(dropIndex, 0, item);
      this.draggedId = null;
    },

    async fileToImage(file) {
      let url = null;
      try {
        const isNative = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'].includes(file.type);
        if (isNative) {
          url = URL.createObjectURL(file);
        } else {
          await initializeImageMagick();
          const buffer = await file.arrayBuffer();
          const pngBuffer = await new Promise((resolve, reject) => {
            try {
              ImageMagick.read(new Uint8Array(buffer), (image) => {
                image.write(MagickFormat.Png, data => resolve(data));
              });
            } catch (err) {
              reject(err);
            }
          });
          const blob = new Blob([pngBuffer], { type: 'image/png' });
          url = URL.createObjectURL(blob);
        }
        
        return await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ img, url });
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = url;
        });
      } catch (err) {
        if (url) URL.revokeObjectURL(url);
        throw err;
      }
    },

    async generateSpriteSheet() {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        const images = [];
        // Load all images
        for (let f of this.files) {
          const { img, url } = await this.fileToImage(f.file);
          images.push({ 
            img, 
            url,
            name: f.name.replace(/\.[^/.]+$/, "") // strip extension
          });
        }

        // Calculate layout
        const cols = this.columns || 1;
        const pad = this.padding || 0;
        let rowHeights = [];
        
        let sprites = [];
        
        for (let i = 0; i < images.length; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          
          if (col === 0) {
            rowHeights[row] = 0;
          }
          if (images[i].img.height > rowHeights[row]) {
            rowHeights[row] = images[i].img.height;
          }
        }

        let totalHeight = pad;
        for (let h of rowHeights) {
          totalHeight += h + pad;
        }

        // X layout requires tracking widths per column, but simpler is just fixed max width per column
        let colWidths = new Array(cols).fill(0);
        for (let i = 0; i < images.length; i++) {
          const col = i % cols;
          if (images[i].img.width > colWidths[col]) {
            colWidths[col] = images[i].img.width;
          }
        }

        let totalWidth = pad;
        for (let w of colWidths) {
          totalWidth += w + pad;
        }

        // Setup Canvas
        const canvas = document.createElement("canvas");
        canvas.width = totalWidth;
        canvas.height = totalHeight;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, totalWidth, totalHeight);

        // Draw & Record
        let currentY = pad;
        for (let row = 0; row < rowHeights.length; row++) {
          let currentX = pad;
          for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            if (index >= images.length) break;

            const imageObj = images[index];
            const img = imageObj.img;
            
            // Draw
            ctx.drawImage(img, currentX, currentY, img.width, img.height);
            
            // Record map
            sprites.push({
              name: imageObj.name.replace(/[^a-zA-Z0-9_-]/g, "_"),
              x: currentX,
              y: currentY,
              width: img.width,
              height: img.height
            });

            currentX += colWidths[col] + pad;
            
            // Cleanup blob url
            URL.revokeObjectURL(imageObj.url);
          }
          currentY += rowHeights[row] + pad;
        }

        // Generate Map File Content
        let mapContent = "";
        let mapFileName = "";
        
        if (this.mapFormat === 'css') {
          mapFileName = "sprites.css";
          mapContent = ".sprite { background-image: url('sprites.png'); background-repeat: no-repeat; display: inline-block; }\n\n";
          for (let s of sprites) {
            mapContent += `.sprite-${s.name} {\n  background-position: -${s.x}px -${s.y}px;\n  width: ${s.width}px;\n  height: ${s.height}px;\n}\n\n`;
          }
        } else {
          mapFileName = "sprites.json";
          const jsonObj = {};
          for (let s of sprites) {
            jsonObj[s.name] = { x: s.x, y: s.y, width: s.width, height: s.height };
          }
          mapContent = JSON.stringify(jsonObj, null, 2);
        }

        // Convert canvas to blob
        const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

        // Zip it up
        const zip = new JSZip();
        zip.file("sprites.png", pngBlob);
        zip.file(mapFileName, mapContent);
        
        const zipBlob = await zip.generateAsync({ type: "blob" });
        this.outputUrl = URL.createObjectURL(zipBlob);

      } catch (e) {
        console.error(e);
        this.$refs.toast.show("Failed to generate sprite sheet: " + e.message);
      } finally {
        this.isProcessing = false;
      }
    }
  },
  created() {
    useMeta({
      title: `Generate Sprite Sheet from ${this.formatLabel} — Free Online Tool | No Limit Converter`,
      meta: [
        {
          name: "description",
          content: `Stitch ${this.formatLabel} images into a single PNG sprite sheet. Generates CSS or JSON coordinate files automatically. 100% free, private, and fast.`,
        }
      ]
    });
  }
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.informationBar {
  @include mid-width;
  margin-bottom: 2rem;
}

.settings {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 0.5rem;

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
  }

  &__input {
    margin-left: 0.5rem;
    padding: 0.35rem 0.6rem;
    border-radius: $default-radius;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    
    &--num {
      width: 70px;
    }
  }
}

.fileInput {
  @include mid-width;
  display: block;
  border: 2px dashed var(--border);
  border-radius: $default-radius;
  background-color: var(--bg-surface);
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s, background-color 0.15s;
  margin-bottom: 1.5rem;

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

.batchBar {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.5rem;

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
      > div {
        background-color: var(--bg-surface-hover);
        transform: translateY(-2px);
      }
    }
  }
}

.downloadCard {
  @include mid-width;
  margin-bottom: 1.5rem;
  padding: 1rem 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
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
    color: var(--accent-text, #fff);
    text-decoration: none;
    font-weight: 800;
  }
}

.files {
  @include mid-width;
  margin-bottom: 1.5rem;
}

.queueHint {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  text-align: right;
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
  cursor: grab;

  &--dragging {
    opacity: 0.5;
    background-color: var(--bg-surface-hover);
  }

  &__handle {
    color: var(--text-secondary);
    cursor: grab;
    user-select: none;
    padding: 0 0.25rem;
  }

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

.iconButton {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-sm);
  }
}

.settingsBar {
  @include mid-width;
  margin-bottom: 1.5rem;
}

.settingsCard {
  padding: 1.25rem 1.5rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: center;

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

.settingWrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: $default-radius;
  background-color: var(--bg-primary);
  transition: border-color 0.15s;

  &:focus-within {
    border-color: var(--accent);
  }

  &__input {
    flex: 1;
    padding: 0.55rem 0.75rem;
    border: none;
    background: none;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;
    width: 6rem;
  }
}
</style>
