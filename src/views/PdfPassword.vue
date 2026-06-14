<template>
  <descriptor>
    <template #header>Free PDF Password Tool — Protect &amp; Unlock PDFs Online</template>
    <template #description>
      Add a password to any PDF to protect it, or remove the password from a PDF you already have the key for. Completely free, no file size limit, no upload — runs entirely in your browser.
    </template>
  </descriptor>

  <!-- Mode tabs -->
  <div class="familySelector">
    <button
      id="pdf-password-tab-protect"
      class="familySelector__button"
      :class="{ 'familySelector__button--active': mode === 'protect' }"
      type="button"
      @click="switchMode('protect')"
    >
      Protect PDF
    </button>
    <button
      id="pdf-password-tab-unlock"
      class="familySelector__button"
      :class="{ 'familySelector__button--active': mode === 'unlock' }"
      type="button"
      @click="switchMode('unlock')"
    >
      Unlock PDF
    </button>
  </div>

  <file-picker
    :disabled="!!pdfFile"
    :filter-fn="filterPdfFiles"
    fallback-accept=".pdf,application/pdf"
    :label="mode === 'protect' ? 'a PDF' : 'a Password-Protected PDF'"
    :overlay-text="mode === 'protect' ? 'Drop to Protect' : 'Drop to Unlock'"
    @files-selected="handleFilesSelected"
  />

  <p v-if="pdfFile" class="fileInput__notice">
    One PDF is already loaded. Remove it to load a different file.
  </p>



  <!-- Password fields -->
  <div class="settingsBar">
    <div class="settingsCard">
      <div class="settingsCard__item">
        <span class="settingsCard__label">
          {{ mode === 'protect' ? 'Set Password' : 'Enter PDF Password' }}
        </span>
        <div class="passwordWrap">
          <input
            id="pdf-password-input"
            class="passwordWrap__input"
            :type="showPassword ? 'text' : 'password'"
            v-model="userPassword"
            :placeholder="mode === 'protect' ? 'Enter a password to protect the PDF' : 'Enter the PDF password to unlock it'"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="passwordWrap__toggle"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <!-- Eye open -->
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            <!-- Eye off -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
          </button>
        </div>
      </div>

      <!-- Owner password (protect mode only) -->
      <div v-if="mode === 'protect'" class="settingsCard__item">
        <button type="button" class="advancedToggle" @click="showAdvanced = !showAdvanced">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" :style="{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          Advanced — Set Owner Password
        </button>
        <template v-if="showAdvanced">
          <div class="passwordWrap" style="margin-top: 0.5rem;">
            <input
              id="pdf-owner-password"
              class="passwordWrap__input"
              :type="showOwnerPassword ? 'text' : 'password'"
              v-model="ownerPassword"
              placeholder="Owner password (controls editing/printing permissions)"
              autocomplete="new-password"
            />
            <button type="button" class="passwordWrap__toggle" @click="showOwnerPassword = !showOwnerPassword" aria-label="Toggle owner password visibility">
              <svg v-if="!showOwnerPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
            </button>
          </div>
          <p class="settingsCard__hint">If left blank, the user password is used as the owner password.</p>
        </template>
      </div>
    </div>
  </div>

  <div class="batchBar">
    <button class="batchBar__button" :disabled="!canProcess" @click="process">
      <div>{{ mode === 'protect' ? 'Protect PDF' : 'Unlock PDF' }}</div>
    </button>
    <button class="batchBar__button" :disabled="!canClear" @click="clearAll">
      <div>Clear</div>
    </button>
  </div>



  <!-- Processing indicator -->
  <div v-if="isProcessing" class="progressCard">
    <div class="progressCard__top">
      <strong>{{ mode === 'protect' ? 'Encrypting PDF…' : 'Decrypting PDF…' }}</strong>
    </div>
    <div class="progressBar">
      <div class="progressBar__fill progressBar__fill--indeterminate"></div>
    </div>
  </div>

  <!-- Error state -->
  <error-card 
    :show="hasError" 
    :title="mode === 'unlock' ? 'Incorrect Password or Unsupported Encryption' : 'Error'" 
    :message="errorMessage" 
  />

  <!-- Download card -->
  <div v-if="outputUrl" class="downloadCard">
    <div>
      <strong>{{ outputName }}</strong>
      <p>{{ mode === 'protect' ? 'Your PDF is now password protected.' : 'The password has been removed.' }}</p>
    </div>
    <a :href="outputUrl" :download="outputName">Download</a>
  </div>

  <div class="files" v-if="pdfFile">
    <div class="fileRow">
      <div class="fileRow__copy">
        <div class="fileRow__name">{{ pdfFile.name }}</div>
      </div>
      <button
        class="iconButton iconButton--remove"
        type="button"
        :disabled="isProcessing"
        @click="clearAll"
        title="Remove"
        aria-label="Remove file"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    </div>
  </div>

  <div class="informationContainer">
    <information>
      <template #header>{{ mode === 'protect' ? 'Protect Sensitive PDFs' : 'Remove PDF Passwords' }}</template>
      <template #description>
        {{ mode === 'protect'
          ? 'Add RC4 128-bit encryption to any PDF to prevent unauthorised access. Ideal for contracts, invoices, and private documents.'
          : 'If you know the password for a PDF, you can permanently remove it to create an unlocked copy for easier access.' }}
      </template>
    </information>
    <information>
      <template #header>No Upload — 100% Private</template>
      <template #description>
        Your PDF and your passwords are never sent to any server. All encryption and decryption happens locally in your browser. Your private data stays private.
      </template>
    </information>
    <information>
      <template #header>Free &amp; Unlimited</template>
      <template #description>
        No file size limits, no daily caps, no account needed. Protect or unlock as many PDFs as you need, completely free.
      </template>
    </information>
  </div>

  <div class="faqSection">
    <h3 class="faqSection__title">PDF Password FAQ</h3>
    <faq :faqs="faqs" @toggle="toggleFaq" />
  </div>
</template>

<script>
import Descriptor from '@/components/descriptor.vue';
import Information from '@/components/information.vue';
import Faq from '@/components/faq.vue';
import ErrorCard from '@/components/errorCard.vue';
import { useMeta } from 'vue-meta';

import FilePicker from '@/components/file-picker.vue';
import PdfWorker from "worker-loader!@/js/pdf-worker";

export default {
  name: 'PdfPassword',
  components: { FilePicker, Descriptor, Information, Faq, ErrorCard },

  data() {
    useMeta({
      title: 'Free PDF Password Tool — Protect & Unlock PDFs Online | No Limit Converter',
      meta: [
        {
          name: 'description',
          content: 'Add a password to any PDF to protect it, or remove a PDF password you already know. Free, private, browser-based. No file size limit, no signup, no upload.',
        },
        {
          name: 'keywords',
          content: 'pdf password protector, protect pdf online, unlock pdf online, remove pdf password, pdf encrypt, free pdf security tool',
        },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Free PDF Password Tool — Protect & Unlock PDFs | No Limit Converter' },
        { name: 'twitter:description', content: 'Protect a PDF with a password or unlock one you know the key to. Free, private, in-browser.' },
        { property: 'og:title', content: 'Free PDF Password Tool — Protect & Unlock PDFs Online | No Limit Converter' },
        { property: 'og:site_name', content: 'No Limit Converter' },
        { property: 'og:type', content: 'website' },
        { property: 'og:description', content: 'Add or remove PDF passwords for free in your browser. No file size limit, no signup required.' },
      ],
      link: [{ rel: 'canonical', href: 'https://nolimitconverter.com/pdf-password' }],
      htmlAttrs: { lang: 'en', amp: true },
    });

    return {
      pdfWorker: null,
      mode: 'protect',
      pdfFile: null,
      userPassword: '',
      ownerPassword: '',
      showPassword: false,
      showOwnerPassword: false,
      showAdvanced: false,
      isProcessing: false,
      hasError: false,
      errorMessage: '',
      outputUrl: null,
      outputName: null,
      outputBlob: null,
      faqs: [
        {
          question: 'How do I password-protect a PDF?',
          answer: 'Select the "Protect PDF" tab, upload your PDF, enter a password and click "Protect PDF". The encrypted PDF will be ready to download immediately.',
          open: false,
        },
        {
          question: 'How do I unlock / remove a password from a PDF?',
          answer: 'Select the "Unlock PDF" tab, upload your password-protected PDF, enter the correct password and click "Unlock PDF". The decrypted PDF will be ready to download.',
          open: false,
        },
        {
          question: 'What happens if I enter the wrong password to unlock?',
          answer: 'You will see a clear error message. The tool never corrupts your original file — it simply reports that the password was incorrect.',
          open: false,
        },
        {
          question: 'What encryption standard is used?',
          answer: 'Password protection uses RC4 128-bit encryption, which is the standard format supported by all major PDF viewers including Adobe Acrobat, Preview, and browser PDF viewers.',
          open: false,
        },
        {
          question: 'Is it safe to enter my PDF password here?',
          answer: 'Yes. Everything runs locally in your browser. Your password and your PDF are never sent to any server. You can even use this tool offline once the page has loaded.',
          open: false,
        },
        {
          question: 'What is the owner password?',
          answer: 'The owner password (available under "Advanced") controls permissions like editing and printing, separate from the open password. Most users only need the standard user password.',
          open: false,
        },
      ],
    };
  },

  computed: {
    canProcess() {
      return !!this.pdfFile && this.userPassword.trim().length > 0 && !this.isProcessing;
    },
    canClear() {
      return (!!this.pdfFile || !!this.outputUrl) && !this.isProcessing;
    },
  },

  mounted() {
    this.pdfWorker = new PdfWorker();
  },

  beforeUnmount() {
    this.revokeOutput();
    if (this.pdfWorker) {
      this.pdfWorker.terminate();
    }
  },

  methods: {
    revokeOutput() {
      if (this.outputUrl) URL.revokeObjectURL(this.outputUrl);
    },

    switchMode(newMode) {
      if (this.mode === newMode) return;
      this.mode = newMode;
      this.clearAll();
    },

    filterPdfFiles(fileList) {
      const accepted = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'pdf' || file.type === 'application/pdf') {
          accepted.push(file);
        }
      }
      return accepted;
    },

    handleFilesSelected(accepted) {
      if (this.pdfFile) return;
      if (accepted.length > 0) {
        this.loadFile(accepted[0]);
      }
    },

    loadFile(file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext !== 'pdf' && file.type !== 'application/pdf') {
        this.hasError = true;
        this.errorMessage = `"${file.name}" is not a PDF file. Please select a .pdf file.`;
        return;
      }
      this.hasError = false;
      this.errorMessage = '';
      this.revokeOutput();
      this.outputUrl = null;
      this.outputName = null;
      this.pdfFile = file;
    },

    async process() {
      if (this.mode === 'protect') {
        await this.protectPdf();
      } else {
        await this.unlockPdf();
      }
    },

    async protectPdf() {
      this.isProcessing = true;
      this.hasError = false;
      this.revokeOutput();
      this.outputUrl = null;
      this.outputName = null;

      try {
        const bytes = await this.pdfFile.arrayBuffer();
        const userPassword = this.userPassword.trim();
        const ownerPassword = this.showAdvanced ? this.ownerPassword.trim() : userPassword;
        const baseName = this.pdfFile.name.replace(/\.pdf$/i, '');
        const id = Math.random().toString(36).substring(7);

        const encryptedBytes = await new Promise((resolve, reject) => {
          const handler = (e) => {
            if (e.data.id === id) {
              if (e.data.status === 'done') {
                this.pdfWorker.removeEventListener('message', handler);
                resolve(e.data.buffer);
              } else if (e.data.status === 'error') {
                this.pdfWorker.removeEventListener('message', handler);
                reject(new Error(e.data.error));
              }
            }
          };
          this.pdfWorker.addEventListener('message', handler);
          this.pdfWorker.postMessage({
            id,
            type: 'encrypt',
            buffer: bytes,
            userPassword,
            ownerPassword
          }, [bytes]);
        });

        const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
        this.outputBlob = blob;
        this.outputUrl = URL.createObjectURL(blob);
        this.outputName = `${baseName}-protected.pdf`;
      } catch (err) {
        this.hasError = true;
        this.errorMessage = err.message || 'Failed to encrypt the PDF. The file may already be encrypted or corrupted.';
      } finally {
        this.isProcessing = false;
      }
    },

    async unlockPdf() {
      this.isProcessing = true;
      this.hasError = false;
      this.revokeOutput();
      this.outputUrl = null;
      this.outputName = null;

      try {
        const bytes = await this.pdfFile.arrayBuffer();
        const password = this.userPassword.trim();
        const baseName = this.pdfFile.name.replace(/\.pdf$/i, '');
        const id = Math.random().toString(36).substring(7);

        const decryptedBytes = await new Promise((resolve, reject) => {
          const handler = (e) => {
            if (e.data.id === id) {
              if (e.data.status === 'done') {
                this.pdfWorker.removeEventListener('message', handler);
                resolve(e.data.buffer);
              } else if (e.data.status === 'error') {
                this.pdfWorker.removeEventListener('message', handler);
                reject(new Error(e.data.error));
              }
            }
          };
          this.pdfWorker.addEventListener('message', handler);
          this.pdfWorker.postMessage({
            id,
            type: 'decrypt',
            buffer: bytes,
            userPassword: password
          }, [bytes]);
        });

        const blob = new Blob([decryptedBytes], { type: 'application/pdf' });
        this.outputBlob = blob;
        this.outputUrl = URL.createObjectURL(blob);
        this.outputName = `${baseName}-unlocked.pdf`;
      } catch (err) {
        this.hasError = true;
        const msg = (err.message || '').toLowerCase();
        if (msg.includes('password') || msg.includes('decrypt') || msg.includes('incorrect') || msg.includes('wrong')) {
          this.errorMessage = 'Incorrect password. Please check the password and try again.';
        } else {
          this.errorMessage = err.message || 'Failed to decrypt the PDF. The password may be incorrect, or the encryption standard is not supported.';
        }
      } finally {
        this.isProcessing = false;
      }
    },

    clearAll() {
      this.revokeOutput();
      this.pdfFile = null;
      this.userPassword = '';
      this.ownerPassword = '';
      this.showPassword = false;
      this.showOwnerPassword = false;
      this.showAdvanced = false;
      this.isProcessing = false;
      this.hasError = false;
      this.errorMessage = '';
      this.outputUrl = null;
      this.outputName = null;
      this.outputBlob = null;
    },

    toggleFaq(index) {
      this.faqs[index].open = !this.faqs[index].open;
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/styles/_utilities";

.familySelector {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 1rem;

  &__button {
    padding: 0.55rem 0.95rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-weight: 700;
    cursor: pointer;
    font-size: 0.9rem;
    font-family: inherit;
    transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s, background-color 0.15s;

    &:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    &--active {
      background-color: var(--accent);
      border-color: var(--accent);
      color: var(--accent-text, #fff);
      cursor: default;
      transform: none;
      box-shadow: none;
    }
  }
}

.fileInput {
  @include mid-width;
  display: block;
  height: 9rem;
  margin-bottom: 0.5rem;
  position: relative;
  cursor: pointer;
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);

  > .file {
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
    border-radius: $default-radius;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-surface);
    border: 2px dashed var(--border);
    color: var(--text-secondary);
    font-size: 1rem;
    font-weight: 700;
    text-align: center;
  }
  &:hover > .file {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
    color: var(--text-primary);
  }
  &:active > .file {
    transform: translateY(0);
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
    box-shadow: 0 0 0 2px var(--border-focus);
  }

  &--disabled {
    pointer-events: none;
    cursor: not-allowed;

    > .file {
      opacity: 0.5;
    }
  }

  &__notice {
    @include mid-width;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
}

.settingsBar {
  @include mid-width;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.settingsCard {
  padding: 1.25rem 1.5rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  &__label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__hint {
    margin: 0.35rem 0 0;
    color: var(--text-secondary);
    font-size: 0.8rem;
  }
}

.passwordWrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: $default-radius;
  background-color: var(--bg-primary);
  transition: border-color 0.15s;

  &:focus-within {
    border-color: var(--accent);
  }

  &__input {
    flex: 1;
    padding: 0.55rem 0.75rem;
    border: none;
    background: none;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    transition: color 0.15s;

    svg {
      width: 1.15rem;
      height: 1.15rem;
      fill: currentColor;
    }

    &:hover {
      color: var(--text-primary);
    }
  }
}

.advancedToggle {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 0;

  svg {
    width: 1rem;
    height: 1rem;
    fill: currentColor;
    flex-shrink: 0;
  }
}

.batchBar {
  @include mid-width;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.25rem;

  &__button {
    flex: 1;
    min-width: 120px;
    border: none;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: $default-radius;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0;
    cursor: pointer;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: var(--shadow-sm);

    > div {
      background-color: var(--bg-secondary);
      padding: 0.55rem 1rem;
      border-radius: $default-radius;
      height: 100%;
      transition: background-color 0.15s, transform 0.15s;
    }

    &[disabled] {
      cursor: not-allowed;
      opacity: 0.4;
    }
    &:not([disabled]):hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-md);
      > div {
        background-color: var(--bg-surface-hover);
        transform: translateY(-2px);
      }
    }
    &:not([disabled]):active > div {
      transform: translateY(0);
    }
  }
}

