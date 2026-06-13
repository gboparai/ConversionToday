<template>
  <descriptor>
    <template #header>Free Online Archive Converter & Extractor — No Limits</template>
    <template #description>
      Convert and extract ZIP, 7Z, RAR, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO archives free online. No file size limit, no signup required.
    </template>
  </descriptor>

  <format-selector :isFrom="true" path="archive" name="from" mediaType="archive"></format-selector>

  <div class="informationContainer">
    <information>
      <template #header>8 Archive Formats — All Free</template>
      <template #description>
        Convert between ZIP, 7Z, RAR, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO. Repack archives from one format to another without extracting first — completely free.
      </template>
    </information>
    <information>
      <template #header>No File Size Limit</template>
      <template #description>
        Handle large archives — multi-gigabyte ZIP files, TAR backups, ISO disk images — without hitting any size cap or upload limit. No paid plan required.
      </template>
    </information>
    <information>
      <template #header>Extract & Repack Free Online</template>
      <template #description>
        Open existing archives and re-export their contents in any supported format. Great for converting legacy archive formats — free with no restrictions.
      </template>
    </information>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>Convert Unlimited Archives</template>
      <template #description>
        Convert multiple archive files at once in a single batch. No need to process them one by one. No daily limits or quotas.
      </template>
    </information>
    <information>
      <template #header>100% Free — No Signup, No Account</template>
      <template #description>
        No registration, no email, no credit card required. Every archive conversion and extraction is completely free with no hidden costs.
      </template>
    </information>
    <information>
      <template #header>Private & Secure — Files Stay on Your Device</template>
      <template #description>
        Archive files are processed directly in your browser and never uploaded to any server. Your data stays private on your device.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">Archive Converter FAQ</h3>
    <faq :faqs="faqs" @toggle="toggleFaq" />
  </div>
</template>

<script>
import FormatSelector from "@/components/format-selector.vue";
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import Faq from "@/components/faq.vue";
import { useMeta } from "vue-meta";

export default {
  name: "ArchiveHome",
  data() {
    return {
      faqs: [
        {
          question: "What archive formats are supported?",
          answer: "You can convert between ZIP, 7Z, RAR (input), TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO — all free with no restrictions.",
          open: false,
        },
        {
          question: "Can I extract RAR files for free?",
          answer: "Yes. Add your RAR files, choose an output format like ZIP or 7Z, and extract/repack them for free. No WinRAR needed.",
          open: false,
        },
        {
          question: "Is there a file size limit?",
          answer: "No. You can process archives of any size — even multi-gigabyte ZIP files and ISO disk images — without any restrictions.",
          open: false,
        },
        {
          question: "Do I need to sign up?",
          answer: "No. No account, no email, no credit card required. Just open the archive converter and start converting.",
          open: false,
        },
        {
          question: "Are my files uploaded to a server?",
          answer: "No. All archive processing happens locally in your browser. Your files never leave your device.",
          open: false,
        },
      ],
    };
  },
  setup() {
    useMeta({
      title: "Free Online Archive Converter & Extractor — No Limits | No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Convert and extract ZIP, RAR, 7Z, TAR, ISO and more archive formats free online. No file size limit, no signup, unlimited conversions. Private browser-based archive tool.",
        },
        {
          name: "keywords",
          content:
            "free archive converter, extract rar online, convert zip free, online archive extractor, rar to zip free, 7z converter, no limit archive converter",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Online Archive Converter & Extractor — No Limits | No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
            "Convert and extract ZIP, RAR, 7Z, TAR, ISO and more archive formats free online. No file size limit, no signup, unlimited conversions.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Online Archive Converter & Extractor — No Limits | No Limit Converter",
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
            "Convert and extract ZIP, RAR, 7Z, TAR, ISO and more archive formats free online. No file size limit, no signup, unlimited conversions.",
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
    Faq,
  },
  methods: {
    toggleFaq(index) {
      this.faqs[index].open = !this.faqs[index].open;
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.faqSection {
  @include mid-width;
  margin-top: 1.75rem;
  margin-bottom: 2rem;
  padding: 0 0.25rem;

  &__title {
    text-align: center;
    font-size: 1.75rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
}
</style>
