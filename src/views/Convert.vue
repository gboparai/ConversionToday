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

.files {
  @include mid-width;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

.listItem {
  transition: all 0.8s ease;
}

.listEnterFrom,
.listLeaveTo {
  opacity: 0;
  transform: translateY(-1rem);
}

.listLeaveActive {
  position: absolute;
}

.supportedConversionsTitle {
  text-align: center;
  font-size: 1.75rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.supportedConversionsSearch {
  display: block;
  width: min(28rem, 100%);
  margin: 0 auto 0.85rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: $default-radius;
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.supportedConversionsSearch:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
  outline: none;
}

.supportedConversionsListContainter {
  display: flex;
  justify-content: stretch;
  gap: 2rem;
  flex-direction: row;
}
</style>


<template>
  <descriptor>
    <template #header
      >{{ formatInofo.name.toUpperCase() }} To
      {{ formatInofo2.name.toUpperCase() }} Converter</template
    >
    <template #description
      >Convert your {{ formatInofo.name }} and {{ formatInofo2.name }} files
      today online for free with no restrictions</template
    >
  </descriptor>
  <div class="informationBar">
    <card
      :path="mediaHomePath"
      :formats="formats1"
      :selectedFormat="formatInofo.name"
      :handleChange="handleChangeFormat1"
    >
      <template #header>{{ formatInofo.title }}</template>
      <template #description>{{ formatInofo.description }}</template>
    </card>
    <card
      :path="'/' + mediaType + '/' + formatInofo.name"
      :handleChange="handleChangeFormat2"
      :formats="formats2"
      :selectedFormat="formatInofo2.name"
    >
      <template #header>{{ formatInofo2.title }}</template>
      <template #description>{{ formatInofo2.description }}</template>
    </card>
  </div>
  <label class="fileInput">
    <input @change="input" type="file" name="thing" id="" multiple :accept="acceptMimeTypes" />
    <div class="file">
      <p>Add {{ mediaTypeLabel }} Here</p>
    </div>
  </label>

  <div class="batchBar">
    <button
      class="batchBar__button"
      :disabled="nonProcessed.length <= 0"
      @click="process"
    >
      <div>Process All</div>
    </button>
    <button
      class="batchBar__button"
      :disabled="processed.length <= 0"
      @click="downloadAll"
    >
      <div>Download All</div>
    </button>
    <button
      class="batchBar__button"
      :disabled="processed.length <= 0"
      @click="downloadZip"
    >
      <div>Download ZIP</div>
    </button>
    <button
      class="batchBar__button"
      :disabled="nonProcessed.length <= 0 && processed.length <= 0"
      @click="clearAll"
    >
      <div>Clear All</div>
    </button>
  </div>

  <div class="files">
    <transition-group name="list">
      <file-cell
        v-for="file in files"
        class="listItem"
        :key="file.id"
        :file="file"
        :mediaType="mediaType"
      ></file-cell>
    </transition-group>
  </div>
  <div class="infomationContainer">
    <information>
      <template #header>Unlimited Conversions</template>
      <template #description>
        Need to convert allot of files no problem you can convert as many
        {{ formatInofo.name.toUpperCase() }} files to
        {{ formatInofo2.name.toUpperCase() }} as you want without limitation.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        There are no file size restrictions so you can convert as large
        {{ formatInofo.name.toUpperCase() }} file to
        {{ formatInofo2.name.toUpperCase() }} as you desire.
      </template>
    </information>
  </div>
  <div class="infomationContainer">
    <information>
      <template #header>Step 1</template>
      <template #description>
        Drag and drop or select as many files as you want
      </template>
    </information>
    <information>
      <template #header>Step 2</template>
      <template #description>
        Hit the "Process All" button and wait for the images to be converted
      </template>
    </information>
    <information>
      <template #header>Step 3</template>
      <template #description>
        Hit the "Download All" button and your all done
      </template>
    </information>
  </div>

  <transition name="fade">
    <p v-if="fileInDropZone > 0" class="dropTarget">Drop Here</p>
  </transition>

  <div class="infomationContainer">
    <div>
      <h3 class="supportedConversionsTitle">Supported Conversions</h3>
      <input
        v-model="conversionSearch"
        class="supportedConversionsSearch"
        type="search"
        placeholder="Filter conversions (example: jpg, png, ai)"
        aria-label="Filter supported conversions"
      />
      <div class="supportedConversionsListContainter">
        <list :listOptions="formatList1" />
        <list :listOptions="formatList2" />
      </div>
    </div>
  </div>
</template>

<script>
import FileCell from "@/components/file-cell.vue";
import Card from "@/components/card.vue";
import Descriptor from "@/components/descriptor.vue";
import List from "@/components/list.vue";
import { FILE_STATUS } from "@/js/constants";
import { getMediaTypeFromPath, getMediaTypeConfig } from "@/js/media-types";
import Information from "@/components/information.vue";
import { useMeta } from "vue-meta";
import JSZip from "jszip";
export default {
  name: "App",

  data() {
    useMeta({
      title:
        "Free Online " +
        this.$route.params.format.toUpperCase() +
        " to " +
        this.$route.params.format2.toUpperCase() +
        " Converter - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert your " +
            this.$route.params.format +
            " to " +
            this.$route.params.format2 +
            " online in seconds. No file size limit or limit on the number of files or any other Restrictions. 100% Completely Free. Just upload, convert and download.",
        },
        {
          name: "keywords",
          content: "free online converter, convert " + this.$route.params.format + " to " + this.$route.params.format2 + ", online file conversion, no limit converter, unlimited file converter",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content:
            "Free Online " +
            this.$route.params.format.toUpperCase() +
            " to " +
            this.$route.params.format2.toUpperCase() +
            " Converter - No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert your " +
            this.$route.params.format +
            " to " +
            this.$route.params.format2 +
            " online in seconds. No file size limit or limit on the number of files or any other Restrictions. 100% Completely Free. Just upload, convert and download.",
        },
        // image must be an absolute path
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        // Facebook OpenGraph
        {
          property: "og:title",
          content:
            "Free Online " +
            this.$route.params.format.toUpperCase() +
            " to " +
            this.$route.params.format2.toUpperCase() +
            " Converter - No Limit Converter",
        },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:description",
          content:
            "Convert your " +
            this.$route.params.format +
            " to " +
            this.$route.params.format2 +
            " online in seconds. No file size limit or limit on the number of files or any other Restrictions. 100% Completely Free. Just upload, convert and download.",
        },
      ],
      htmlAttrs: { lang: "en", amp: true },
      link: [
        {
          rel: "canonical",
          href:
            "https://nolimitconverter.com" + this.$route.path,
        },
      ],
    });
    return {
      fileInDropZone: 0,
      format: this.$route.params.format,
      format2: this.$route.params.format2,
      conversionSearch: "",
    };
  },
  computed: {
    mediaType() {
      return getMediaTypeFromPath(this.$route.path);
    },
    mtConfig() {
      return getMediaTypeConfig(this.mediaType);
    },
    mediaHomePath() {
      return `/${this.mediaType}`;
    },
    mediaTypeLabel() {
      return this.mtConfig.label;
    },
    acceptMimeTypes() {
      // Build a precise accept string from the selected input format.
      // This scopes the OS file picker to only the format the user intends to convert FROM.
      const inputFormat = this.formatInofo;
      if (inputFormat) {
        const ext = String(inputFormat.extension || inputFormat.name || '').trim().toLowerCase();
        const parts = ext ? [`.${ext}`] : [];
        const mime = inputFormat.mimeType ? String(inputFormat.mimeType).trim() : null;
        if (mime) parts.push(mime);
        if (parts.length) return parts.join(',');
      }
      // Fallback: use the media-type-level accept string when no specific format is resolved.
      if (this.mtConfig.acceptMimeTypes) return this.mtConfig.acceptMimeTypes;
      // Font type (acceptMimeTypes is null): compute dynamically from all formats.
      const extensions = this.$store.state[this.mtConfig.formatsKey]
        .map((format) => String(format.extension || '').trim().toLowerCase())
        .filter((extension, index, list) => extension && list.indexOf(extension) === index);
      return extensions.map((extension) => `.${extension}`).join(',');
    },
    formatsKey() {
      return this.mtConfig.formatsKey;
    },
    files() {
      return this.$store.state[this.mtConfig.filesKey];
    },
    nonProcessed() {
      return this.files.filter(
        (file) => file.status === FILE_STATUS.initialized
      );
    },
    processed() {
      return this.files.filter((file) => file.status === FILE_STATUS.processed);
    },
    formatInofo() {
      return this.$store.state[this.formatsKey].find((formatObj) => {
        if (formatObj.name == this.format) return formatObj;
      });
    },
    formatInofo2() {
      return this.$store.state[this.formatsKey].find((formatObj) => {
        if (formatObj.name == this.format2) return formatObj;
      });
    },
    formatList1() {
      const query = this.conversionSearch.trim().toLowerCase();
      return this.$store.state[this.formatsKey]
        .filter((format) => {
          if (format.name == this.$route.params.format || format.canConvertTo === false) return false;
          if (!query) return true;
          const itemText = `${this.format} ${format.name}`.toLowerCase();
          return itemText.includes(query);
        })
        .map((formatList, index) => {
          return `<a href="/${this.mediaType}/${this.format}/${formatList.name}">${
            index + 1
          }. ${this.format.toUpperCase()} to ${formatList.name.toUpperCase()}</a>`;
        });
    },
    formatList2() {
      const query = this.conversionSearch.trim().toLowerCase();
      return this.$store.state[this.formatsKey]
        .filter((format) => {
          // Exclude input-disabled formats and the currently selected output format.
          if (format.canConvertFrom === false || format.name == this.$route.params.format2) {
            return false;
          }
          if (!query) return true;
          const itemText = `${format.name} ${this.format2}`.toLowerCase();
          return itemText.includes(query);
        })
        .map((formatList, index) => {
          return `<a href="/${this.mediaType}/${formatList.name}/${this.format2}">${
            index + 1
          }. ${formatList.name.toUpperCase()} to ${this.format2.toUpperCase()}</a>`;
        });
    },
    formats1() {
      return this.$store.state[this.formatsKey].filter((format) => {
        return (
          format.canConvertFrom !== false && format.name != this.$route.params.format2
        );
      });
    },
    formats2() {
      // Only show formats that can be converted TO (exclude input-only formats)
      return this.$store.state[this.formatsKey].filter((format) => format.canConvertTo !== false);
    },
  },
  methods: {
    /**
     * Filter a FileList (or array of Files) to only those whose extension or
     * MIME type matches the currently-selected input format.
     *
     * The browser's `accept` attribute is advisory-only and can be bypassed,
     * so we enforce the same restriction in JavaScript for both the file-picker
     * and drag-and-drop paths.
     *
     * Returns an Array<File> (never a raw FileList so it is iterable everywhere).
     */
    filterFilesByInputFormat(fileList) {
      const inputFormat = this.formatInofo;
      // If we cannot determine the input format, pass all files through so the
      // converter can handle them as usual.
      if (!inputFormat) return Array.from(fileList);

      const allowedExt  = String(inputFormat.extension || inputFormat.name || '').trim().toLowerCase();
      // Some formats (e.g. audio/video) carry a mimeType; build a Set for O(1) lookup.
      // Split on commas to handle compound values like 'audio/ogg; codecs=opus'.
      const allowedMimes = new Set(
        inputFormat.mimeType
          ? [inputFormat.mimeType.trim().toLowerCase().split(';')[0].trim()]
          : []
      );

      return Array.from(fileList).filter((file) => {
        const fileExt  = (file.name.split('.').pop() || '').toLowerCase();
        const fileMime = (file.type || '').toLowerCase().split(';')[0].trim();
        const extMatch  = allowedExt  && fileExt  === allowedExt;
        const mimeMatch = allowedMimes.size > 0 && allowedMimes.has(fileMime);
        return extMatch || mimeMatch;
      });
    },
    input(e) {
      const filtered = this.filterFilesByInputFormat(e.target.files);
      if (filtered.length) this.$store.dispatch(this.mtConfig.addFiles, filtered);
    },
    fileDrop(e) {
      e.preventDefault();
      const filtered = this.filterFilesByInputFormat(e.dataTransfer.files);
      if (filtered.length) this.$store.dispatch(this.mtConfig.addFiles, filtered);
      this.fileInDropZone = false;
    },
    fileOver(e) {
      e.preventDefault();
    },
    fileEnter(e) {
      e.preventDefault();
      this.fileInDropZone++;
    },
    fileLeave(e) {
      e.preventDefault();
      this.fileInDropZone--;
    },
    stopProp(e) {
      e.stopPropagation();
    },
    process() {
      this.$store.dispatch(this.mtConfig.processAll);
    },
    async downloadAll() {
      for (const file of this.files) {
        if (!file.output || !file.output.url) continue;
        let a = document.createElement("a");
        a.download = file.output.name;
        a.href = file.output.url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
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
      a.download = `converted_${this.format}_to_${this.format2}_files.zip`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
    },
    clearAll() {
      this.$store.dispatch(this.mtConfig.clearFiles);
    },
    handleChangeFormat1(event) {
      window.location.href = `/${this.mediaType}/${event.target.value}/${this.format2}`;
    },
    handleChangeFormat2(event) {
      window.location.href = `/${this.mediaType}/${this.format}/${event.target.value}`;
    },
  },
  components: {
    FileCell,
    Card,
    Descriptor,
    Information,
    List,
  },
  mounted() {
    this.$store.dispatch(this.mtConfig.setFormat, this.formatInofo2);
    if (this.mtConfig.setInputFormat) {
      this.$store.dispatch(this.mtConfig.setInputFormat, this.formatInofo);
    }
    this.$store.dispatch(this.mtConfig.loadWorker);

    document.body.addEventListener("drop", this.fileDrop);
    document.body.addEventListener("dragover", this.fileOver);
    document.body.addEventListener("dragenter", this.fileEnter);
    document.body.addEventListener("dragleave", this.fileLeave);
  },
  unmounted() {
    document.body.removeEventListener("drop", this.fileDrop);
    document.body.removeEventListener("dragover", this.fileOver);
    document.body.removeEventListener("dragenter", this.fileEnter);
    document.body.removeEventListener("dragleave", this.fileLeave);
  },
};
</script>
