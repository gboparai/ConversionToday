<template>
  <descriptor>
    <template #header>{{ pageTitle }}</template>
    <template #description>
      {{ familyConfig.description }}
    </template>
  </descriptor>

  <div class="familySelector">
    <button
      v-for="option in familyOptions"
      :key="option.value"
      type="button"
      :class="['familySelector__button', { 'familySelector__button--active': option.value === selectedFamily }]"
      @click="handleFamilyChange(option.value)"
    >
      {{ option.label }}
    </button>
  </div>

  <div class="informationBar">
    <card path="/merge" :formats="availableFormats" :selectedFormat="selectedFormat.name" :handleChange="handleFormatChange">
      <template #header>{{ selectedFormat.title }}</template>
      <template #description>{{ selectedFormat.description }}</template>
    </card>
    <div class="mergeConfig">
      <h3>Output Format</h3>
      <searchable-select
        :options="formatOptions"
        :model-value="selectedFormat.name"
        placeholder="Select output format"
        @change="handleFormatSelect"
      />
      <p>{{ familyConfig.supportText }}</p>
    </div>
  </div>

  <label class="fileInput">
    <input
      @change="input"
      type="file"
      multiple
      :accept="acceptAttr"
      :aria-label="'Add ' + familyConfig.addLabel"
    />
    <div class="file">
      <p>Add {{ familyConfig.addLabel }} Here</p>
    </div>
  </label>

  <div class="batchBar">
    <button class="batchBar__button" :disabled="files.length <= 1 || isProcessing" @click="processMerge">
      <div>Merge Files</div>
    </button>
    <a
      class="batchBar__button batchBar__button--link"
      :class="{ 'batchBar__button--disabled': !hasOutput }"
      :href="hasOutput ? output.url : null"
      :download="hasOutput ? output.name : null"
      @click.prevent="downloadOutput"
    >
      <div>Download</div>
    </a>
    <button class="batchBar__button" :disabled="files.length <= 0 && !hasOutput" @click="clearAll">
      <div>Clear All</div>
    </button>
  </div>

  <p v-if="unsupportedCount > 0" class="notice">
    {{ unsupportedCount }} file(s) were skipped. {{ familyConfig.skipText }}
  </p>

  <div v-if="isProcessing || hasOutput || mergeStatus === FILE_STATUS.failed" class="progressCard">
    <div class="progressCard__top">
      <strong>{{ statusHeading }}</strong>
      <span>{{ mergeProgress }}%</span>
    </div>
    <div class="progressBar">
      <div class="progressBar__fill" :style="{ width: mergeProgress + '%' }"></div>
    </div>
    <p>{{ mergeMessageText }}</p>
  </div>

  <div class="files">
    <p v-if="files.length > 1" class="queueHint">Drag files to change the merge order, or use the Up and Down buttons for keyboard-friendly reordering.</p>
    <div
      v-for="(file, index) in files"
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
        <div class="fileRow__name">{{ index + 1 }}. {{ file.name }}</div>
        <div v-if="file.inputFormat" class="fileRow__meta">{{ file.inputFormat.toUpperCase() }}</div>
      </div>
      <div class="fileRow__order">
        <button type="button" :disabled="isProcessing || index === 0" @click="moveFile(file.id, -1)">
          Up
        </button>
        <button type="button" :disabled="isProcessing || index === files.length - 1" @click="moveFile(file.id, 1)">
          Down
        </button>
      </div>
      <button class="fileRow__remove" type="button" :disabled="isProcessing" @click="removeFile(file.id)">
        Remove
      </button>
    </div>
  </div>

  <div class="downloadCard" v-if="hasOutput">
    <div>
      <strong>{{ output.name }}</strong>
      <p>Your merged {{ familyConfig.label.toLowerCase() }} file is ready.</p>
    </div>
    <a :href="output.url" :download="output.name">Download</a>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Step 1</template>
      <template #description>
        Choose a merge family and the output extension you want to create.
      </template>
    </information>
    <information>
      <template #header>Step 2</template>
      <template #description>
        Add your files and drag them into the exact order the merge should follow.
      </template>
    </information>
    <information>
      <template #header>Step 3</template>
      <template #description>
        Start the merge, watch progress update, and download a single output file when it finishes.
      </template>
    </information>
  </div>
</template>

<script>
import Card from "@/components/card.vue";
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import SearchableSelect from "@/components/searchable-select.vue";
import { FILE_STATUS } from "@/js/constants";
import { useMeta } from "vue-meta";

