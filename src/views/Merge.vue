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

  <div class="downloadCard" v-if="hasOutput">
    <div>
      <strong>{{ output.name }}</strong>
      <p>Your merged {{ familyConfig.label.toLowerCase() }} file is ready.</p>
    </div>
    <a :href="output.url" :download="output.name">Download</a>
  </div>

  <div class="files">
    <p v-if="files.length > 1" class="queueHint">Drag files to change the merge order.</p>
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
      <template #header>Order-Accurate Merge</template>
      <template #description>
        Queue order is respected exactly, so your final output follows the same sequence you set by dragging.
      </template>
    </information>
    <information>
      <template #header>Single Output File</template>
      <template #description>
        Merge many inputs into one downloadable file, so sharing and storage are simpler.
      </template>
    </information>
    <information>
      <template #header>Private Browser Processing</template>
      <template #description>
        Files are processed locally in your browser instead of being uploaded to a remote server.
      </template>
    </information>
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

  <div class="faqSection">
    <h3 class="faqSection__title">Merge FAQ</h3>
    <faq :faqs="faqs" @toggle="toggleFaq" />
  </div>
</template>

<script>
import Card from "@/components/card.vue";
import Descriptor from "@/components/descriptor.vue";
import Faq from "@/components/faq.vue";
import Information from "@/components/information.vue";
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

function buildMergeFaqs(familyLabel) {
  return [
    {
      question: `How does ${familyLabel.toLowerCase()} merge work?`,
      answer:
        "Your queued files are processed locally in the browser and combined into a single output file in the order shown in the list.",
      open: false,
    },
    {
      question: "Are my files uploaded to a server?",
      answer: "No. Merge processing runs in-browser, so your files stay on your device during the merge.",
      open: false,
    },
    {
      question: "Can I reorder files before merging?",
      answer: "Yes. Drag items in the queue to set the exact order, then start the merge.",
      open: false,
    },
    {
      question: "Why are some files skipped?",
      answer:
        "Each merge family accepts specific input types. Unsupported files are skipped to prevent invalid output.",
      open: false,
    },
  ];
}

export default {
  name: "Merge",
  components: { Card, Descriptor, Faq, Information },
  setup() {
    useMeta({
      title: "Free File Merge Tool - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Merge archive, audio, video and supported document files in-browser with drag-to-reorder queues and one-file download output.",
        },
        {
          name: "keywords",
          content: "free file merger, merge pdf, merge audio, merge video, combine files online, merge archives, local browser file merger",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/merge" }],
      htmlAttrs: { lang: "en" },
    });
  },
  data() {
    return {
      FILE_STATUS,
      unsupportedCount: 0,
      draggedId: null,
      syncedRouteKey: null,
      faqs: buildMergeFaqs(FAMILY_CONFIG.archive.label),
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
      const merged = [...storeFormats, ...customFormats];
      const byName = new Map();
      merged.forEach((format) => {
        byName.set(format.name, format);
      });
      return Array.from(byName.values());
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
        this.faqs = buildMergeFaqs(this.familyConfig.label);
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
      const requirePdfInput = this.selectedFamily === "document" && this.selectedFormat && this.selectedFormat.name === "pdf";
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
          if (requirePdfInput && inputFormat !== "pdf") {
            skipped++;
            continue;
          }
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
      if (this.selectedFamily === "document" && this.files.length > 0) {
        const isPdfOutput = this.selectedFormat && this.selectedFormat.name === "pdf";
        const hasNonPdf = this.files.some((file) => file.inputFormat !== "pdf");
        if (isPdfOutput && hasNonPdf) {
          this.$store.commit("setMergeStatus", FILE_STATUS.failed);
          this.$store.commit("setMergeMessage", "PDF output requires PDF input files.");
          return;
        }
      }
      this.$store.dispatch("processMerge");
    },
    clearAll() {
      this.$store.dispatch("clearMergeFiles");
      this.unsupportedCount = 0;
      this.draggedId = null;
    },
    removeFile(id) {
      this.$store.dispatch("removeMergeFile", id);
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
    toggleFaq(index) {
      this.faqs = this.faqs.map((faq, faqIndex) => ({
        ...faq,
        open: faqIndex === index ? !faq.open : faq.open,
      }));
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  .downloadCard,
  .fileRow {
    flex-direction: column;
    align-items: flex-start;
  }

  .downloadCard a {
    width: 100%;
  }
}
</style>
