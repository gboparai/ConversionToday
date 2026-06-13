<template>
  <nav id="nav">
    <div class="nav__links">
      <router-link to="/" exact-active-class="router-link-active">Home</router-link>

      <div
        class="navDropdown"
        :class="{ 'is-open': activeDropdown === 'convert' }"
        @mouseenter="openDropdown('convert')"
        @mouseleave="closeDropdown('convert')"
        @focusin="openDropdown('convert')"
        @focusout="handleDropdownFocusOut($event, 'convert')"
      >
        <button type="button" class="navDropdown__trigger">Convert</button>
        <div class="navDropdown__menu" @click="closeAllDropdowns">
          <router-link to="/image">Image</router-link>
          <router-link to="/audio">Audio</router-link>
          <router-link to="/video">Video</router-link>
          <router-link to="/document">Document</router-link>
          <router-link to="/archive">Archive</router-link>
          <router-link to="/font">Font</router-link>
          <router-link to="/subtitle">Subtitle</router-link>
        </div>
      </div>

      <div
        class="navDropdown"
        :class="{ 'is-open': activeDropdown === 'tools' }"
        @mouseenter="openDropdown('tools')"
        @mouseleave="closeDropdown('tools')"
        @focusin="openDropdown('tools')"
        @focusout="handleDropdownFocusOut($event, 'tools')"
      >
        <button type="button" class="navDropdown__trigger">Tools</button>
        <div class="navDropdown__menu" @click="closeAllDropdowns">
          <router-link to="/compression">Compression</router-link>
          <router-link to="/compress">Archive Compress</router-link>
          <router-link to="/merge">Merge</router-link>
          <router-link to="/pdf-image">PDF ↔ Image</router-link>
          <router-link to="/pdf-split">PDF Splitter</router-link>
          <router-link to="/pdf-password">PDF Password</router-link>
          <router-link to="/ocr">OCR</router-link>
        </div>
      </div>

      <router-link to="/about">About</router-link>
      <router-link to="/FAQ">FAQ</router-link>
      <a
        :href="resolvedGithubUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub Repository"
      >GitHub</a>
    </div>
    <button
      class="theme-toggle"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleTheme"
    >
      <span v-if="isDark">☀️</span>
      <span v-else>🌙</span>
    </button>
  </nav>
  <metainfo>
    <template v-slot:title="{ content }">{{
      content ? `${content}` : `No Limit Converter`
    }}</template>
  </metainfo>
  <img
    height="212"
    width="350"
    class="logo"
    alt="no limit converter logo"
    :src="logoSrc"
  />

  <router-view />
  <!-- GitHub Corner -->
  <github-corners
    fixed
    bottom
    :zIndex="2000"
    target="_blank"
    :href="resolvedGithubUrl"
    :bgColor="cornerBgColor"
    :color="cornerColor"
    :position="cornerPosition"
  />
</template>
<style lang="scss">
@import "src/styles/_normalize";
@import "src/styles/_utilities";

* {
  box-sizing: border-box;
  transition: 0.6s ease, color 0s, background-color 0s, padding 0s, margin 0s;
  position: relative;
}
*:focus {
  transition: 0.1s ease;
  outline: none;
  box-shadow: 0 0 0 2px var(--border-focus);
}
body {
  font-family: "Franklin Gothic", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  margin: 0;
  padding: 0;
  min-height: 100vh;
  overflow-y: scroll;
  padding-bottom: 3rem;
}
a {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 700;
  outline: none;
}

/* ── Navigation ─────────────────────────────────────────────────────────── */
#nav {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  padding: 0 2rem;
  height: 3.5rem;
  background-color: var(--nav-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  .nav__links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-right: auto;

    a {
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.25rem 0;
      border-bottom: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s;

      &:hover,
      &.router-link-active {
        color: var(--text-primary);
        border-bottom-color: var(--accent);
      }
    }

    .navDropdown {
      position: relative;

      &__trigger {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-weight: 600;
        font-size: 0.9rem;
        font-family: inherit;
        padding: 0.25rem 0;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        text-decoration: none;
        transition: color 0.15s, border-color 0.15s;

        &:hover {
          color: var(--text-primary);
          border-bottom-color: var(--accent);
        }
      }

      &.is-open > .navDropdown__trigger {
        color: var(--text-primary);
        border-bottom-color: var(--accent);
      }

      &__menu {
        position: absolute;
        top: 100%;
        left: 0;
        min-width: 10rem;
        background-color: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: $default-radius;
        box-shadow: var(--shadow-md);
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        z-index: 150;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(4px);
        transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;

        a {
          padding: 0.45rem 0.6rem;
          border-radius: calc(#{$default-radius} - 2px);
          border-bottom: none;

          &:hover,
          &.router-link-active {
            background-color: var(--bg-surface-hover);
            border-bottom: none;
          }
        }
      }

      &.is-open > .navDropdown__menu {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0);
      }
    }
  }
}