const PDF_MERGE_FORMAT = {
  name: "pdf",
  extension: "pdf",
  title: "Portable Document Format",
  description:
    "Merge PDF files into a single PDF entirely in your browser. PDF merge uses pdf-lib directly and only accepts PDF inputs when PDF output is selected.",
  mimeType: "application/pdf",
};

const FAMILY_CONFIG = {
  archive: {
    label: "Archive",
    defaultFormat: "zip",
    storeKey: "archiveFormats",
    outputAllow: ["zip", "7z", "tar", "tar.gz", "tar.bz2", "tar.xz", "iso"],
    description:
      "Create a single archive file from the files in your queue. Supports ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO output.",
    addLabel: "Files",
    accept: "",
    skipText: "Archive merge accepts regular files and packages them into one archive.",
    supportText:
      "Archive merge packs the queued files into a single archive. Duplicate names are automatically renamed.",
  },
  audio: {
    label: "Audio",
    defaultFormat: "mp3",
    storeKey: "audioFormats",
    outputAllow: ["mp3", "wav", "ogg", "flac", "aac", "m4a", "opus", "webm", "wma", "alac", "ape"],
    description:
      "Merge audio files into one downloadable track using FFmpeg in your browser. Queue order controls playback order.",
    addLabel: "Audio Files",
    accept: "audio/*",
    skipText: "Only supported audio formats can be added to the queue.",
    supportText:
      "Audio merge accepts the same audio families already supported by the converter and follows the queue order exactly.",
  },
  video: {
    label: "Video",
    defaultFormat: "mp4",
    storeKey: "videoFormats",
    outputAllow: ["mp4", "webm", "mkv", "mov", "avi", "wmv", "flv", "3gp", "mpeg", "ts", "ogv"],
    description:
      "Merge video clips into one downloadable file with browser-based FFmpeg processing. Rearrange the queue before running the merge.",
    addLabel: "Video Files",
    accept: "video/*",
    skipText: "Only supported video formats can be added to the queue.",
    supportText:
      "Video merge creates one final video file. HLS playlist output is excluded because it produces multiple files.",
  },
  document: {
    label: "Document",
    defaultFormat: "markdown",
    storeKey: "documentFormats",
    outputAllow: ["markdown", "html", "docx", "odt", "epub", "rtf", "pdf"],
    inputAllow: [
      "pdf",
      "markdown",
      "gfm",
      "commonmark",
      "html",
      "docx",
      "odt",
      "rst",
      "latex",
      "org",
      "mediawiki",
      "textile",
      "asciidoc",
      "epub",
      "rtf",
      "typst",
      "docbook",
      "opml",
      "fb2",
      "muse",
      "djot",
      "dokuwiki",
      "creole",
      "haddock",
      "man",
    ],
    description:
      "Merge supported document formats into one file with a Pandoc-based document pipeline. This flow is limited to formats that can be combined reliably.",
    addLabel: "Documents",
    accept:
      ".pdf,.md,.markdown,.html,.htm,.docx,.odt,.rst,.tex,.org,.wiki,.textile,.adoc,.asciidoc,.epub,.rtf,.typ,.xml,.opml,.fb2,.muse,.dj,.doku,.creole,.man,.hs",
    skipText: "Document merge only accepts the listed formats. PDF output accepts PDF inputs only.",
    supportText:
      "Document merge is intentionally limited to formats Pandoc can combine reliably, plus direct PDF-to-PDF merging with pdf-lib.",
    customFormats: [PDF_MERGE_FORMAT],
  },
};

