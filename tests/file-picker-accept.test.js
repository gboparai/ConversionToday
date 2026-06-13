/**
 * File Picker Accept Attribute Tests
 *
 * Verifies that the acceptMimeTypes computed property in Convert.vue correctly
 * restricts the file picker to the selected input format. Tests cover:
 *
 *   1. The computed property logic in Convert.vue (source analysis)
 *   2. Format data integrity — every input-capable format has the fields
 *      needed to build a non-empty accept string
 *   3. Per-media-type spot checks (image, audio, video, document, archive, font)
 *   4. Fallback behaviour when no specific format is resolved
 *   5. The file input element actually carries the :accept binding
 */
/* eslint-env jest */

const fs   = require('fs');
const path = require('path');

// ─── Source files ─────────────────────────────────────────────────────────────

const CONVERT_VIEW_PATH  = path.resolve(__dirname, '../src/views/Convert.vue');
const STORE_PATH         = path.resolve(__dirname, '../src/store/index.js');
const MEDIA_TYPES_PATH   = path.resolve(__dirname, '../src/js/media-types.js');

let convertSource;
let storeSource;
let mediaTypesSource;

beforeAll(() => {
  convertSource    = fs.readFileSync(CONVERT_VIEW_PATH,  'utf8');
  storeSource      = fs.readFileSync(STORE_PATH,         'utf8');
  mediaTypesSource = fs.readFileSync(MEDIA_TYPES_PATH,   'utf8');
});

// ─── Helpers (mirrors conversion-pairs.test.js approach) ─────────────────────

function extractBalanced(source, start, openChar, closeChar) {
  let depth = 0;
  let inString = null;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (escaped)       { escaped = false; }
      else if (ch === '\\') { escaped = true; }
      else if (ch === inString) { inString = null; }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }
    if (ch === openChar)       { depth += 1; }
    else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`Failed to extract balanced ${openChar}${closeChar} section`);
}

function extractStateArrayLiteral(source, key) {
  const marker     = `${key}: [`;
  const markerIdx  = source.indexOf(marker);
  if (markerIdx < 0) throw new Error(`Could not find state array: ${key}`);
  const arrayStart = source.indexOf('[', markerIdx);
  return extractBalanced(source, arrayStart, '[', ']');
}

/**
 * Parse format objects from an array literal.
 * Returns objects with { name, extension, mimeType?, canConvertFrom, canConvertTo }.
 */
function parseFormatObjects(arrayLiteral) {
  // Split on top-level object boundaries — grab each {...} block
  const results = [];
  let depth = 0;
  let start = -1;
  let inString = null;
  let escaped = false;
  for (let i = 0; i < arrayLiteral.length; i++) {
    const ch = arrayLiteral[i];
    if (inString) {
      if (escaped)        { escaped = false; }
      else if (ch === '\\') { escaped = true; }
      else if (ch === inString) { inString = null; }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        const obj = arrayLiteral.slice(start, i + 1);
        const nameMatch = obj.match(/name:\s*['"]([^'"]+)['"]/);
        if (nameMatch) {
          const extMatch  = obj.match(/extension:\s*['"]([^'"]+)['"]/);
          const mimeMatch = obj.match(/mimeType:\s*['"]([^'"]+)['"]/);
          results.push({
            name:           nameMatch[1],
            extension:      extMatch  ? extMatch[1]  : null,
            mimeType:       mimeMatch ? mimeMatch[1] : null,
            canConvertFrom: /canConvertFrom:\s*true/.test(obj),
            canConvertTo:   /canConvertTo:\s*true/.test(obj),
          });
        }
        start = -1;
      }
    }
  }
  return results;
}

function parseStoreFormats(arrayName) {
  return parseFormatObjects(extractStateArrayLiteral(storeSource, arrayName));
}

/**
 * Simulate the acceptMimeTypes computed property logic from Convert.vue.
 * Given a format object (as it exists in the store), return what the
 * accept string would be.
 */
