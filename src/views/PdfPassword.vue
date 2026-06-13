<template>
  <descriptor>
    <template #header>Free PDF Password Tool — Protect &amp; Unlock PDFs Online</template>
    <template #description>
      Add a password to any PDF to protect it, or remove the password from a PDF you already have the key for. Completely free, no file size limit, no upload — runs entirely in your browser.
    </template>
  </descriptor>

  <!-- Mode tabs -->
  <div class="modeTabs">
    <button
      id="pdf-password-tab-protect"
      class="modeTabs__tab"
      :class="{ 'modeTabs__tab--active': mode === 'protect' }"
      type="button"
      @click="switchMode('protect')"
    >
      🔒 Protect PDF
    </button>
    <button
      id="pdf-password-tab-unlock"
      class="modeTabs__tab"
      :class="{ 'modeTabs__tab--active': mode === 'unlock' }"
      type="button"
      @click="switchMode('unlock')"
    >
      🔓 Unlock PDF
    </button>
  </div>

  <!-- Drop zone -->
  <label
    class="fileInput"
    :class="{ 'fileInput--disabled': !!pdfFile }"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <input
      type="file"
      accept=".pdf,application/pdf"
      :disabled="!!pdfFile"
      @change="onInputChange"
    />
    <div class="file">
      <p v-if="!pdfFile">Drop a PDF here or click to browse</p>
      <p v-else>{{ pdfFile.name }}</p>
    </div>
  </label>

  <!-- Loaded file row -->
  <div v-if="pdfFile" class="fileRow fileRow--loaded">
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>

  <!-- Password fields -->
  <div class="passwordCard">
    <div class="passwordCard__field">
      <label :for="mode === 'protect' ? 'pdf-user-password' : 'pdf-unlock-password'" class="passwordCard__label">
        {{ mode === 'protect' ? 'Set Password' : 'Enter PDF Password' }}
      </label>
      <div class="passwordCard__inputWrap">
        <input
          :id="mode === 'protect' ? 'pdf-user-password' : 'pdf-unlock-password'"
          class="passwordCard__input"
          :type="showPassword ? 'text' : 'password'"
          v-model="userPassword"
          :placeholder="mode === 'protect' ? 'Enter a password to protect the PDF' : 'Enter the PDF password to unlock it'"
          autocomplete="new-password"
        />
        <button type="button" class="passwordCard__toggle" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
          {{ showPassword ? '🙈' : '👁️' }}
        </button>
      </div>
    </div>

    <!-- Owner password (protect mode only, advanced) -->
    <div v-if="mode === 'protect'" class="passwordCard__field">
      <button type="button" class="passwordCard__advancedToggle" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? '▾' : '▸' }} Advanced — Set Owner Password
      </button>
      <div v-if="showAdvanced" class="passwordCard__inputWrap" style="margin-top: 0.5rem;">
        <input
          id="pdf-owner-password"
          class="passwordCard__input"
          :type="showOwnerPassword ? 'text' : 'password'"
          v-model="ownerPassword"
          placeholder="Owner password (controls editing/printing permissions)"
          autocomplete="new-password"
        />
        <button type="button" class="passwordCard__toggle" @click="showOwnerPassword = !showOwnerPassword" aria-label="Toggle owner password visibility">
          {{ showOwnerPassword ? '🙈' : '👁️' }}
        </button>
      </div>
      <p v-if="showAdvanced" class="passwordCard__hint">
        The owner password restricts editing and printing. If left blank, the user password is used.
      </p>
    </div>
  </div>

  <div class="batchBar">
    <button class="batchBar__button batchBar__button--primary" :disabled="!canProcess" @click="process">
      <div>{{ mode === 'protect' ? '🔒 Protect PDF' : '🔓 Unlock PDF' }}</div>
    </button>
    <button class="batchBar__button" :disabled="!canClear" @click="clearAll">
      <div>Clear</div>
    </button>
  </div>

  <!-- Progress / status -->
  <div v-if="isProcessing" class="progressCard">
    <div class="progressCard__top">
      <strong>{{ mode === 'protect' ? 'Encrypting PDF…' : 'Decrypting PDF…' }}</strong>
    </div>
    <div class="progressBar">
      <div class="progressBar__fill" style="width: 100%; animation: indeterminate 1.2s ease infinite;"></div>
    </div>
  </div>

  <!-- Error state -->
  <div v-if="hasError" class="errorCard">
    <strong>⚠️ {{ mode === 'unlock' ? 'Incorrect Password or Unsupported Encryption' : 'Error' }}</strong>
    <p>{{ errorMessage }}</p>
  </div>

  <!-- Success / download -->
  <div v-if="outputUrl" class="downloadCard">
    <div>
      <strong>{{ outputName }}</strong>
      <p>Your PDF is ready. {{ mode === 'protect' ? 'It is now password protected.' : 'The password has been removed.' }}</p>
    </div>
    <a :href="outputUrl" :download="outputName" class="downloadCard__button">Download</a>
  </div>

  <div class="infomationContainer">
    <information>
      <template #header>{{ mode === 'protect' ? 'Protect Sensitive PDFs' : 'Remove Forgotten Passwords' }}</template>
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
import { PDFDocument } from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { decryptPDF, isEncrypted } from '@pdfsmaller/pdf-decrypt';
import Descriptor from '@/components/descriptor.vue';
import Information from '@/components/information.vue';
import Faq from '@/components/faq.vue';
import { useMeta } from 'vue-meta';