export default {
  name: "Merge",
  components: { Card, Descriptor, Information, SearchableSelect },
  setup() {
    useMeta({
      title: "Free File Merge Tool - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Merge archive, audio, video and supported document files in-browser with drag-to-reorder queues and one-file download output.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/merge" }],
      htmlAttrs: { lang: "en" },
    });
  },
  data() {
    return {
      FILE_STATUS,
      unsupportedCount: 0,
      draggedId: null,
      syncedRouteKey: null,
    };
  },
  computed: {
    familyOptions() {
      return Object.keys(FAMILY_CONFIG).map((key) => ({
        value: key,
        label: FAMILY_CONFIG[key].label,
      }));
    },
    selectedFamily() {
      return FAMILY_CONFIG[this.$route.params.family] ? this.$route.params.family : "archive";
    },
    familyConfig() {
      return FAMILY_CONFIG[this.selectedFamily];
    },
    storeFormats() {
      const storeFormats = this.$store.state[this.familyConfig.storeKey] || [];
      const customFormats = this.familyConfig.customFormats || [];
      return [...storeFormats, ...customFormats];
    },
    availableFormats() {
      return this.storeFormats.filter((format) =>
        this.familyConfig.outputAllow.includes(format.name)
      );
    },
    selectedFormat() {
      return (
        this.availableFormats.find((format) => format.name === this.$route.params.format) ||
        this.availableFormats[0]
      );
    },
    formatOptions() {
      return this.availableFormats.map((format) => ({
        value: format.name,
        label: `${format.name.toUpperCase()} — ${format.title}`,
      }));
    },
    acceptAttr() {
      return this.familyConfig.accept;
    },
    files() {
      return this.$store.state.mergeFiles;
    },
    output() {
      return this.$store.state.mergeOutput;
    },
    mergeStatus() {
      return this.$store.state.mergeStatus;
    },
    mergeProgress() {
      return this.$store.state.mergeProgress;
    },
    mergeMessage() {
      return this.$store.state.mergeMessage;
    },
    hasOutput() {
      return !!(this.output && this.output.url && this.output.name);
    },
    isProcessing() {
      return this.mergeStatus === FILE_STATUS.processing;
    },
    pageTitle() {
      return `${this.familyConfig.label} Merge Tool`;
    },
    mergeMessageText() {
      if (this.mergeStatus === FILE_STATUS.failed) {
        return this.mergeMessage || "Merge failed.";
      }
      if (this.mergeStatus === FILE_STATUS.processed) {
        return "Merged file ready for download.";
      }
      return this.mergeMessage || "Waiting to start.";
    },
    statusHeading() {
      if (this.mergeStatus === FILE_STATUS.failed) return "Merge failed";
      if (this.mergeStatus === FILE_STATUS.processed) return "Merge complete";
      if (this.mergeStatus === FILE_STATUS.processing) return "Merging";
      return "Ready";
    },
    documentInputLookup() {
      const allowed = new Set(this.familyConfig.inputAllow || []);
      return this.storeFormats
        .filter((format) => allowed.has(format.name))
        .reduce((map, format) => {
          if (!map[format.extension]) map[format.extension] = format.name;
          if (format.name === "markdown") {
            map.markdown = "markdown";
            map.md = "markdown";
          }
          if (format.name === "html") {
            map.htm = "html";
            map.html = "html";
          }
          return map;
        }, {});
    },
    routeKey() {
      const formatName = this.selectedFormat ? this.selectedFormat.name : this.familyConfig.defaultFormat;
      return `/merge/${this.selectedFamily}/${formatName}`;
    },
  },
  watch: {
    routeKey: {
      immediate: true,
      handler(routeKey) {
        if (this.$route.path !== routeKey) {
          this.$router.replace(routeKey);
          return;
        }
        this.$store.dispatch("setMergeFamily", this.selectedFamily);
        this.$store.dispatch("setMergeFormat", this.selectedFormat);
        if (this.syncedRouteKey && this.syncedRouteKey !== routeKey) {
          this.$store.dispatch("clearMergeFiles");
          this.unsupportedCount = 0;
        }
        this.syncedRouteKey = routeKey;
      },
    },
  },
  beforeUnmount() {
    this.$store.dispatch("clearMergeFiles");
  },
  methods: {
    handleFamilyChange(family) {
      const format = FAMILY_CONFIG[family].defaultFormat;
      this.$router.push(`/merge/${family}/${format}`);
    },
    handleFormatSelect(value) {
      this.$router.push(`/merge/${this.selectedFamily}/${value}`);
    },
    handleFormatChange(event) {
      this.handleFormatSelect(event.target.value);
    },
    input(event) {
      this.addFiles(event.target.files);
      event.target.value = "";
    },
    fileExtension(file) {
      const parts = String(file.name || "").toLowerCase().split(".");
      return parts.length > 1 ? parts.pop() : "";
    },
    audioVideoAllowed(file) {
      const extension = this.fileExtension(file);
      const allowedExtensions = new Set(
        this.$store.state[this.familyConfig.storeKey].map((format) => format.extension)
      );
      return allowedExtensions.has(extension) || String(file.type || "").startsWith(`${this.selectedFamily}/`);
    },
    detectDocumentFormat(file) {
      const extension = this.fileExtension(file);
      if (this.selectedFormat && this.selectedFormat.name === "pdf") {
        return extension === "pdf" ? "pdf" : null;
      }
      if (extension === "pdf") return null;
      return this.documentInputLookup[extension] || null;
    },
    addFiles(list) {
      const accepted = [];
      let skipped = 0;
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        if (this.selectedFamily === "archive") {
          accepted.push({ file });
          continue;
        }
        if (this.selectedFamily === "audio" || this.selectedFamily === "video") {
          if (this.audioVideoAllowed(file)) {
            accepted.push({ file });
          } else {
            skipped++;
          }
          continue;
        }
        const inputFormat = this.detectDocumentFormat(file);
        if (inputFormat) {
          accepted.push({
            file,
            inputFormat,
            inputExtension: this.fileExtension(file),
          });
        } else {
          skipped++;
        }
      }
      if (accepted.length) {
        this.$store.dispatch("addMergeFiles", accepted);
      }
      this.unsupportedCount += skipped;
    },
    processMerge() {
      this.$store.dispatch("processMerge");
    },
    clearAll() {
      this.$store.dispatch("clearMergeFiles");
      this.unsupportedCount = 0;
      this.draggedId = null;
    },
    downloadOutput() {
      if (!this.hasOutput) return;
      const link = document.createElement("a");
      link.href = this.output.url;
      link.download = this.output.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    removeFile(id) {
      this.$store.dispatch("removeMergeFile", id);
    },
    moveFile(id, offset) {
      if (this.isProcessing) return;
      const ids = this.files.map((file) => file.id);
      const index = ids.indexOf(id);
      const nextIndex = index + offset;
      if (index === -1 || nextIndex < 0 || nextIndex >= ids.length) return;
      const [moved] = ids.splice(index, 1);
      ids.splice(nextIndex, 0, moved);
      this.$store.dispatch("reorderMergeFiles", ids);
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
      const ids = this.files.map((file) => file.id);
      const fromIndex = ids.indexOf(this.draggedId);
      const targetIndex = ids.indexOf(targetId);
      if (fromIndex === -1 || targetIndex === -1) {
        this.draggedId = null;
        return;
      }
      const [moved] = ids.splice(fromIndex, 1);
      ids.splice(targetIndex, 0, moved);
      this.$store.dispatch("reorderMergeFiles", ids);
      this.draggedId = null;
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.familySelector {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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
    transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;

    &:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    &--active {
      background-color: var(--accent);
      border-color: var(--accent);
      color: var(--accent-text);
      cursor: default;
      transform: none;
    }
  }
}

.mergeConfig {
  flex: 1;
  padding: 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);

  h3 {
    margin: 0 0 0.75rem;
    color: var(--text-primary);
  }

  p {
    margin: 0.85rem 0 0;
    color: var(--text-secondary);
    line-height: 1.5;
  }
}

