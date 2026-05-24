<template>
  <descriptor>
    <template #header>Free File Converter</template>
    <template #description>
      Convert images, audio, video, documents and archives locally in your browser with no uploads,
      no limits and no waiting for a server.
    </template>
  </descriptor>

  <section class="mediaSection">
    <h2 class="mediaSection__title">Convert</h2>
    <div class="mediaHub">
      <a class="mediaHub__card" href="/image">
        <span class="mediaHub__icon">🖼️</span>
        <h2>Image Converter</h2>
        <p>Convert JPG, PNG, GIF, WEBP, TIFF, SVG and many more image formats.</p>
      </a>
      <a class="mediaHub__card" href="/audio">
        <span class="mediaHub__icon">🎵</span>
        <h2>Audio Converter</h2>
        <p>Convert MP3, WAV, OGG, FLAC, AAC, M4A, Opus and more in-browser.</p>
      </a>
      <a class="mediaHub__card" href="/video">
        <span class="mediaHub__icon">🎬</span>
        <h2>Video Converter</h2>
        <p>Convert MP4, WebM, MOV, AVI, MKV and other common video formats.</p>
      </a>
      <a class="mediaHub__card" href="/document">
        <span class="mediaHub__icon">📄</span>
        <h2>Document Converter</h2>
        <p>Convert Markdown, HTML, DOCX, ODT, LaTeX, EPUB, RST, Org-mode and 30+ more document formats.</p>
      </a>
      <a class="mediaHub__card" href="/archive">
        <span class="mediaHub__icon">🗜️</span>
        <h2>Archive Converter</h2>
        <p>Convert ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO archives in-browser.</p>
      </a>
      <a class="mediaHub__card" href="/font">
        <span class="mediaHub__icon">🔤</span>
        <h2>Font Converter</h2>
        <p>Convert TTF, OTF, WOFF, WOFF2, EOT and SVG fonts directly in your browser.</p>
      </a>
    </div>
  </section>

  <section class="mediaSection">
    <h2 class="mediaSection__title">Tools</h2>
    <div class="mediaHub">
      <a class="mediaHub__card" href="/compression">
        <span class="mediaHub__icon">🧰</span>
        <h2>Image Compression</h2>
        <p>Compress JPG, PNG, WEBP and AVIF files locally with before/after preview.</p>
      </a>
      <a class="mediaHub__card" href="/compress">
        <span class="mediaHub__icon">🗃️</span>
        <h2>Archive Compress Tool</h2>
        <p>Combine multiple files into one ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ or ISO archive.</p>
      </a>
      <a class="mediaHub__card" href="/merge">
        <span class="mediaHub__icon">🧩</span>
        <h2>File Merge Tool</h2>
        <p>Merge audio, video, archive and supported document files into one downloadable output.</p>
      </a>
      <a class="mediaHub__card" href="/ocr">
        <span class="mediaHub__icon">🔍</span>
        <h2>OCR Tool</h2>
        <p>Extract text from images and PDFs using Tesseract OCR. Export as TXT, DOCX, PDF, XLSX, CSV, EPUB and more.</p>
      </a>
    </div>
  </section>

  <div class="infomationContainer">
    <information>
      <template #header>All Local</template>
      <template #description>
        Files stay on your device. Processing happens in your browser instead
        of on a remote server.
      </template>
    </information>
    <information>
      <template #header>No Limits</template>
      <template #description>
        Convert as many files as you need without signups, file caps or daily
        quotas.
      </template>
    </information>
    <information>
      <template #header>Fast Setup</template>
      <template #description>
        Pick a media type, choose your target format and start converting in a
        few clicks.
      </template>
    </information>
  </div>
</template>

<script>
import Descriptor from "@/components/descriptor.vue";
import Information from "@/components/information.vue";
import { useMeta } from "vue-meta";

export default {
  name: "LandingHome",
  components: {
    Descriptor,
    Information,
  },
  setup() {
    useMeta({
      title: "Free File Converter - Conversion Today",
      meta: [
        {
          name: "description",
          content:
             "Convert image, audio, video, document, archive and font files online for free with local browser-based processing. No uploads, limits or signups.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free File Converter - Conversion Today",
        },
        {
          name: "twitter:description",
          content:
             "Convert image, audio, video, document, archive and font files online for free with local browser-based processing. No uploads, limits or signups.",
        },
        {
          name: "twitter:image",
          content: "https://conversiontoday.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free File Converter - Conversion Today",
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
             "Convert image, audio, video, document, archive and font files online for free with local browser-based processing. No uploads, limits or signups.",
        },
      ],
      link: [
        {
          rel: "canonical",
          href: "https://conversiontoday.com",
        },
      ],
      htmlAttrs: { lang: "en", amp: true },
    });
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.mediaHub {
  @include mid-width;
  display: grid;
  // 12.5rem keeps cards readable while allowing auto-fit wrapping across viewports.
  grid-template-columns: repeat(auto-fit, minmax(12.5rem, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  &__card {
    display: block;
    padding: 1.4rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    box-shadow: var(--shadow-sm);
    color: var(--text-primary);
    text-decoration: none;
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;

    &:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
      border-color: var(--accent);
    }

    h2 {
      margin: 0 0 0.55rem;
      font-size: 1.15rem;
    }

    p {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  }

  &__icon {
    display: inline-block;
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
}

.mediaSection {
  margin-bottom: 1rem;

  &__title {
    @include mid-width;
    margin: 0 auto 0.8rem;
    font-size: 1.25rem;
    color: var(--text-primary);
  }
}

@media only screen and (max-width: 90rem) {
  .mediaHub {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media only screen and (max-width: 55rem) {
  .mediaHub {
    grid-template-columns: 1fr;
    padding: 0 1.25rem;
  }

  .mediaSection__title {
    padding: 0 1.25rem;
  }
}
</style>
