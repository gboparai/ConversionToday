<template>
  <descriptor>
    <template #header>Archive Compress Tool</template>
    <template #description>
      Compress multiple files into one {{ selectedFormat.name.toUpperCase() }} archive in your browser.
      Choose a format, add files, compress, and download one output file.
    </template>
  </descriptor>

  <div class="informationBar">
    <card path="/compress" :formats="archiveFormats" :selectedFormat="selectedFormat.name" :handleChange="handleFormatChange">
      <template #header>{{ selectedFormat.title }}</template>
      <template #description>{{ selectedFormat.description }}</template>
    </card>
  </div>

  <label class="fileInput">
    <input
      @change="input"
      type="file"
      multiple
      aria-label="Add files to compress"
    />
    <div class="file">
      <p>Add Files Here</p>
    </div>
  </label>

  <div class="batchBar">
    <button class="batchBar__button" :disabled="files.length <= 0 || isProcessing" @click="processCompress">
      <div>Compress Files</div>
    </button>
    <button class="batchBar__button" :disabled="files.length <= 0 && !hasOutput" @click="clearAll">
      <div>Clear All</div>
    </button>
  </div>

  <div v-if="isProcessing || hasOutput || mergeStatus === FILE_STATUS.failed" class="progressCard">
    <div class="progressCard__top">
      <strong>{{ statusHeading }}</strong>
      <span>{{ mergeProgress }}%</span>
    </div>
    <div class="progressBar">
      <div class="progressBar__fill" :style="{ width: mergeProgress + '%' }"></div>
    </div>
    <p>{{ statusMessage }}</p>
  </div>

  <div class="downloadCard" v-if="hasOutput">
    <div>
      <strong>{{ outputDownloadName }}</strong>
      <p>Your compressed archive is ready.</p>
    </div>
    <a :href="output.url" :download="outputDownloadName">Download</a>
  </div>

  <div class="files">
    <div
      v-for="file in files"
      :key="file.id"
      class="fileRow"
    >
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
      <template #header>One Output File</template>
      <template #description>
        All selected files are packed into a single archive file for easier sharing and storage.
      </template>
    </information>
    <information>
      <template #header>No Reordering Needed</template>
      <template #description>
        This tool focuses on packaging files into one archive, so there is no drag-to-reorder queue step.
      </template>
    </information>
    <information>
      <template #header>Private Processing</template>
      <template #description>
        Compression runs locally in your browser using WebAssembly tools with no file uploads.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Step 1</template>
      <template #description>
        Choose the archive output format you want to generate.
      </template>
    </information>
    <information>
      <template #header>Step 2</template>
      <template #description>
        Add your files to the queue.
      </template>
    </information>
    <information>
      <template #header>Step 3</template>
      <template #description>
        Compress and download one final archive file.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Compress FAQ</h3>
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

function buildFaqs(formatName) {
  const name = formatName.toUpperCase();
  return [
    {
      question: `How does ${name} compression work?`,
      answer:
        "Your files are packaged locally in the browser and written into one downloadable archive file.",
      open: false,
    },
    {
      question: "Are my files uploaded to a server?",
      answer: "No. Compression runs in-browser, so your files stay on your device.",
      open: false,
    },
    {
      question: "Can I choose different output archive formats?",
      answer:
        "Yes. You can switch between any archive format that the archive converter supports as an output format.",
      open: false,
    },
    {
      question: "Does this tool reorder files before compressing?",
      answer: "No. This tool just packages your selected files into one archive without drag-to-reorder controls.",
      open: false,
    },
    {
      question: "Is this compression tool completely free?",
      answer: "Yes, you can compress as many files as you want without any cost or subscription.",
      open: false,
    },
  ];
}

export default {
  name: "Compress",
  components: { Card, Descriptor, Faq, Information },
  setup() {
    useMeta({
      title: "Free Archive Compress Tool - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Compress multiple files into one archive online for free. Output ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO with secure on-device processing.",
        },
        {
          name: "keywords",
          content: "free archive compressor, compress to zip, online compression tool, create tar archive, 7z compression, iso compressor, secure on-device compression",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/compress" }],
      htmlAttrs: { lang: "en" },
    });
  },
  data() {
    return {
      FILE_STATUS,
      syncedRouteKey: null,
      faqs: buildFaqs("zip"),
    };
  },
  computed: {
    archiveFormats() {
      return this.$store.state.archiveFormats.filter((format) => format.canConvertTo);
    },
    selectedFormat() {
      return (
        this.archiveFormats.find((format) => format.name === this.$route.params.format) ||
        this.archiveFormats[0]
      );
    },
    routeKey() {
      const formatName = this.selectedFormat ? this.selectedFormat.name : "zip";
      return `/compress/${formatName}`;
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
    outputDownloadName() {
      if (!this.hasOutput) return "";
      const extension = (this.selectedFormat && this.selectedFormat.name) || "zip";
      const lowerName = this.output.name.toLowerCase();
      const lowerExtension = extension.toLowerCase();
      let baseName = this.output.name;

      if (lowerName.endsWith(`.${lowerExtension}`)) {
        baseName = this.output.name.slice(0, -(lowerExtension.length + 1));
      } else {
        baseName = this.output.name.replace(/\.[^/.]+$/, "");
      }

      baseName = baseName.replace(/-merged$/i, "");
      if (!baseName) baseName = "archive";
      return `${baseName}-compressed.${extension}`;
    },
    isProcessing() {
      return this.mergeStatus === FILE_STATUS.processing;
    },
    statusHeading() {
      if (this.mergeStatus === FILE_STATUS.failed) return "Compression failed";
      if (this.mergeStatus === FILE_STATUS.processed) return "Compression complete";
      if (this.mergeStatus === FILE_STATUS.processing) return "Compressing";
      return "Ready";
    },
    statusMessage() {
      if (this.mergeStatus === FILE_STATUS.failed) {
        return this.mergeMessage || "Compression failed.";
      }
      if (this.mergeStatus === FILE_STATUS.processed) {
        return "Compressed archive ready for download.";
      }
      return this.mergeMessage || "Waiting to start.";
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
        this.$store.dispatch("setMergeFamily", "archive");
        this.$store.dispatch("setMergeFormat", this.selectedFormat);
        if (this.syncedRouteKey && this.syncedRouteKey !== routeKey) {
          this.$store.dispatch("clearMergeFiles");
        }
        this.faqs = buildFaqs(this.selectedFormat.name);
        this.syncedRouteKey = routeKey;
      },
    },
  },
  beforeUnmount() {
    this.$store.dispatch("clearMergeFiles");
  },
  methods: {
    handleFormatChange(event) {
      this.$router.push(`/compress/${event.target.value}`);
    },
    input(event) {
      this.addFiles(event.target.files);
      event.target.value = "";
    },
    addFiles(list) {
      const accepted = [];
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        if (file) {
          accepted.push({ file });
        }
      }
      if (accepted.length) {
        this.$store.dispatch("addMergeFiles", accepted);
      }
    },
    processCompress() {
      this.$store.dispatch("processMerge");
    },
    clearAll() {
      this.$store.dispatch("clearMergeFiles");
    },
    removeFile(id) {
      this.$store.dispatch("removeMergeFile", id);
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

.notice {
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