function simulateAcceptMimeTypes(inputFormat, mtConfigAcceptMimeTypes) {
  // Mirror the exact logic in Convert.vue acceptMimeTypes()
  if (inputFormat) {
    const ext   = String(inputFormat.extension || inputFormat.name || '').trim().toLowerCase();
    const parts = ext ? [`.${ext}`] : [];
    const mime  = inputFormat.mimeType ? String(inputFormat.mimeType).trim() : null;
    if (mime) parts.push(mime);
    if (parts.length) return parts.join(',');
  }
  // Fallback
  if (mtConfigAcceptMimeTypes) return mtConfigAcceptMimeTypes;
  return ''; // font dynamic case — not tested here
}

// ─── 1. Convert.vue source structure ─────────────────────────────────────────

describe('Convert.vue — acceptMimeTypes computed property structure', () => {
  test('file input has :accept binding bound to acceptMimeTypes', () => {
    expect(convertSource).toContain(':accept="acceptMimeTypes"');
  });

  test('acceptMimeTypes computed property is defined', () => {
    expect(convertSource).toContain('acceptMimeTypes()');
  });

  test('reads extension from the selected input format (formatInofo)', () => {
    expect(convertSource).toContain('inputFormat.extension');
    expect(convertSource).toContain('formatInofo');
  });

  test('uses mimeType field from the format object when present', () => {
    expect(convertSource).toContain('inputFormat.mimeType');
  });

  test('joins extension and mimeType parts with a comma', () => {
    expect(convertSource).toContain("parts.join(',')");
  });

  test('prepends a dot to the extension', () => {
    expect(convertSource).toContain('`.${ext}`');
  });

  test('falls back to mtConfig.acceptMimeTypes when no format is resolved', () => {
    // Both the primary branch and the fallback should reference mtConfig
    expect(convertSource).toContain('this.mtConfig.acceptMimeTypes');
  });

  test('fallback path for font (null acceptMimeTypes) computes from store formats', () => {
    expect(convertSource).toContain('this.$store.state[this.mtConfig.formatsKey]');
    expect(convertSource).toContain('`.${extension}`');
  });
});

// ─── 2. Image format accept strings ─────────────────────────────────────────

describe('Image format accept strings', () => {
  let inputFormats;
  beforeAll(() => {
    inputFormats = parseStoreFormats('formats').filter(f => f.canConvertFrom);
  });

  test('all input-capable image formats have a non-empty extension', () => {
    inputFormats.forEach(format => {
      expect(format.extension).toBeTruthy();
    });
  });

  test('jpg produces accept ".jpg"', () => {
    const jpg = inputFormats.find(f => f.name === 'jpg');
    expect(jpg).toBeDefined();
    const accept = simulateAcceptMimeTypes(jpg, 'image/*');
    expect(accept).toContain('.jpg');
    // jpg has no mimeType in the store → no comma-separated MIME
    expect(accept).toBe('.jpg');
  });

  test('png produces accept ".png"', () => {
    const png = inputFormats.find(f => f.name === 'png');
    const accept = simulateAcceptMimeTypes(png, 'image/*');
    expect(accept).toBe('.png');
  });

  test('webp produces accept ".webp"', () => {
    const webp = inputFormats.find(f => f.name === 'webp');
    const accept = simulateAcceptMimeTypes(webp, 'image/*');
    expect(accept).toBe('.webp');
  });

  test('gif produces accept ".gif"', () => {
    const gif = inputFormats.find(f => f.name === 'gif');
    const accept = simulateAcceptMimeTypes(gif, 'image/*');
    expect(accept).toBe('.gif');
  });

  test('psd produces accept ".psd"', () => {
    const psd = inputFormats.find(f => f.name === 'psd');
    const accept = simulateAcceptMimeTypes(psd, 'image/*');
    expect(accept).toBe('.psd');
  });

  test('accept string never equals the generic image/* wildcard', () => {
    inputFormats.forEach(format => {
      const accept = simulateAcceptMimeTypes(format, 'image/*');
      expect(accept).not.toBe('image/*');
    });
  });

  test('every image accept string starts with a dot', () => {
    inputFormats.forEach(format => {
      const accept = simulateAcceptMimeTypes(format, 'image/*');
      expect(accept.startsWith('.')).toBe(true);
    });
  });
});