export default {
  name: 'PdfPassword',
  components: { Descriptor, Information, Faq },

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
      mode: this.$route.params.mode === 'unlock' ? 'unlock' : 'protect',
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

  watch: {
    '$route.params.mode'(newMode) {
      const m = newMode === 'unlock' ? 'unlock' : 'protect';
      if (this.mode !== m) this.switchMode(m, false);
    },
  },

  beforeUnmount() {
    this.revokeOutput();
  },

  methods: {
    revokeOutput() {
      if (this.outputUrl) URL.revokeObjectURL(this.outputUrl);
    },

    switchMode(newMode, updateRoute = true) {
      if (this.mode === newMode) return;
      this.mode = newMode;
      this.clearAll();
      if (updateRoute) {
        this.$router.replace(`/pdf-password/${newMode}`);
      }
    },

    onInputChange(event) {
      const file = event.target.files[0];
      event.target.value = '';
      if (file) this.loadFile(file);
    },

    onDragOver(event) {
      event.dataTransfer.dropEffect = this.pdfFile ? 'none' : 'copy';
    },

    onDrop(event) {
      if (this.pdfFile) return;
      const file = event.dataTransfer.files[0];
      if (file) this.loadFile(file);
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
        const bytes = new Uint8Array(await this.pdfFile.arrayBuffer());

        // First load and re-save with pdf-lib to normalize the document
        const pdfDoc = await PDFDocument.load(bytes);
        const cleanBytes = await pdfDoc.save();

        const userPw = this.userPassword.trim();
        const ownerPw = (this.ownerPassword.trim()) || userPw;

        const encryptedBytes = await encryptPDF(cleanBytes, userPw, ownerPw);
        const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const baseName = this.pdfFile.name.replace(/\.pdf$/i, '');

        this.outputBlob = blob;
        this.outputUrl = url;
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
        const bytes = new Uint8Array(await this.pdfFile.arrayBuffer());
        const password = this.userPassword.trim();

        // Check if actually encrypted
        if (!isEncrypted(bytes)) {
          // Not encrypted — just re-save the PDF cleanly as a no-op unlock
          const pdfDoc = await PDFDocument.load(bytes);
          const cleanBytes = await pdfDoc.save();
          const blob = new Blob([cleanBytes], { type: 'application/pdf' });
          const baseName = this.pdfFile.name.replace(/\.pdf$/i, '');
          this.outputBlob = blob;
          this.outputUrl = URL.createObjectURL(blob);
          this.outputName = `${baseName}-unlocked.pdf`;
          return;
        }

        // Decrypt the bytes
        const decryptedBytes = await decryptPDF(bytes, password);

        // Re-save with pdf-lib to strip the encryption dictionary
        const pdfDoc = await PDFDocument.load(decryptedBytes, { ignoreEncryption: true });
        const cleanBytes = await pdfDoc.save();

        const blob = new Blob([cleanBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const baseName = this.pdfFile.name.replace(/\.pdf$/i, '');

        this.outputBlob = blob;
        this.outputUrl = url;
        this.outputName = `${baseName}-unlocked.pdf`;
      } catch (err) {
        this.hasError = true;
        // Distinguish wrong password from other errors
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

.modeTabs {
  @include mid-width;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;

  &__tab {
    flex: 1;
    padding: 0.65rem 1rem;
    border: 1px solid var(--border);
    border-radius: $default-radius;
    background-color: var(--bg-surface);
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s, color 0.15s;

    &:hover {
      border-color: var(--accent);
      color: var(--text-primary);
    }

    &--active {
      border-color: var(--accent);
      background-color: var(--accent);
      color: #fff;
    }
  }
}

.fileInput {
  @include mid-width;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border);
  border-radius: $default-radius;
  padding: 2.5rem 1.5rem;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  margin-bottom: 1rem;

  &:hover {
    border-color: var(--accent);
    background-color: var(--bg-surface);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  input[type='file'] { display: none; }

  .file p {
    margin: 0;
    text-align: center;
    color: var(--text-secondary);
    font-size: 1rem;
  }
}

.fileRow {
  @include mid-width;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  margin-bottom: 1rem;

  &__copy { flex: 1; min-width: 0; }

  &__name {
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.passwordCard {
  @include mid-width;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.4rem;
  }

  &__inputWrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: $default-radius;
    overflow: hidden;
    background-color: var(--bg-primary);

    &:focus-within {
      border-color: var(--accent);
    }
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
    padding: 0 0.65rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    opacity: 0.7;
    transition: opacity 0.15s;

    &:hover { opacity: 1; }
  }

  &__advancedToggle {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }

  &__hint {
    margin: 0.4rem 0 0;
    color: var(--text-secondary);
    font-size: 0.8rem;
  }
}

.batchBar {
  @include mid-width;
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;

  &__button {
    padding: 0.6rem 1.4rem;
    border: 1px solid var(--border);
    border-radius: $default-radius;
    background-color: var(--bg-surface);
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s;

    &:hover:not(:disabled) {
      background-color: var(--bg-surface-hover);
      border-color: var(--accent);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    &--primary:not(:disabled) {
      background-color: var(--accent);
      border-color: var(--accent);
      color: #fff;

      &:hover {
        opacity: 0.9;
        background-color: var(--accent);
      }
    }
  }
}

.progressCard {
  @include mid-width;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  padding: 1.25rem;
  margin-bottom: 1.25rem;

  &__top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.6rem;
    font-size: 0.95rem;
  }
}

.progressBar {
  height: 6px;
  background-color: var(--border);
  border-radius: 3px;
  overflow: hidden;

  &__fill {
    height: 100%;
    background-color: var(--accent);
    border-radius: 3px;
  }
}

@keyframes indeterminate {
  0%   { transform: translateX(-100%); width: 50%; }
  50%  { transform: translateX(100%);  width: 50%; }
  100% { transform: translateX(200%);  width: 50%; }
}

.errorCard {
  @include mid-width;
  background-color: var(--bg-surface);
  border: 1px solid #e74c3c;
  border-radius: $default-radius;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  color: #e74c3c;

  strong { display: block; margin-bottom: 0.35rem; }
  p { margin: 0; font-size: 0.9rem; }
}

.downloadCard {
  @include mid-width;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: $default-radius;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;

  strong { display: block; margin-bottom: 0.25rem; font-size: 0.95rem; }
  p { margin: 0; color: var(--text-secondary); font-size: 0.85rem; }

  &__button {
    padding: 0.55rem 1.25rem;
    background-color: var(--accent);
    color: #fff;
    border: none;
    border-radius: $default-radius;
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.15s;

    &:hover { opacity: 0.88; }
  }
}

.iconButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: $default-radius;
  border: 1px solid var(--border);
  background: none;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.15s, border-color 0.15s, background-color 0.15s;
  flex-shrink: 0;

  &--remove:hover {
    border-color: #e74c3c;
    color: #e74c3c;
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
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
  .modeTabs, .fileInput, .batchBar, .passwordCard {
    margin-left: 1.25rem;
    margin-right: 1.25rem;
  }
  .modeTabs__tab { font-size: 0.82rem; padding: 0.55rem 0.5rem; }
  .downloadCard { flex-direction: column; align-items: flex-start; }
}
</style>