.theme-toggle {
  background: none;
  border: 1px solid var(--border);
  border-radius: 2rem;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  color: var(--text-primary);
  transition: border-color 0.15s, background-color 0.15s;

  &:hover {
    background-color: var(--bg-surface-hover);
    border-color: var(--accent);
  }
  &:focus {
    box-shadow: var(--shadow-focus);
    outline: none;
  }
}

/* ── Logo ────────────────────────────────────────────────────────────────── */
.logo {
  display: block;
  margin: 2rem auto 0;
  width: 300px;
  max-width: 85vw;
  padding: 0 20px;
  height: auto;
}

/* ── Transitions ─────────────────────────────────────────────────────────── */
.fadeEnterActive,
.fadeLeaveActive {
  transition: opacity 0.2s ease;
}
.fadeEnterFrom,
.fadeLeaveTo {
  opacity: 0;
}

/* ── Layout helpers ──────────────────────────────────────────────────────── */
@media only screen and (max-width: 55rem) {
  body {
    padding: 0 0 1.5rem;
  }
  #nav {
    padding: 0 1rem;
    height: auto;
    min-height: 3.5rem;
    .nav__links {
      flex-wrap: wrap;
      gap: 1rem;

      .navDropdown {
        &__menu {
          left: auto;
          right: 0;
        }
      }
    }
  }
}
.informationBar {
  display: flex;
  max-width: 55rem;
  margin: auto;
  margin-bottom: 2rem;
  gap: 1.25rem;
}
.informationBar > * {
  flex: 1;
}
.informationContainer,
.infomationContainer {
  display: flex;
  gap: 1.25rem;
  max-width: 55rem;
  margin: auto;
  margin-bottom: 1.25rem;
  > * {
    flex: 1;
  }
}
@media only screen and (max-width: 55rem) {
  .informationBar,
  .informationContainer,
  .infomationContainer {
    flex-direction: column;
    padding: 0 1.25rem;
    margin-bottom: 0.75rem;
  }
  .fileInput {
    margin-bottom: 1.5rem;
  }
}
</style>
<script>
import { useMeta } from "vue-meta";
import GithubCorners from "@uivjs/vue-github-corners";

export default {
  name: "App",
  components: {
    GithubCorners,
  },
  data() {
    return {
      githubUrl: process.env.VUE_APP_GITHUB_URL,
      cornerBgColor: "#1f2937",
      cornerColor: "#ffffff",
      cornerPosition: "right",
      isDark: true,
      activeDropdown: null,
    };
  },
  setup() {
    useMeta({
      title: "",
      htmlAttrs: { lang: "en", amp: true },
    });
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark;
      document.documentElement.setAttribute(
        "data-theme",
        this.isDark ? "dark" : "light"
      );
      localStorage.setItem("ct-theme", this.isDark ? "dark" : "light");
    },
    applyStoredTheme() {
      const stored = localStorage.getItem("ct-theme");
      const prefersDark =
        stored === "dark" ||
        (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
      this.isDark = prefersDark;
      document.documentElement.setAttribute(
        "data-theme",
        prefersDark ? "dark" : "light"
      );
    },
    openDropdown(name) {
      this.activeDropdown = name;
    },
    closeDropdown(name) {
      if (this.activeDropdown === name) this.activeDropdown = null;
    },
    handleDropdownFocusOut(event, name) {
      const nextTarget = event.relatedTarget;
      if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
        this.closeDropdown(name);
      }
    },
    closeAllDropdowns() {
      this.activeDropdown = null;
    },
  },
  computed: {
    resolvedGithubUrl() {
      return this.githubUrl || "https://github.com";
    },
    logoSrc() {
      return this.isDark
        ? "/img/logo-conversion-today-3.webp"
        : "/img/logo-conversion-today-3-dark.png";
    },
  },
  mounted() {
    this.applyStoredTheme();
    document.dispatchEvent(new Event("render-event"));
  },
};
</script>