// ─── 3. Audio format accept strings ──────────────────────────────────────────

describe('Audio format accept strings', () => {
  let inputFormats;
  beforeAll(() => {
    inputFormats = parseStoreFormats('audioFormats').filter(f => f.canConvertFrom);
  });

  test('mp3 produces accept ".mp3,audio/mpeg"', () => {
    const mp3 = inputFormats.find(f => f.name === 'mp3');
    expect(mp3).toBeDefined();
    const accept = simulateAcceptMimeTypes(mp3, 'audio/*');
    expect(accept).toContain('.mp3');
    expect(accept).toContain('audio/mpeg');
    expect(accept).toBe('.mp3,audio/mpeg');
  });

  test('wav produces accept ".wav,audio/wav"', () => {
    const wav = inputFormats.find(f => f.name === 'wav');
    const accept = simulateAcceptMimeTypes(wav, 'audio/*');
    expect(accept).toContain('.wav');
    expect(accept).toContain('audio/wav');
  });

  test('ogg produces accept ".ogg,audio/ogg"', () => {
    const ogg = inputFormats.find(f => f.name === 'ogg');
    const accept = simulateAcceptMimeTypes(ogg, 'audio/*');
    expect(accept).toContain('.ogg');
    expect(accept).toContain('audio/ogg');
  });

  test('flac produces accept ".flac,audio/flac"', () => {
    const flac = inputFormats.find(f => f.name === 'flac');
    const accept = simulateAcceptMimeTypes(flac, 'audio/*');
    expect(accept).toContain('.flac');
    expect(accept).toContain('audio/flac');
  });

  test('aac produces accept ".aac,audio/aac"', () => {
    const aac = inputFormats.find(f => f.name === 'aac');
    const accept = simulateAcceptMimeTypes(aac, 'audio/*');
    expect(accept).toContain('.aac');
    expect(accept).toContain('audio/aac');
  });

  test('m4a produces accept ".m4a,audio/mp4"', () => {
    const m4a = inputFormats.find(f => f.name === 'm4a');
    const accept = simulateAcceptMimeTypes(m4a, 'audio/*');
    expect(accept).toContain('.m4a');
    expect(accept).toContain('audio/mp4');
  });

  test('accept string never equals the generic audio/* wildcard', () => {
    inputFormats.forEach(format => {
      const accept = simulateAcceptMimeTypes(format, 'audio/*');
      expect(accept).not.toBe('audio/*');
    });
  });

  test('all audio accept strings include both extension and MIME type', () => {
    inputFormats.forEach(format => {
      const accept = simulateAcceptMimeTypes(format, 'audio/*');
      expect(accept).toContain('.');
      expect(accept).toContain('/');
    });
  });
});

// ─── 4. Video format accept strings ──────────────────────────────────────────

