<template>
  <nav id="nav">
    <div class="nav__left">
      <router-link to="/" class="nav__brand">Conversion Today</router-link>
    </div>
    <div class="nav__links">
      <router-link to="/">Home</router-link>
      <router-link to="/About">About</router-link>
      <router-link to="/FAQ">FAQ</router-link>
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
      content ? `${content}` : `Conversion Today`
    }}</template>
  </metainfo>
  <img
    height="212"
    width="350"
    class="logo"
    alt="conversion today logo"
    src="/img/logo-conversion-today-3.webp"
  />

  <router-view />
  <!-- GitHub Corner -->
  <github-corners
    fixed
    target="__blank"
    :href="githubUrl"
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
  justify-content: space-between;
  padding: 0 2rem;
  height: 3.5rem;
  background-color: var(--nav-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;

  .nav__brand {
    font-size: 1.1rem;
    font-weight: 900;
    color: var(--accent);
    letter-spacing: 0.02em;
  }

  .nav__links {
    display: flex;
    gap: 1.5rem;

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
    .nav__links {
      gap: 1rem;
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
      cornerBgColor: "var(--bg-surface)",
      cornerColor: "var(--text-primary)",
      cornerPosition: "left",
      isDark: true,
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
  },
  mounted() {
    this.applyStoredTheme();
    document.dispatchEvent(new Event("render-event"));
  },
};
</script>