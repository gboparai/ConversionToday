<template>
  <descriptor>
    <template #header>Trim {{ format.toUpperCase() }} File</template>
    <template #description>
      Upload your {{ format.toUpperCase() }} file, select the portion you want to keep using the slider, and click Trim to download your new file.
    </template>
  </descriptor>

  <div class="informationBar" v-if="formatInfo">
    <card 
      :path="`/${mediaType}-trimmer`" 
      :formats="availableFormats" 
      :selectedFormat="formatInfo.name" 
      :handleChange="handleChangeFormat"
    >
      <template #header>{{ formatInfo.title }}</template>
      <template #description>{{ formatInfo.description }}</template>
    </card>
  </div>

  <file-picker
    :disabled="!!file"
    :format-obj="{ name: format }"
    :media-type-label="mediaType"
    overlay-text="Drop Here"
    :label="mediaType"
    :fallback-accept="acceptMimeType"
    @files-selected="handleFilesSelected"
  />

  <p v-if="file" class="fileInput__notice">
    One {{ format.toUpperCase() }} is already loaded. Remove it to load a different file.
  </p>

  <action-bar :actions="actionButtons" />

  <div v-if="processing" class="progressCard">
    <div class="progressCard__top">
      <strong>Trimming File…</strong>
      <span>{{ progress }}%</span>
    </div>
    <div class="progressBar">
      <div class="progressBar__fill" :style="{ width: progress + '%' }"></div>
    </div>
  </div>

  <download-card
    v-if="outputUrl"
    title="Trimmed File Ready"
    description="Your trimmed media is ready for download."
    :url="outputUrl"
    :fileName="outputFileName"
  />

  <div class="trimmer-workspace" v-if="file">
    <custom-trim-player 
      :src="fileUrl" 
      :type="mediaType"
      v-model="trimRange"
      @durationchange="onDurationChange"
    />
  </div>

  <div class="files" v-if="file">
    <div class="fileRow">
      <div class="fileRow__copy">
        <div class="fileRow__name">{{ file.name }}</div>
      </div>
      <icon-button
        variant="remove"
        :disabled="processing"
        @click="clearFile"
        title="Remove"
        ariaLabel="Remove file"
      />
    </div>
  </div>
</template>

<script>
import FilePicker from "@/components/file-picker.vue";
import Descriptor from "@/components/descriptor.vue";
import CustomTrimPlayer from "@/components/custom-trim-player.vue";
import ActionBar from "@/components/ActionBar.vue";
import DownloadCard from "@/components/DownloadCard.vue";
import IconButton from "@/components/IconButton.vue";
import Card from "@/components/card.vue";
import { useMeta } from "vue-meta";

export default {
  name: "Trimmer",
  components: {
    FilePicker,
    Descriptor,
    CustomTrimPlayer,
    ActionBar,
    DownloadCard,
    IconButton,
    Card
  },
  data() {
    return {
      file: null,
      fileUrl: null,
      duration: 0,
      trimRange: [0, 0],
      processing: false,
      progress: 0,
      worker: null,
      outputUrl: null,
      outputFileName: null,
    };
  },
  computed: {
    mediaType() {
      return this.$route.path.includes("audio") ? "audio" : "video";
    },
    format() {
      return this.$route.params.format || "";
    },
    availableFormats() {
      return this.mediaType === 'audio' 
        ? this.$store.state.audioFormats 
        : this.$store.state.videoFormats;
    },
    formatInfo() {
      if (!this.availableFormats || !this.availableFormats.length) return null;
      return this.availableFormats.find(f => f.name === this.format) || this.availableFormats[0];
    },
    acceptMimeType() {
      return `${this.mediaType}/${this.format}`;
    },
    formattedDuration() {
      const diff = this.trimRange[1] - this.trimRange[0];
      return this.formatTime(diff);
    },
    actionButtons() {
      return [
        { 
          label: 'Trim File', 
          disabled: !this.file || this.processing || (this.duration === 0 && (!this.trimRange || this.trimRange[1] === 0 || isNaN(this.trimRange[1]))), 
          onClick: this.trimFile 
        },
        { 
          label: 'Clear', 
          disabled: this.processing, 
          onClick: this.clearFile 
        }
      ];
    }
  },
  setup() {
    useMeta({
      title: "Trim Media File Online | No Limit Converter",
      meta: [
        {
          name: "description",
          content: "Trim and cut your media files free online with No Limit Converter.",
        }
      ]
    });
  },
  methods: {
    handleChangeFormat(event) {
      this.$router.push(`/${this.mediaType}-trimmer/${event.target.value}`);
    },
    formatTime(seconds) {
      if (isNaN(seconds)) return "00:00";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const mStr = m.toString().padStart(2, '0');
      const sStr = s.toString().padStart(2, '0');
      if (h > 0) return `${h}:${mStr}:${sStr}`;
      return `${mStr}:${sStr}`;
    },
    handleFilesSelected(files) {
      if (files && files.length > 0) {
        this.file = files[0];
        this.fileUrl = URL.createObjectURL(this.file);
      }
    },
    clearFile() {
      if (this.fileUrl) {
        URL.revokeObjectURL(this.fileUrl);
      }
      if (this.outputUrl) {
        URL.revokeObjectURL(this.outputUrl);
      }
      this.file = null;
      this.fileUrl = null;
      this.duration = 0;
      this.trimRange = [0, 0];
      this.progress = 0;
      this.outputUrl = null;
      this.outputFileName = null;
    },
    onDurationChange(dur) {
      this.duration = dur;
      this.trimRange = [0, dur];
    },
    trimFile() {
      if (this.processing || !this.file) return;
      this.processing = true;
      this.progress = 0;
      this.outputUrl = null;

      if (!this.worker) {
        this.worker = new Worker(new URL('@/js/trimmer-worker.js', import.meta.url));
        this.worker.onmessage = this.handleWorkerMessage;
      }

      this.worker.postMessage({
        action: 'trim',
        file: this.file,
        format: this.format,
        mediaType: this.mediaType,
        start: this.trimRange[0],
        end: this.trimRange[1]
      });
    },
    handleWorkerMessage(e) {
      const data = e.data;
      if (data.status === 'progress') {
        this.progress = data.progress;
      } else if (data.status === 'done') {
        this.processing = false;
        this.progress = 100;
        
        this.outputFileName = `trimmed_${this.file.name}`;
        this.outputUrl = URL.createObjectURL(data.output);
      } else if (data.status === 'error') {
        this.processing = false;
        this.progress = 0;
        alert("An error occurred during trimming: " + (data.error || "Unknown error"));
      }
    }
  },
  beforeUnmount() {
    this.clearFile();
    if (this.worker) {
      this.worker.terminate();
    }
  }
};
</script>

<style scoped lang="scss">
@use "@/styles/_utilities.scss" as *;

.trimmer-workspace {
  @include mid-width;
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
}

.fileInput__notice {
  @include mid-width;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.progressCard {
  @include mid-width;
  margin-bottom: 1rem;
  padding: 1rem 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
}

.progressCard {
  &__top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
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
</style>