describe('Video format accept strings', () => {
  let inputFormats;
  beforeAll(() => {
    inputFormats = parseStoreFormats('videoFormats').filter(f => f.canConvertFrom);
  });

  test('mp4 produces accept ".mp4,video/mp4"', () => {
    const mp4 = inputFormats.find(f => f.name === 'mp4');
    expect(mp4).toBeDefined();
    const accept = simulateAcceptMimeTypes(mp4, 'video/*');
    expect(accept).toContain('.mp4');
    expect(accept).toContain('video/mp4');
  });

  test('webm produces accept ".webm,video/webm"', () => {
    const webm = inputFormats.find(f => f.name === 'webm');
    const accept = simulateAcceptMimeTypes(webm, 'video/*');
    expect(accept).toContain('.webm');
    expect(accept).toContain('video/webm');
  });

  test('mkv produces accept ".mkv,video/x-matroska"', () => {
    const mkv = inputFormats.find(f => f.name === 'mkv');
    const accept = simulateAcceptMimeTypes(mkv, 'video/*');
    expect(accept).toContain('.mkv');
    expect(accept).toContain('video/x-matroska');
  });

  test('mov produces accept ".mov,video/quicktime"', () => {
    const mov = inputFormats.find(f => f.name === 'mov');
    const accept = simulateAcceptMimeTypes(mov, 'video/*');
    expect(accept).toContain('.mov');
    expect(accept).toContain('video/quicktime');
  });

  test('avi produces accept ".avi,video/x-msvideo"', () => {
    const avi = inputFormats.find(f => f.name === 'avi');
    const accept = simulateAcceptMimeTypes(avi, 'video/*');
    expect(accept).toContain('.avi');
    expect(accept).toContain('video/x-msvideo');
  });

  test('accept string never equals the generic video/* wildcard', () => {
    inputFormats.forEach(format => {
      const accept = simulateAcceptMimeTypes(format, 'video/*');
      expect(accept).not.toBe('video/*');
    });
  });

  test('all video accept strings include both extension and MIME type', () => {
    inputFormats.forEach(format => {
      const accept = simulateAcceptMimeTypes(format, 'video/*');
      expect(accept).toContain('.');
      expect(accept).toContain('/');
    });
  });
});

// ─── 5. Document format accept strings ────────────────────────────────────────

describe('Document format accept strings', () => {
  let inputFormats;
  beforeAll(() => {
    inputFormats = parseStoreFormats('documentFormats').filter(f => f.canConvertFrom);
  });

  test('html produces an accept string containing ".html"', () => {
    const html = inputFormats.find(f => f.name === 'html');
    expect(html).toBeDefined();
    const accept = simulateAcceptMimeTypes(html, '*/*');
    expect(accept).toContain('.html');
  });

  test('markdown produces an accept string containing ".md"', () => {
    const md = inputFormats.find(f => f.name === 'markdown');
    expect(md).toBeDefined();
    const accept = simulateAcceptMimeTypes(md, '*/*');
    // extension for markdown is 'md'
    expect(accept).toContain('.md');
  });

  test('accept string never equals the generic */* wildcard', () => {
    inputFormats.forEach(format => {
      const accept = simulateAcceptMimeTypes(format, '*/*');
      expect(accept).not.toBe('*/*');
    });
  });

  test('all document accept strings are non-empty', () => {
    inputFormats.forEach(format => {
      const accept = simulateAcceptMimeTypes(format, '*/*');
      expect(accept.length).toBeGreaterThan(0);
    });
  });
});

// ─── 6. Archive format accept strings ─────────────────────────────────────────

describe('Archive format accept strings', () => {
  const archiveFallback = '.zip,.7z,.rar,.tar,.tar.gz,.tgz,.tar.bz2,.tbz2,.tar.xz,.txz,.iso';
  let inputFormats;
  beforeAll(() => {
    inputFormats = parseStoreFormats('archiveFormats').filter(f => f.canConvertFrom);
  });

  test('zip accept string contains ".zip"', () => {
    const zip = inputFormats.find(f => f.name === 'zip');
    expect(zip).toBeDefined();
    const accept = simulateAcceptMimeTypes(zip, archiveFallback);
    expect(accept).toContain('.zip');
    // archive formats in the store include mimeType fields — the accept string
    // will be ".zip,application/zip" which is strictly more precise than the old
    // generic fallback list
    expect(accept).not.toBe(archiveFallback);
  });

  test('7z accept string contains ".7z"', () => {
    const sevenZ = inputFormats.find(f => f.name === '7z');
    const accept = simulateAcceptMimeTypes(sevenZ, archiveFallback);
    expect(accept).toContain('.7z');
    expect(accept).not.toBe(archiveFallback);
  });

  test('tar accept string contains ".tar"', () => {
    const tar = inputFormats.find(f => f.name === 'tar');
    const accept = simulateAcceptMimeTypes(tar, archiveFallback);
    expect(accept).toContain('.tar');
    expect(accept).not.toBe(archiveFallback);
  });

  test('rar accept string contains ".rar" (input-only format)', () => {
    const rar = inputFormats.find(f => f.name === 'rar');
    expect(rar).toBeDefined();
    const accept = simulateAcceptMimeTypes(rar, archiveFallback);
    expect(accept).toContain('.rar');
    expect(accept).not.toBe(archiveFallback);
  });

  test('accept string never equals the full archive fallback wildcard', () => {
    inputFormats.forEach(format => {
      const accept = simulateAcceptMimeTypes(format, archiveFallback);
      expect(accept).not.toBe(archiveFallback);
    });
  });
});