.progressCard,
.downloadCard {
  @include mid-width;
  margin-bottom: 1rem;
  padding: 1rem 1.15rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
}

.progressCard {
  &__top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }
}

.progressBar {
  height: 0.55rem;
  border-radius: 999px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.08);

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e 0%, #06b6d4 100%);
    transition: width 0.2s ease;
  }

  &__fill--indeterminate {
    width: 40%;
    animation: indeterminate 1.2s ease-in-out infinite;
  }
}

@keyframes indeterminate {
  0%   { transform: translateX(-150%); }
  100% { transform: translateX(350%); }
}

.downloadCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  p {
    margin: 0.35rem 0 0;
    color: var(--text-secondary);
  }

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 7.5rem;
    padding: 0.65rem 1rem;
    border-radius: $default-radius;
    background-color: var(--accent);
    color: var(--accent-text, #fff);
    text-decoration: none;
    font-weight: 800;
  }
}

.files {
  @include mid-width;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-bottom: 1.5rem;
}

.fileRow {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.8rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;

  &__copy {
    flex: 1;
    min-width: 0;
  }

  &__name {
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.iconButton {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
  }

  &--remove {
    background: var(--negative);
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not([disabled]):hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

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

@media only screen and (max-width: 55rem) {
  .downloadCard {
    flex-direction: column;
    align-items: flex-start;

    a { width: 100%; }
  }
}
</style>
