<template>
  <descriptor>
    <template #header>Free Archive Converter & Extractor Online</template>
    <template #description>
      Convert and extract ZIP, 7Z, RAR, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO archives — free, no file size limits, no restrictions.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="archive" name="from" mediaType="archive"></format-selector>

  <div class="infomationContainer">
    <information>
      <template #header>8 Archive Formats</template>
      <template #description>
        Convert between ZIP, 7Z, RAR, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO. Repack archives from one format to another without extracting first.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Handle large archives — multi-gigabyte ZIP files, TAR backups, ISO disk images — without hitting any size cap or upload limit.
      </template>
    </information>
    <information>
      <template #header>Extract & Repack</template>
      <template #description>
        Open existing archives and re-export their contents in any supported format. Great for converting legacy archive formats.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>Bulk Archive Conversion</template>
      <template #description>
        Convert multiple archive files at once in a single batch. No need to process them one by one.
      </template>
    </information>
    <information>
      <template #header>100% Free, No Signup</template>
      <template #description>
        No account, no email, no credit card required. Every archive conversion is completely free with no daily limits or quotas.
      </template>
    </information>
    <information>
      <template #header>Your Archives Stay Private</template>
      <template #description>
        Archive files are processed directly in your browser and never uploaded to any server. Your data stays on your device.
      </template>
    </information>
  </div>
</template>

<script>
import FormatSelector from "@/components/format-selector.vue";
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import { useMeta } from "vue-meta";

export default {
  name: "ArchiveHome",
  setup() {
    useMeta({
      title: "Free Archive Converter & Extractor Online - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert ZIP, RAR, 7Z, TAR, TAR.GZ, ISO and more archive formats for free. No file size limit. Extract and repack archives online with no restrictions.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Archive Converter & Extractor Online - No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert ZIP, RAR, 7Z, TAR, TAR.GZ, ISO and more archive formats for free. No file size limit. Extract and repack archives online with no restrictions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Archive Converter & Extractor Online - No Limit Converter",
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
            "Convert ZIP, RAR, 7Z, TAR, TAR.GZ, ISO and more archive formats for free. No file size limit. Extract and repack archives online with no restrictions.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/archive" }],
      htmlAttrs: { lang: "en", amp: true },
    });
  },
  components: {
    FormatSelector,
    Descriptor,
    Information,
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

</style>