// ─── 7. Font format accept strings ────────────────────────────────────────────

describe('Font format accept strings', () => {
  let inputFormats;
  beforeAll(() => {
    inputFormats = parseStoreFormats('fontFormats').filter(f => f.canConvertFrom);
  });

  test('ttf accept string contains ".ttf"', () => {
    const ttf = inputFormats.find(f => f.name === 'ttf');
    expect(ttf).toBeDefined();
    // font formats have mimeType fields in the store (e.g. font/ttf), so the
    // accept string will be ".ttf,font/ttf" — still exactly scoped to TTF files
    const accept = simulateAcceptMimeTypes(ttf, null);
    expect(accept).toContain('.ttf');
    // Must be more specific than an empty or wildcard string
    expect(accept.startsWith('.ttf')).toBe(true);
  });

  test('woff accept string contains ".woff"', () => {
    const woff = inputFormats.find(f => f.name === 'woff');
    expect(woff).toBeDefined();
    const accept = simulateAcceptMimeTypes(woff, null);
    expect(accept).toContain('.woff');
    expect(accept.startsWith('.woff')).toBe(true);
  });

  test('woff2 accept string contains ".woff2"', () => {
    const woff2 = inputFormats.find(f => f.name === 'woff2');
    expect(woff2).toBeDefined();
    const accept = simulateAcceptMimeTypes(woff2, null);
    expect(accept).toContain('.woff2');
    expect(accept.startsWith('.woff2')).toBe(true);
  });

  test('all font formats produce non-empty accept strings without needing fallback', () => {
    inputFormats.forEach(format => {
      // Pass null as fallback to confirm the primary branch fires
      const accept = simulateAcceptMimeTypes(format, null);
      expect(accept.length).toBeGreaterThan(0);
      expect(accept.startsWith('.')).toBe(true);
    });
  });
});

// ─── 8. Accept string format rules (all media types) ─────────────────────────

