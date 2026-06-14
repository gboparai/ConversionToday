<template>
  <descriptor>
    <template #header>Extract Palettes from {{ formatLabel }}</template>
    <template #description>
      Extract the top dominant colors from {{ formatLabel }} images. We instantly generate a beautiful, interactive color palette for every uploaded image.
    </template>
  </descriptor>

  <div class="informationBar">
    <card path="/color-palette" :formats="availableFormats" :selectedFormat="selectedFormat.name" :handleChange="handleFormatChange">
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
        <span class="settingsCard__label">Colors to Extract</span>
        <div class="settingWrap">
          <input class="settingWrap__input" type="number" v-model.number="colorsToExtract" min="1" max="20" />
        </div>
      </div>
    </div>
  </div>

  <action-bar
    :actions="[
      { label: isProcessing ? 'Extracting...' : 'Extract Colors', disabled: files.length <= 0 || isProcessing, onClick: processAll },
      { label: 'Clear All', disabled: files.length <= 0, onClick: clearAll },
      { label: 'Download All (JSON)', disabled: !hasExtractedPalettes, onClick: downloadJson }
    ]"
  />

  <div class="files">
    <div v-for="file in files" :key="file.id" class="fileCard">
      <div class="fileCard__info">
        <span class="fileCard__name">{{ file.name }}</span>
        <div class="fileCard__actions">
          <icon-button
            v-if="file.palette"
            variant="download"
            @click="downloadFileJson(file)"
            title="Download Palette (JSON)"
            ariaLabel="Download Palette"
          />
          <icon-button
            variant="remove"
            :disabled="isProcessing"
            @click="removeFile(file.id)"
            title="Remove"
            ariaLabel="Remove file"
          />
        </div>
      </div>

      <div class="fileCard__status" v-if="file.status === 'processing'">
        Extracting palette...
      </div>

      <div class="palette" v-if="file.palette && file.palette.length > 0">
        <div class="palette__colors">
          <div 
            v-for="(color, index) in file.palette" 
            :key="index"
            class="palette__swatch"
            :style="{ backgroundColor: color.hex }"
            @click="copyToClipboard(color.hex)"
            :title="`Click to copy ${color.hex}`"
          >
            <span class="palette__hex" :class="{'dark-text': isLight(color.rgb)}">{{ color.hex }}</span>
          </div>
        </div>
      </div>
      <div class="fileCard__status fileCard__status--error" v-else-if="file.status === 'error'">
        {{ file.error }}
      </div>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Step 1</template>
      <template #description>Choose the image format you want to extract colors from.</template>
    </information>
    <information>
      <template #header>Step 2</template>
      <template #description>Add your images and adjust the number of dominant colors to extract.</template>
    </information>
    <information>
      <template #header>Step 3</template>
      <template #description>Extract the palettes and copy the HEX or RGB codes instantly.</template>
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
import ActionBar from "@/components/ActionBar.vue";
import IconButton from "@/components/IconButton.vue";
import { getMediaTypeConfig } from "@/js/media-types";
import { useMeta } from "vue-meta";
import { initializeImageMagick, ImageMagick, MagickFormat } from "@imagemagick/magick-wasm";

