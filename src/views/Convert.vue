<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;

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
      >{{ formatInfo.name.toUpperCase() }} To
      {{ formatInfo2.name.toUpperCase() }} Converter</template
    >
    <template #description
      >Convert your {{ formatInfo.name }} and {{ formatInfo2.name }} files
      today online for free with no restrictions</template
    >
  </descriptor>
  <div class="informationBar">
    <card
      :path="mediaHomePath"
      :formats="formats1"
      :selectedFormat="formatInfo.name"
      :handleChange="handleChangeFormat1"
    >
      <template #header>{{ formatInfo.title }}</template>
      <template #description>{{ formatInfo.description }}</template>
    </card>
    <card
      :path="'/' + mediaType + '/' + formatInfo.name"
      :handleChange="handleChangeFormat2"
      :formats="formats2"
      :selectedFormat="formatInfo2.name"
    >
      <template #header>{{ formatInfo2.title }}</template>
      <template #description>{{ formatInfo2.description }}</template>
    </card>
  </div>
  <file-picker
    :format-obj="formatInfo"
    :media-type-label="mediaTypeLabel"
    overlay-text="Drop Here"
    :label="mediaTypeLabel"
    :fallback-accept="mtConfig.acceptMimeTypes"
    :track-skipped-metrics="trackSkipped"
    @files-selected="handleFilesSelected"
  />

  <action-bar
    :actions="[
      { label: 'Process All', disabled: nonProcessed.length <= 0, onClick: process },
      { label: 'Download All', disabled: processed.length <= 0, onClick: downloadAll },
      { label: 'Download ZIP', disabled: processed.length <= 0, onClick: downloadZip },
      { label: 'Clear All', disabled: nonProcessed.length <= 0 && processed.length <= 0, onClick: clearAll }
    ]"
  />

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
  <div class="informationContainer">
    <information>
      <template #header>Unlimited Conversions</template>
      <template #description>
        Need to convert allot of files no problem you can convert as many
        {{ formatInfo.name.toUpperCase() }} files to
        {{ formatInfo2.name.toUpperCase() }} as you want without limitation.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        There are no file size restrictions so you can convert as large
        {{ formatInfo.name.toUpperCase() }} file to
        {{ formatInfo2.name.toUpperCase() }} as you desire.
      </template>
    </information>
  </div>
  <div class="informationContainer">
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



  <div class="informationContainer">
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
import FilePicker from "@/components/file-picker.vue";
import FileCell from "@/components/file-cell.vue";
import Card from "@/components/card.vue";
import Descriptor from "@/components/descriptor.vue";
import List from "@/components/list.vue";
import Information from "@/components/information.vue";
import ActionBar from "@/components/ActionBar.vue";
import fileQueueMixin from "@/mixins/fileQueueMixin";
import { FILE_STATUS } from "@/js/constants";
import { getMediaTypeFromPath, getMediaTypeConfig } from "@/js/media-types";
import { useMeta } from "vue-meta";
import JSZip from "jszip";
export default {
  name: "App",
  mixins: [fileQueueMixin],
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
      const inputFormat = this.formatInfo;
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
      if (this.mediaType === 'font') {
        return this.$store.state.fontFormats
          .map(f => `.${f.extension || f.name}`)
          .join(',');
      }
      return '*/*';
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
    formatInfo() {
      return this.$store.state[this.formatsKey].find((formatObj) => {
        if (formatObj.name == this.format) return formatObj;
      });
    },
    formatInfo2() {
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
    handleFilesSelected(files) {
      this.$store.dispatch(this.mtConfig.addFiles, files);
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
    FilePicker,
    FileCell,
    Card,
    Descriptor,
    Information,
    List,
    ActionBar,
  },
  mounted() {
    this.$store.dispatch(this.mtConfig.setFormat, this.formatInfo2);
    if (this.mtConfig.setInputFormat) {
      this.$store.dispatch(this.mtConfig.setInputFormat, this.formatInfo);
    }
    this.$store.dispatch(this.mtConfig.loadWorker);
  },
  beforeUnmount() {
  },
};
</script>
