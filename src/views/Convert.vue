<style scoped lang="scss">
@import "src/styles/_utilities";

.fileInput {
  @include mid-width;
  display: block;
  height: 10rem;
  background-color: rgba($alWhite, 0.5);
  margin-bottom: 1rem;
  position: relative;
  color: $alBlack;
  font-size: 1rem;
  font-weight: 900;
  box-shadow: 0 0px 0 0 rgba($alWhite, 0.5);
  border-radius: $default-radius;
  margin-bottom: 50px;
  cursor: pointer;
  > .file {
    transition: 0.6s ease;
    border-radius: $default-radius;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $alWhite;
  }
  &:hover > .file {
    transform: translateY(-4px);
    transition: 0.1s ease;
  }
  &:active > .file {
    transform: translateY(0px);
    transition: 0.1s ease;
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
    box-shadow: 0 0 0 2px $blue;
  }
}
.files {
  @include mid-width-flex;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;

  @media screen and (max-width: $tablet-break) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media screen and (max-width: $mobile-break) {
    grid-template-columns: repeat(1, 1fr);
  }
}
.batchBar {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  position: relative;
  margin-bottom: 1rem;
  > * {
    display: inline-block;
    &:not(:last-child) {
      margin-right: 1rem;
    }
  }
  &__button {
    flex: 1;
    border: none;
    background-color: rgba($alWhite, 0.5);
    border-radius: $default-radius;
    color: $alBlack;
    font-size: 1rem;
    font-weight: 900;
    padding: 0;

    cursor: pointer;
    > div {
      background-color: $alWhite;
      padding: 0.5rem 1rem;
      border-radius: $default-radius;
      height: 100%;
    }
    &[disabled] {
      cursor: not-allowed;
      opacity: 0.5;
    }
    &:not([disabled]):hover > div {
      transition: 0.1s ease;
      transform: translateY(-4px);
    }
  }
}

.dropTarget {
  @include abs-overlay;
  position: fixed;
  z-index: 100;
  margin: 0;
  background-color: rgba($alBlack, 0.75);
  box-shadow: inset 0 0 200px $alWhite;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7rem;
  font-weight: 900;
  pointer-events: none;
  overflow: hidden;
  text-align: center;
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
  font-size: 2rem;
  margin-top: 2rem;
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
      :path="'/'"
      :formats="formats1"
      :selectedFormat="formatInofo.name"
      :handleChange="handleChangeFormat1"
    >
      <template #header>{{ formatInofo.title }}</template>
      <template #description>{{ formatInofo.description }}</template>
    </card>
    <card
      :path="'/image/' + formatInofo.name"
      :handleChange="handleChangeFormat2"
      :formats="formats2"
      :selectedFormat="formatInofo2.name"
    >
      <template #header>{{ formatInofo2.title }}</template>
      <template #description>{{ formatInofo2.description }}</template>
    </card>
  </div>
  <label class="fileInput">
    <input @change="input" type="file" name="thing" id="" multiple />
    <div class="file">
      <p>Add Images Here</p>
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
        " Converter | No Restrictions ",
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
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content:
            "Free Online " +
            this.$route.params.format.toUpperCase() +
            " to " +
            this.$route.params.format2.toUpperCase() +
            " Converter | No Restrictions ",
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
          content: "https://conversiontoday.com/img/logo-conversion-today.png",
        },
        // Facebook OpenGraph
        {
          property: "og:title",
          content:
            "Free Online " +
            this.$route.params.format.toUpperCase() +
            " to " +
            this.$route.params.format2.toUpperCase() +
            " Converter | No Restrictions ",
        },
        { property: "og:site_name", content: "Conversion Today" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://conversiontoday.com/img/logo-conversion-today.png",
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
            "https://conversiontoday.com/image/" +
            this.$route.params.format +
            "/" +
            this.$route.params.format2,
        },
      ],
    });
    return {
      fileInDropZone: 0,
      format: this.$route.params.format,
      format2: this.$route.params.format2,
    };
  },
  computed: {
    files() {
      return this.$store.state.files;
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
      return this.$store.state.formats.find((formatObj) => {
        if (formatObj.name == this.format) return formatObj;
      });
    },
    formatInofo2() {
      return this.$store.state.formats.find((formatObj) => {
        if (formatObj.name == this.format2) return formatObj;
      });
    },
    formatList1() {
      return this.$store.state.formats
        .filter((format) => {
          return format.name != this.$route.params.format;
        })
        .map((formatList, index) => {
          return `<a href="/image/${this.format}/${formatList.name}">${
            index + 1
          }. ${this.format.toUpperCase()} to ${formatList.name.toUpperCase()}</a>`;
        });
    },
    formatList2() {
      return this.$store.state.formats
        .filter((format) => {
          return (
            !format.isConvertToOnly && format.name != this.$route.params.format2
          );
        })
        .map((formatList, index) => {
          return `<a  href="/image/${formatList.name}/${this.format2}">${
            index + 1
          }. ${formatList.name.toUpperCase()} to ${this.format2.toUpperCase()}</a>`;
        });
    },
    formats1() {
      return this.$store.state.formats.filter((format) => {
        return (
          !format.isConvertToOnly && format.name != this.$route.params.format2
        );
      });
    },
    formats2() {
      return this.$store.state.formats;
    },
  },
  methods: {
    input(e) {
      this.$store.dispatch("addFiles", e.target.files);
      // e.target.value = "";
    },
    fileDrop(e) {
      e.preventDefault();
      this.$store.dispatch("addFiles", e.dataTransfer.files);
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
      this.$store.dispatch("processAllFiles", {
        format: this.selectedFormat,
      });
    },
    downloadAll() {
      this.files.forEach((file) => {
        let a = document.createElement("a");
        a.download = file.output.name;
        a.href = file.output.url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
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
      this.$store.dispatch("clearFiles");
    },
    handleChangeFormat1(event) {
      window.location.href = `/image/${event.target.value}/${this.format2}`;
    },
    handleChangeFormat2(event) {
      window.location.href = `/image/${this.format}/${event.target.value}`;
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
    this.$store.dispatch("setFormat", this.formatInofo2);
    this.$store.dispatch("loadWorker");

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