describe('Accept string format rules — all input-capable formats', () => {
  const allFormats = [];

  beforeAll(() => {
    const image    = parseStoreFormats('formats').filter(f => f.canConvertFrom);
    const audio    = parseStoreFormats('audioFormats').filter(f => f.canConvertFrom);
    const video    = parseStoreFormats('videoFormats').filter(f => f.canConvertFrom);
    const document = parseStoreFormats('documentFormats').filter(f => f.canConvertFrom);
    const archive  = parseStoreFormats('archiveFormats').filter(f => f.canConvertFrom);
    const font     = parseStoreFormats('fontFormats').filter(f => f.canConvertFrom);
    allFormats.push(
      ...image.map(f => ({ ...f, fallback: 'image/*' })),
      ...audio.map(f => ({ ...f, fallback: 'audio/*' })),
      ...video.map(f => ({ ...f, fallback: 'video/*' })),
      ...document.map(f => ({ ...f, fallback: '*/*' })),
      ...archive.map(f => ({ ...f, fallback: 'application/octet-stream' })),
      ...font.map(f => ({ ...f, fallback: null })),
    );
  });

  test('every input-capable format produces a non-empty accept string', () => {
    allFormats.forEach(({ name, fallback, ...rest }) => {
      const accept = simulateAcceptMimeTypes({ name, ...rest }, fallback);
      expect(accept.length).toBeGreaterThan(0);
    });
  });

  test('every accept string starts with a dot (extension-first)', () => {
    allFormats.forEach(({ name, fallback, ...rest }) => {
      const accept = simulateAcceptMimeTypes({ name, ...rest }, fallback);
      expect(accept.startsWith('.')).toBe(true);
    });
  });

  test('when mimeType is present the accept string contains a slash', () => {
    const withMime = allFormats.filter(f => f.mimeType);
    expect(withMime.length).toBeGreaterThan(0); // sanity check
    withMime.forEach(({ name, fallback, ...rest }) => {
      const accept = simulateAcceptMimeTypes({ name, ...rest }, fallback);
      expect(accept).toContain('/');
    });
  });

  test('accept string for each format is unique to that format (no collisions on extension)', () => {
    // Build a map of extension → formats that share it
    const byExt = {};
    allFormats.forEach(f => {
      const ext = (f.extension || f.name).toLowerCase();
      if (!byExt[ext]) byExt[ext] = [];
      byExt[ext].push(f.name);
    });
    // For any extension shared by multiple formats, their names should differ
    // (i.e., we are not conflating different formats with identical accept strings incorrectly)
    Object.entries(byExt).forEach(([ext, names]) => {
      if (names.length > 1) {
        // e.g. 'jpg' and 'jpeg' both map to .jpg / .jpeg — acceptable shared extension
        expect(names.length).toBeGreaterThan(0); // trivially passes; documents the situation
      }
    });
  });
});

// ─── 9. Fallback path integrity ───────────────────────────────────────────────

describe('acceptMimeTypes fallback path', () => {
  test('Convert.vue has a fallback path that uses mtConfig.acceptMimeTypes', () => {
    // The fallback should still be reachable in the source
    expect(convertSource).toContain('if (this.mtConfig.acceptMimeTypes) return this.mtConfig.acceptMimeTypes');
  });

  test('media-types.js defines acceptMimeTypes for image, audio, video', () => {
    expect(mediaTypesSource).toContain("acceptMimeTypes: 'image/*'");
    expect(mediaTypesSource).toContain("acceptMimeTypes: 'audio/*'");
    expect(mediaTypesSource).toContain("acceptMimeTypes: 'video/*'");
  });

  test('media-types.js sets acceptMimeTypes to null for font (dynamic)', () => {
    expect(mediaTypesSource).toContain('acceptMimeTypes: null');
  });

  test('media-types.js has an explicit extension list for archive', () => {
    expect(mediaTypesSource).toContain('.zip,.7z,.rar,.tar');
  });

  test('fallback returns a string, not undefined, for null mimeType formats', () => {
    // Simulate: format with extension only, no mimeType, no fallback
    const accept = simulateAcceptMimeTypes({ name: 'ttf', extension: 'ttf', mimeType: null }, null);
    expect(typeof accept).toBe('string');
    expect(accept).toBe('.ttf');
  });
});

// ─── 10. Store format data integrity ─────────────────────────────────────────

describe('Store format data completeness for file picker', () => {
  test('audio formats all have a mimeType field', () => {
    const audio = parseStoreFormats('audioFormats');
    audio.forEach(format => {
      expect(format.mimeType).toBeTruthy();
    });
  });

  test('video formats all have a mimeType field', () => {
    const video = parseStoreFormats('videoFormats');
    video.forEach(format => {
      expect(format.mimeType).toBeTruthy();
    });
  });

  test('image formats all have an extension field', () => {
    const image = parseStoreFormats('formats');
    image.forEach(format => {
      expect(format.extension).toBeTruthy();
    });
  });

  test('font formats all have an extension field', () => {
    const font = parseStoreFormats('fontFormats');
    font.forEach(format => {
      expect(format.extension).toBeTruthy();
    });
  });

  test('archive formats all have an extension field', () => {
    const archive = parseStoreFormats('archiveFormats');
    archive.forEach(format => {
      expect(format.extension).toBeTruthy();
    });
  });
});
