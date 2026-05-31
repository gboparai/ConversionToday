
<template>
  <descriptor>
    <template #header>About</template>
    <template #description>
      Your go-to for free, hassle-free file conversion that's accessible to all!
    </template>
  </descriptor>
  <div class="infomationContainer">
    <div>
      <h2>Our Story</h2>
      <p>
        Welcome to No Limit Converter, where we've embarked on a mission to
        redefine the file conversion experience. Frustrated by the limitations
        imposed on users dealing with a large number of files, we set out to
        create a solution that breaks free from these constraints.
      </p>
      <h2>Breaking Limitations</h2>
      <p>
        Converting a vast number of files shouldn't be a headache. At No Limit
        Converter, we've designed a conversion service that eliminates the common
        restrictions you face elsewhere. Say goodbye to limitations on file
        numbers and size.
      </p>

      <h2>Why Free?</h2>
      <p>
        No Limit Converter is totally free, so you don't have to worry about the
        cost of converting your files. We're all about accessibility—making sure
        anyone, from any background, can easily and efficiently convert their
        files without any hassle.
      </p>
      <h2>Contributing to Open Source</h2>
      <p>
        Built on the spirit of collaboration, No Limit Converter thrives on
        open-source principles. We invite you to explore, contribute, and
        enhance the platform. By fostering an open-source environment, we aim to
        create a community-driven space where developers collectively refine and
        improve the conversion experience.
      </p>
    </div>
  </div>
</template>
<script>
import Descriptor from "@/components/descriptor.vue";
import { useMeta } from "vue-meta";
export default {
  name: "Home",
  setup() {
    useMeta({
      title: "About Us - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
            "Explore the story of No Limit Converter—a free, hassle-free file conversion service. We break the limitations on file numbers and size for everyone.",
        },
        {
          name: "keywords",
          content: "about no limit converter, free file converter, online file conversion, unlimited file size converter",
        },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "About Us - No Limit Converter" },
        {
          name: "twitter:description",
          content:
            "Explore the story of No Limit Converter—a free, hassle-free file conversion service. We break the limitations on file numbers and size for everyone.",
        },
        // image must be an absolute path
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        // Facebook OpenGraph
        { property: "og:title", content: "About Us - No Limit Converter" },
        { property: "og:site_name", content: "No Limit Converter" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:description",
          content:
            "Explore the story of No Limit Converter—a free, hassle-free file conversion service. We break the limitations on file numbers and size for everyone.",
        },
      ],
      link: [
        {
          rel: "canonical",
          href: "https://nolimitconverter.com/about",
        },
      ],
      htmlAttrs: { lang: "en", amp: true },
    });
  },

  components: {
    Descriptor,
  },
};
</script>