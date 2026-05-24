<template>
  <descriptor>
    <template #header>Archive Converter</template>
    <template #description>
      Convert archive files online for free. Supports ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO formats — all processed in your browser.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="archive" name="from" mediaType="archive"></format-selector>
  <div class="infomationContainer">
    <information>
      <template #header>Broad Archive Support</template>
      <template #description>
        Convert between ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO using in-browser archive pipelines.
      </template>
    </information>
    <information>
      <template #header>In-Browser Processing</template>
      <template #description>
        Archive conversion runs directly in your browser with WebAssembly runtimes. Your files stay on your device.
      </template>
    </information>
    <information>
      <template #header>No Upload Limits</template>
      <template #description>
        Convert as many archive files as needed without account limits or server-side upload queues.
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
      title: "Free Online Archive Converter - Conversion Today",
      meta: [
        {
          name: "description",
          content:
            "Convert archive files online for free in your browser. Supports ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO formats.",
        },
      ],
      link: [{ rel: "canonical", href: "https://conversiontoday.com/archive" }],
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
