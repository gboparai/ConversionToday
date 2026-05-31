<template>
  <descriptor>
    <template #header>Free Bulk Video Converter Online</template>
    <template #description>
      Bulk convert MP4, MOV, MKV, AVI, WebM and 10+ video formats — no file size limits, no restrictions, completely free.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="video" name="from" mediaType="video"></format-selector>

  <div class="infomationContainer">
    <information>
      <template #header>Convert Any Video Format</template>
      <template #description>
        Convert between MP4, WebM, MKV, MOV, AVI, WMV, FLV, 3GP, MPEG, TS, OGV and more. Over 100 possible video conversion pairs covered.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit on Videos</template>
      <template #description>
        Convert large video files — 4K footage, long recordings, high-bitrate files — without hitting any size cap or paying for a plan.
      </template>
    </information>
    <information>
      <template #header>Batch Video Conversion</template>
      <template #description>
        Convert multiple videos simultaneously in a single batch. No need to process files one at a time. Download all or get a ZIP.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>100% Free, No Signup</template>
      <template #description>
        No account, no email, no credit card required. Every video conversion is completely free with no daily limits or quotas.
      </template>
    </information>
    <information>
      <template #header>Fast Conversion</template>
      <template #description>
        Process dozens of video files in minutes. No waiting for server queues — conversion starts immediately and runs at full speed.
      </template>
    </information>
    <information>
      <template #header>Your Videos Stay Private</template>
      <template #description>
        Videos are processed directly in your browser and never uploaded to any server. Your files stay on your device at all times.
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
  name: "VideoHome",
  setup() {
    useMeta({
      title: "Free Bulk Video Converter Online - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Batch convert MP4, MOV, MKV, AVI, WebM and more video formats for free. No file size limit. Bulk convert multiple videos at once with no restrictions.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Bulk Video Converter Online - No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Batch convert MP4, MOV, MKV, AVI, WebM and more video formats for free. No file size limit. Bulk convert multiple videos at once with no restrictions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Bulk Video Converter Online - No Limit Converter",
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
            "Batch convert MP4, MOV, MKV, AVI, WebM and more video formats for free. No file size limit. Bulk convert multiple videos at once with no restrictions.",
        },
      ],
      link: [{ rel: "canonical", href: "https://nolimitconverter.com/video" }],
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
