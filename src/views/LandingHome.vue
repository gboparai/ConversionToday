<template>
  <descriptor>
    <template #header>Free Bulk File Converter Online</template>
    <template #description>
      Bulk convert images, audio, video, documents, archives and fonts — completely free with no restrictions on file size or quantity. No signup required.
    </template>
  </descriptor>

  <section class="mediaSection">
    <h2 class="mediaSection__title">Convert</h2>
    <div class="mediaHub">
      <a class="mediaHub__card" href="/image">
        <span class="mediaHub__icon">🖼️</span>
        <h2>Image Converter</h2>
        <p>Bulk convert JPG, PNG, GIF, WEBP, TIFF, SVG and 50+ image formats. No file size limit.</p>
      </a>
      <a class="mediaHub__card" href="/audio">
        <span class="mediaHub__icon">🎵</span>
        <h2>Audio Converter</h2>
        <p>Batch convert MP3, WAV, FLAC, AAC, OGG, M4A and more. No restrictions on file count or size.</p>
      </a>
      <a class="mediaHub__card" href="/video">
        <span class="mediaHub__icon">🎬</span>
        <h2>Video Converter</h2>
        <p>Convert MP4, WebM, MOV, AVI, MKV and more. No file size limit — even for large 4K videos.</p>
      </a>
      <a class="mediaHub__card" href="/document">
        <span class="mediaHub__icon">📄</span>
        <h2>Document Converter</h2>
        <p>Batch convert DOCX, PDF, Markdown, HTML, EPUB, LaTeX and 60+ document formats for free.</p>
      </a>
      <a class="mediaHub__card" href="/archive">
        <span class="mediaHub__icon">🗜️</span>
        <h2>Archive Converter</h2>
        <p>Convert ZIP, 7Z, RAR, TAR, TAR.GZ, TAR.BZ2, TAR.XZ and ISO archives — free, no size limits.</p>
      </a>
      <a class="mediaHub__card" href="/font">
        <span class="mediaHub__icon">🔤</span>
        <h2>Font Converter</h2>
        <p>Convert TTF, OTF, WOFF, WOFF2, EOT and SVG fonts online. Batch convert for web and desktop.</p>
      </a>
    </div>
  </section>

  <section class="mediaSection">
    <h2 class="mediaSection__title">Tools</h2>
    <div class="mediaHub">
      <a class="mediaHub__card" href="/compression">
        <span class="mediaHub__icon">🧰</span>
        <h2>Image Compression</h2>
        <p>Bulk compress JPG, PNG, WEBP and AVIF images. No file size limits. Before/after preview included.</p>
      </a>
      <a class="mediaHub__card" href="/compress">
        <span class="mediaHub__icon">🗃️</span>
        <h2>Archive Compress Tool</h2>
        <p>Pack hundreds of files into one ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ or ISO archive.</p>
      </a>
      <a class="mediaHub__card" href="/merge">
        <span class="mediaHub__icon">🧩</span>
        <h2>File Merge Tool</h2>
        <p>Combine audio, video, archive and document files into a single output. Free, no size limits.</p>
      </a>
      <a class="mediaHub__card" href="/pdf-image">
        <span class="mediaHub__icon">📑</span>
        <h2>PDF ↔ Image Tool</h2>
        <p>Extract every PDF page as an image, or combine unlimited images into one PDF. Free, no restrictions.</p>
      </a>
      <a class="mediaHub__card" href="/ocr">
        <span class="mediaHub__icon">🔍</span>
        <h2>OCR Text Extraction</h2>
        <p>Extract text from images and PDFs in bulk. 30+ languages. Export to DOCX, XLSX, TXT, CSV and more.</p>
      </a>
    </div>
  </section>

  <div class="infomationContainer">
    <information>
      <template #header>No File Size Limits</template>
      <template #description>
        Convert files of any size — large 4K videos, high-resolution images, hefty reports — with absolutely zero restrictions. No paid tier required.
      </template>
    </information>
    <information>
      <template #header>Bulk Convert Hundreds of Files</template>
      <template #description>
        Drop an entire folder at once and convert everything in a single batch. Download individually or grab a ZIP of all your converted files.
      </template>
    </information>
    <information>
      <template #header>100% Free, No Signup Required</template>
      <template #description>
        Every tool on No Limit Converter is completely free. No account, no email address, no credit card — just open and convert.
      </template>
    </information>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>Your Files Stay Private</template>
      <template #description>
        Files are processed directly in your browser and never sent to any server. You keep full control of your data at all times.
      </template>
    </information>
    <information>
      <template #header>2,500+ Conversion Pairs</template>
      <template #description>
        Image, audio, video, document, archive and font conversions — over 2,500 format combinations across all tools, all free.
      </template>
    </information>
    <information>
      <template #header>Works on Any Device</template>
      <template #description>
        No software to install. Works on Windows, Mac, Linux, iOS and Android. Open your browser and start converting instantly.
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
      title: "Free Bulk File Converter Online - No Limit Converter",
      meta: [
        {
          name: "description",
          content:
             "Bulk convert images, audio, video, documents, archives and fonts for free. No file size limits, no restrictions, no signups. Convert hundreds of files at once with No Limit Converter.",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Free Bulk File Converter Online - No Limit Converter",
        },
        {
          name: "twitter:description",
          content:
             "Bulk convert images, audio, video, documents, archives and fonts for free. No file size limits, no restrictions, no signups. Convert hundreds of files at once.",
        },
        {
          name: "twitter:image",
          content: "https://nolimitconverter.com/img/logo-conversion-today.png",
        },
        {
          property: "og:title",
          content: "Free Bulk File Converter Online - No Limit Converter",
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
             "Bulk convert images, audio, video, documents, archives and fonts for free. No file size limits, no restrictions, no signups. Convert hundreds of files at once.",
        },
      ],
      link: [
        {
          rel: "canonical",
          href: "https://nolimitconverter.com",
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