.fileInput {
  @include mid-width;
  display: block;
  height: 9rem;
  margin-bottom: 1rem;
  position: relative;
  cursor: pointer;
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);

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
}

.batchBar {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;

  &__button {
    flex: 1;
    min-width: 140px;
    border: 1px solid var(--border);
    background-color: var(--bg-surface);
    color: var(--text-primary);
    border-radius: $default-radius;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    text-decoration: none;

    > div {
      background-color: var(--bg-secondary);
      padding: 0.6rem 1rem;
      border-radius: $default-radius;
      transition: background-color 0.15s, transform 0.15s;
    }

    &:not([disabled]):hover > div,
    &:not(.batchBar__button--disabled):hover > div {
      background-color: var(--bg-surface-hover);
      transform: translateY(-2px);
    }

    &[disabled],
    &--disabled {
      opacity: 0.45;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
}

.notice,
.queueHint {
  @include mid-width;
  margin-top: 0;
  margin-bottom: 0.85rem;
  color: var(--text-secondary);
}

.progressCard,
.downloadCard {
  @include mid-width;
  margin-bottom: 1rem;
  padding: 1rem 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
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

.files {
  @include mid-width;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-bottom: 1.2rem;
}

.fileRow {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.75rem 1rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);

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
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    margin-top: 0.2rem;
    color: var(--text-secondary);
    font-size: 0.8rem;
  }

  &__remove {
    border: none;
    background-color: var(--negative);
    color: #fff;
    border-radius: 999px;
    padding: 0.45rem 0.8rem;
    font-weight: 700;
    cursor: pointer;

    &[disabled] {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__order {
    display: flex;
    gap: 0.4rem;

    button {
      border: 1px solid var(--border);
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      border-radius: 999px;
      padding: 0.4rem 0.7rem;
      font-weight: 700;
      cursor: pointer;

      &[disabled] {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
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

@media only screen and (max-width: 55rem) {
  .downloadCard,
  .fileRow {
    flex-direction: column;
    align-items: flex-start;
  }

  .fileRow__remove,
  .downloadCard a {
    width: 100%;
  }
}
</style>