export default {
  name: "ColorPalette",
  components: { Descriptor, Card, Information, FilePicker, Toast, ActionBar, IconButton },
  data() {
    return {
      files: [],
      colorsToExtract: 5,
      isProcessing: false,
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
    hasExtractedPalettes() {
      return this.files.some(f => f.status === 'done' && f.palette);
    },
    acceptAttr() {
      if (!this.selectedFormat) return "image/*";
      return `.${this.selectedFormat.extension}`;
    }
  },
  methods: {
    handleFormatChange(formatName) {
      this.$router.push({ path: `/color-palette/${formatName}` });
    },
    addFiles(selectedFiles) {
      if (!selectedFiles.length) return;
      
      const newFiles = selectedFiles.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        name: f.name,
        status: 'queued',
        palette: null,
        error: null
      }));
      this.files.push(...newFiles);
    },
    removeFile(id) {
      this.files = this.files.filter(f => f.id !== id);
    },
    clearAll() {
      this.files = [];
    },
    async processAll() {
      if (this.isProcessing) return;
      this.isProcessing = true;

      for (let f of this.files) {
        if (f.status === 'queued') {
          f.status = 'processing';
          try {
            f.palette = await this.extractPalette(f.file, this.colorsToExtract);
            f.status = 'done';
          } catch (e) {
            f.error = e.message;
            f.status = 'error';
          }
        }
      }

      this.isProcessing = false;
    },
    
    // Convert to Image object via WASM if needed
    async fileToImage(file) {
      let url = null;
      try {
        const isNative = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'].includes(file.type);
        if (isNative) {
          url = URL.createObjectURL(file);
        } else {
          // Use ImageMagick WASM to convert unsupported to PNG
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

    async extractPalette(file, count) {
      const { img, url } = await this.fileToImage(file);
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      
      // Scale down for faster extraction
      const MAX_SIZE = 200;
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Free memory
      URL.revokeObjectURL(url);
      
      const imageData = ctx.getImageData(0, 0, width, height).data;
      
      // Basic Median Cut Quantization
      let pixels = [];
      for (let i = 0; i < imageData.length; i += 4) {
        // Skip transparent/highly translucent pixels
        if (imageData[i+3] > 125) {
          pixels.push([imageData[i], imageData[i+1], imageData[i+2]]);
        }
      }
      
      if (pixels.length === 0) {
        throw new Error("No opaque pixels found");
      }

      const cmap = this.medianCut(pixels, count);
      
      // Format to hex
      return cmap.map(rgb => {
        const hex = '#' + rgb.map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
        return { rgb, hex };
      });
    },

    medianCut(pixels, depth) {
      if (pixels.length === 0) return [];
      
      // simple bucket class
      class VBox {
        constructor(pixels) {
          this.pixels = pixels;
        }
        get volume() {
          let rMin = 255, rMax = 0;
          let gMin = 255, gMax = 0;
          let bMin = 255, bMax = 0;
          for (let p of this.pixels) {
            if (p[0] < rMin) rMin = p[0];
            if (p[0] > rMax) rMax = p[0];
            if (p[1] < gMin) gMin = p[1];
            if (p[1] > gMax) gMax = p[1];
            if (p[2] < bMin) bMin = p[2];
            if (p[2] > bMax) bMax = p[2];
          }
          this.rRange = rMax - rMin;
          this.gRange = gMax - gMin;
          this.bRange = bMax - bMin;
          return this.rRange * this.gRange * this.bRange;
        }
        get avg() {
          let r = 0, g = 0, b = 0;
          for (let p of this.pixels) {
            r += p[0]; g += p[1]; b += p[2];
          }
          return [
            Math.round(r / this.pixels.length),
            Math.round(g / this.pixels.length),
            Math.round(b / this.pixels.length)
          ];
        }
      }
      
      let boxes = [new VBox(pixels)];
      
      while (boxes.length < depth) {
        // Find largest volume box
        boxes.sort((a, b) => b.volume - a.volume);
        const box = boxes.shift();
        
        if (box.pixels.length < 2) {
          boxes.push(box);
          break; // cannot split
        }
        
        // Find longest channel
        let sortIndex = 0;
        if (box.gRange >= box.rRange && box.gRange >= box.bRange) sortIndex = 1;
        else if (box.bRange >= box.rRange && box.bRange >= box.gRange) sortIndex = 2;
        
        // Sort pixels by longest channel
        box.pixels.sort((a, b) => a[sortIndex] - b[sortIndex]);
        
        // Split at median
        const mid = Math.floor(box.pixels.length / 2);
        boxes.push(new VBox(box.pixels.slice(0, mid)));
        boxes.push(new VBox(box.pixels.slice(mid)));
      }
      
      return boxes.map(b => b.avg);
    },

    copyToClipboard(hex) {
      navigator.clipboard.writeText(hex).then(() => {
        this.$refs.toast.show(`Copied ${hex}`);
      }).catch(() => {
        this.$refs.toast.show("Failed to copy to clipboard.");
      });
    },
    downloadJson() {
      const allPalettes = this.files
        .filter(f => f.status === 'done' && f.palette)
        .map(f => ({
          filename: f.name,
          palette: f.palette.map(c => c.hex)
        }));
      
      if (allPalettes.length === 0) {
        this.$refs.toast.show("No palettes to download.");
        return;
      }
      
      const jsonStr = JSON.stringify(allPalettes, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "color_palettes.json";
      a.click();
      URL.revokeObjectURL(url);
    },
    downloadFileJson(file) {
      if (!file.palette) return;
      const paletteData = {
        filename: file.name,
        palette: file.palette.map(c => c.hex)
      };
      const jsonStr = JSON.stringify(paletteData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name}_palette.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    isLight([r, g, b]) {
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5;
    }
  },
  created() {
    useMeta({
      title: `Extract Palettes from ${this.formatLabel} — Free Online Tool | No Limit Converter`,
      meta: [
        {
          name: "description",
          content: `Extract beautiful color palettes directly from ${this.formatLabel} images. Fast, local, and totally private.`,
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
  margin-top: 0.5rem;
  &__select {
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: $default-radius;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: inherit;
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



.files {
  @include mid-width;
}

.fileCard {
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  padding: 1rem;
  margin-bottom: 1rem;

  &__info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  &__name {
    font-weight: 600;
    font-size: 0.95rem;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  &__status {
    font-size: 0.85rem;
    color: var(--text-secondary);
    &--error {
      color: var(--negative, #e74c3c);
    }
  }
}

.palette {
  margin-top: 1rem;

  &__colors {
    display: flex;
    height: 60px;
    border-radius: $default-radius;
    overflow: hidden;
  }

  &__swatch {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.1s ease;
    
    &:hover {
      transform: scale(1.05);
      z-index: 2;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
  }

  &__hex {
    opacity: 0;
    font-family: monospace;
    font-size: 0.8rem;
    font-weight: bold;
    color: #fff;
    transition: opacity 0.2s ease;
    
    .palette__swatch:hover & {
      opacity: 1;
    }

    &.dark-text {
      color: #000;
    }
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
