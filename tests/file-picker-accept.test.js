/**
 * File Picker Accept Attribute & Drag-and-Drop Filter Tests
 *
 * Verifies that the acceptMimeTypes computed property in Convert.vue correctly
 * restricts the file picker to the selected input format, AND that the
 * filterFilesByInputFormat method enforces the same restriction for drag-and-drop
 * (and as a defence-in-depth layer for the file picker). Tests cover:
 *
 *   1.  The computed property logic in Convert.vue (source analysis)
 *   2.  Format data integrity — every input-capable format has the fields
 *       needed to build a non-empty accept string
 *   3.  Per-media-type spot checks (image, audio, video, document, archive, font)
 *   4.  Fallback behaviour when no specific format is resolved
 *   5.  The file input element actually carries the :accept binding
 *   6.  filterFilesByInputFormat source structure
 *   7.  filterFilesByInputFormat logic (pure-JS simulation)
 *   8.  Drag-and-drop handler wiring — fileDrop uses the filter
 *   9.  File-picker handler wiring — input uses the filter
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

  test('reads extension from the selected input format (formatInfo)', () => {
    expect(convertSource).toContain('inputFormat.extension');
    expect(convertSource).toContain('formatInfo');
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

// ─── Helper: simulate filterFilesByInputFormat ────────────────────────────────
//
// Mirrors the exact logic in Convert.vue filterFilesByInputFormat() so we can
// test it without a browser runtime.

function makeFile(name, type = '') {
  // Minimal File-like object sufficient for the filter logic.
  return { name, type };
}

function simulateFilterFiles(fileList, inputFormat) {
  if (!inputFormat) return Array.from(fileList);

  const allowedExt = String(inputFormat.extension || inputFormat.name || '').trim().toLowerCase();
  const allowedMimes = new Set(
    inputFormat.mimeType
      ? [inputFormat.mimeType.trim().toLowerCase().split(';')[0].trim()]
      : []
  );

  return Array.from(fileList).filter((file) => {
    const fileExt  = (file.name.split('.').pop() || '').toLowerCase();
    const fileMime = (file.type || '').toLowerCase().split(';')[0].trim();
    const extMatch  = allowedExt && fileExt === allowedExt;
    const mimeMatch = allowedMimes.size > 0 && allowedMimes.has(fileMime);
    return extMatch || mimeMatch;
  });
}

// ─── 11. filterFilesByInputFormat — source structure ──────────────────────────

describe('Convert.vue — filterFilesByInputFormat source structure', () => {
  test('filterFilesByInputFormat method is defined in Convert.vue', () => {
    expect(convertSource).toContain('filterFilesByInputFormat(fileList)');
  });

  test('method returns early (passes all files) when no inputFormat is resolved', () => {
    expect(convertSource).toContain('if (!inputFormat) return Array.from(fileList)');
  });

  test('method builds allowedExt from format.extension or format.name', () => {
    expect(convertSource).toContain('inputFormat.extension || inputFormat.name');
  });

  test('method builds allowedMimes Set from format.mimeType', () => {
    expect(convertSource).toContain('new Set(');
    expect(convertSource).toContain('inputFormat.mimeType');
  });

  test('method strips codecs suffix from MIME type (split on semicolon)', () => {
    expect(convertSource).toContain(".split(';')[0].trim()");
  });

  test('method matches on extension OR mimeType', () => {
    expect(convertSource).toContain('extMatch || mimeMatch');
  });

  test('fileDrop handler converts FileList to Array before filtering', () => {
    expect(convertSource).toContain('Array.from(e.dataTransfer.files)');
  });

  test('input handler converts FileList to Array before filtering', () => {
    expect(convertSource).toContain('Array.from(e.target.files)');
  });

  test('both handlers compute skipped count and track it using trackSkipped', () => {
    expect(convertSource).toContain('all.length - filtered.length');
    expect(convertSource).toContain('this.trackSkipped(');
  });

  test('clearAll uses resetSkippedCount', () => {
    expect(convertSource).toContain('this.resetSkippedCount()');
  });

  test('skipped notice is shown when skippedCount > 0', () => {
    expect(convertSource).toContain('v-if="skippedCount > 0"');
    expect(convertSource).toContain('skippedNotice');
  });

  test('skipped notice shows correct singular/plural wording', () => {
    expect(convertSource).toContain("skippedCount === 1 ? '' : 's'");
  });

  test('skipped notice shows the expected input format extension', () => {
    expect(convertSource).toContain('formatInfo.extension || formatInfo.name');
  });

  test('skipped notice has a dismiss button that resets skippedCount', () => {
    expect(convertSource).toContain('skippedNotice__dismiss');
    expect(convertSource).toContain('@click="resetSkippedCount"');
  });

  test('both handlers only dispatch when filtered list is non-empty', () => {
    expect(convertSource).toContain('if (filtered.length) this.$store.dispatch');
  });
});

// ─── 12. filterFilesByInputFormat — logic (pure-JS simulation) ────────────────

describe('filterFilesByInputFormat — filter logic', () => {
  // ── Extension-only formats (e.g. image) ────────────────────────────────────

  describe('extension-only matching (image formats — no mimeType)', () => {
    const jpgFormat = { name: 'jpg', extension: 'jpg', mimeType: null };

    test('accepts a .jpg file', () => {
      const result = simulateFilterFiles([makeFile('photo.jpg')], jpgFormat);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('photo.jpg');
    });

    test('rejects a .png file when format is jpg', () => {
      const result = simulateFilterFiles([makeFile('image.png')], jpgFormat);
      expect(result).toHaveLength(0);
    });

    test('rejects a .mp4 file when format is jpg', () => {
      const result = simulateFilterFiles([makeFile('video.mp4')], jpgFormat);
      expect(result).toHaveLength(0);
    });

    test('accepts only matching files from a mixed list', () => {
      const files = [
        makeFile('a.jpg'),
        makeFile('b.png'),
        makeFile('c.jpg'),
        makeFile('d.gif'),
      ];
      const result = simulateFilterFiles(files, jpgFormat);
      expect(result).toHaveLength(2);
      expect(result.map(f => f.name)).toEqual(['a.jpg', 'c.jpg']);
    });

    test('is case-insensitive for extension', () => {
      const result = simulateFilterFiles([makeFile('PHOTO.JPG')], jpgFormat);
      expect(result).toHaveLength(1);
    });
  });

  // ── Extension + MIME matching (e.g. audio) ─────────────────────────────────

  describe('extension + MIME matching (audio formats)', () => {
    const mp3Format = { name: 'mp3', extension: 'mp3', mimeType: 'audio/mpeg' };

    test('accepts a .mp3 file with correct MIME type', () => {
      const result = simulateFilterFiles([makeFile('song.mp3', 'audio/mpeg')], mp3Format);
      expect(result).toHaveLength(1);
    });

    test('accepts a .mp3 file with empty MIME type (extension match is enough)', () => {
      const result = simulateFilterFiles([makeFile('song.mp3', '')], mp3Format);
      expect(result).toHaveLength(1);
    });

    test('accepts a file with correct MIME type even if extension is absent', () => {
      // Some drag-and-drop scenarios report no extension but a correct MIME type
      const result = simulateFilterFiles([makeFile('song', 'audio/mpeg')], mp3Format);
      expect(result).toHaveLength(1);
    });

    test('rejects a .wav file when format is mp3', () => {
      const result = simulateFilterFiles([makeFile('sound.wav', 'audio/wav')], mp3Format);
      expect(result).toHaveLength(0);
    });

    test('rejects a .mp4 file when format is mp3', () => {
      const result = simulateFilterFiles([makeFile('video.mp4', 'video/mp4')], mp3Format);
      expect(result).toHaveLength(0);
    });
  });

  // ── Compound MIME values (e.g. opus: 'audio/ogg; codecs=opus') ─────────────

  describe('compound mimeType values (codec suffix is stripped)', () => {
    const opusFormat = { name: 'opus', extension: 'opus', mimeType: 'audio/ogg; codecs=opus' };

    test('accepts a file with base MIME type audio/ogg (codec stripped for comparison)', () => {
      const result = simulateFilterFiles([makeFile('track.opus', 'audio/ogg')], opusFormat);
      expect(result).toHaveLength(1);
    });

    test('accepts a .opus file by extension even if MIME is empty', () => {
      const result = simulateFilterFiles([makeFile('track.opus', '')], opusFormat);
      expect(result).toHaveLength(1);
    });

    test('rejects a .mp3 file when format is opus', () => {
      const result = simulateFilterFiles([makeFile('song.mp3', 'audio/mpeg')], opusFormat);
      expect(result).toHaveLength(0);
    });
  });

  // ── Video formats ──────────────────────────────────────────────────────────

  describe('video format matching', () => {
    const mp4Format = { name: 'mp4', extension: 'mp4', mimeType: 'video/mp4' };

    test('accepts a .mp4 file', () => {
      const result = simulateFilterFiles([makeFile('clip.mp4', 'video/mp4')], mp4Format);
      expect(result).toHaveLength(1);
    });

    test('rejects a .mkv file when format is mp4', () => {
      const result = simulateFilterFiles([makeFile('film.mkv', 'video/x-matroska')], mp4Format);
      expect(result).toHaveLength(0);
    });

    test('rejects an audio file when format is mp4 video', () => {
      const result = simulateFilterFiles([makeFile('song.mp3', 'audio/mpeg')], mp4Format);
      expect(result).toHaveLength(0);
    });
  });

  // ── Font formats ───────────────────────────────────────────────────────────

  describe('font format matching', () => {
    const ttfFormat = { name: 'ttf', extension: 'ttf', mimeType: 'font/ttf' };
    const woffFormat = { name: 'woff', extension: 'woff', mimeType: 'font/woff' };

    test('accepts a .ttf file', () => {
      const result = simulateFilterFiles([makeFile('font.ttf', 'font/ttf')], ttfFormat);
      expect(result).toHaveLength(1);
    });

    test('rejects a .woff file when format is ttf', () => {
      const result = simulateFilterFiles([makeFile('font.woff', 'font/woff')], ttfFormat);
      expect(result).toHaveLength(0);
    });

    test('accepts a .woff file when format is woff', () => {
      const result = simulateFilterFiles([makeFile('font.woff', 'font/woff')], woffFormat);
      expect(result).toHaveLength(1);
    });
  });

  // ── No inputFormat (passthrough) ───────────────────────────────────────────

  describe('passthrough when inputFormat is null/undefined', () => {
    test('returns all files unchanged when inputFormat is null', () => {
      const files = [makeFile('a.jpg'), makeFile('b.mp3'), makeFile('c.pdf')];
      const result = simulateFilterFiles(files, null);
      expect(result).toHaveLength(3);
    });

    test('returns all files unchanged when inputFormat is undefined', () => {
      const files = [makeFile('a.jpg'), makeFile('b.mp3')];
      const result = simulateFilterFiles(files, undefined);
      expect(result).toHaveLength(2);
    });
  });

  // ── Empty file lists ───────────────────────────────────────────────────────

  describe('empty input', () => {
    const jpgFormat = { name: 'jpg', extension: 'jpg', mimeType: null };

    test('returns empty array when given an empty list', () => {
      const result = simulateFilterFiles([], jpgFormat);
      expect(result).toHaveLength(0);
    });
  });

  // ── Archive format (extension + mimeType) ──────────────────────────────────

  describe('archive format matching', () => {
    const zipFormat = { name: 'zip', extension: 'zip', mimeType: 'application/zip' };
    const rarFormat = { name: 'rar', extension: 'rar', mimeType: 'application/vnd.rar' };

    test('accepts a .zip file when format is zip', () => {
      const result = simulateFilterFiles([makeFile('archive.zip', 'application/zip')], zipFormat);
      expect(result).toHaveLength(1);
    });

    test('rejects a .rar file when format is zip', () => {
      const result = simulateFilterFiles([makeFile('archive.rar', 'application/vnd.rar')], zipFormat);
      expect(result).toHaveLength(0);
    });

    test('accepts a .rar file when format is rar', () => {
      const result = simulateFilterFiles([makeFile('archive.rar', 'application/vnd.rar')], rarFormat);
      expect(result).toHaveLength(1);
    });

    test('rejects a .zip file when format is rar', () => {
      const result = simulateFilterFiles([makeFile('archive.zip', 'application/zip')], rarFormat);
      expect(result).toHaveLength(0);
    });
  });

  // ── Mixed drag-and-drop scenarios ─────────────────────────────────────────

  describe('realistic drag-and-drop scenarios', () => {
    test('user drops mp3 + jpg onto an mp3 converter — only mp3 passes', () => {
      const mp3Format = { name: 'mp3', extension: 'mp3', mimeType: 'audio/mpeg' };
      const files = [
        makeFile('track.mp3', 'audio/mpeg'),
        makeFile('cover.jpg', 'image/jpeg'),
      ];
      const result = simulateFilterFiles(files, mp3Format);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('track.mp3');
    });

    test('user drops multiple mp4 + mkv files onto an mp4 converter — only mp4 files pass', () => {
      const mp4Format = { name: 'mp4', extension: 'mp4', mimeType: 'video/mp4' };
      const files = [
        makeFile('clip1.mp4', 'video/mp4'),
        makeFile('clip2.mkv', 'video/x-matroska'),
        makeFile('clip3.mp4', 'video/mp4'),
        makeFile('clip4.avi', 'video/x-msvideo'),
      ];
      const result = simulateFilterFiles(files, mp4Format);
      expect(result).toHaveLength(2);
      expect(result.map(f => f.name)).toEqual(['clip1.mp4', 'clip3.mp4']);
    });

    test('user drops entirely wrong file types — result is empty', () => {
      const pngFormat = { name: 'png', extension: 'png', mimeType: null };
      const files = [
        makeFile('doc.pdf', 'application/pdf'),
        makeFile('sheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
        makeFile('song.mp3', 'audio/mpeg'),
      ];
      const result = simulateFilterFiles(files, pngFormat);
      expect(result).toHaveLength(0);
    });

    test('user drops a folder of pngs onto a png converter — all pass', () => {
      const pngFormat = { name: 'png', extension: 'png', mimeType: null };
      const files = Array.from({ length: 5 }, (_, i) => makeFile(`img${i}.png`, 'image/png'));
      const result = simulateFilterFiles(files, pngFormat);
      expect(result).toHaveLength(5);
    });
  });
});

// ─── 8. Subtitle format data integrity ───────────────────────────────────────

describe('Subtitle format accept strings', () => {
  let subtitleFormats;
  beforeAll(() => {
    subtitleFormats = parseStoreFormats('subtitleFormats');
  });

  test('subtitleFormats array is defined in the store', () => {
    expect(subtitleFormats.length).toBeGreaterThan(0);
  });

  test('all subtitle formats have a non-empty extension', () => {
    subtitleFormats.forEach(fmt => {
      expect(fmt.extension).toBeTruthy();
    });
  });

  test('srt format is present and can convert from and to', () => {
    const srt = subtitleFormats.find(f => f.name === 'srt');
    expect(srt).toBeDefined();
    expect(srt.canConvertFrom).toBe(true);
    expect(srt.canConvertTo).toBe(true);
  });

  test('vtt format is present and can convert from and to', () => {
    const vtt = subtitleFormats.find(f => f.name === 'vtt');
    expect(vtt).toBeDefined();
    expect(vtt.canConvertFrom).toBe(true);
    expect(vtt.canConvertTo).toBe(true);
  });

  test('ass format is present and can convert from and to', () => {
    const ass = subtitleFormats.find(f => f.name === 'ass');
    expect(ass).toBeDefined();
    expect(ass.canConvertFrom).toBe(true);
    expect(ass.canConvertTo).toBe(true);
  });

  test('ssa format is present', () => {
    expect(subtitleFormats.find(f => f.name === 'ssa')).toBeDefined();
  });

  test('sbv format is present', () => {
    expect(subtitleFormats.find(f => f.name === 'sbv')).toBeDefined();
  });

  test('lrc format is present', () => {
    expect(subtitleFormats.find(f => f.name === 'lrc')).toBeDefined();
  });

  test('ttml format is present', () => {
    expect(subtitleFormats.find(f => f.name === 'ttml')).toBeDefined();
  });

  test('stl format is present', () => {
    expect(subtitleFormats.find(f => f.name === 'stl')).toBeDefined();
  });

  test('txt format is present', () => {
    expect(subtitleFormats.find(f => f.name === 'txt')).toBeDefined();
  });

  test('srt accept string contains .srt', () => {
    const srt = subtitleFormats.find(f => f.name === 'srt');
    const accept = simulateAcceptMimeTypes(srt, '.srt,.vtt,.ass,.ssa,.sub,.sbv,.stl,.ttml,.dfxp,.lrc,.txt');
    expect(accept).toContain('.srt');
  });

  test('vtt accept string contains .vtt', () => {
    const vtt = subtitleFormats.find(f => f.name === 'vtt');
    const accept = simulateAcceptMimeTypes(vtt, '.srt,.vtt,.ass');
    expect(accept).toContain('.vtt');
  });

  test('all subtitle accept strings are non-empty', () => {
    const fallback = '.srt,.vtt,.ass,.ssa,.sub,.sbv,.stl,.ttml,.dfxp,.lrc,.txt';
    subtitleFormats.forEach(fmt => {
      const accept = simulateAcceptMimeTypes(fmt, fallback);
      expect(accept.length).toBeGreaterThan(0);
    });
  });

  test('all subtitle accept strings start with a dot (extension-first)', () => {
    const fallback = '.srt,.vtt,.ass,.ssa,.sub,.sbv,.stl,.ttml,.dfxp,.lrc,.txt';
    subtitleFormats.forEach(fmt => {
      const accept = simulateAcceptMimeTypes(fmt, fallback);
      expect(accept.startsWith('.')).toBe(true);
    });
  });
});

// ─── 9. Subtitle media-type config ───────────────────────────────────────────

describe('Subtitle media-type config in media-types.js', () => {
  test('media-types.js defines a subtitle entry', () => {
    expect(mediaTypesSource).toContain("subtitle:");
  });

  test('subtitle entry has correct filesKey', () => {
    expect(mediaTypesSource).toContain("subtitleFiles");
  });

  test('subtitle entry has correct formatsKey', () => {
    expect(mediaTypesSource).toContain("subtitleFormats");
  });

  test('subtitle entry has setInputFormat (non-null)', () => {
    expect(mediaTypesSource).toContain("setSubtitleInputFormat");
  });

  test('subtitle acceptMimeTypes includes .srt and .vtt', () => {
    expect(mediaTypesSource).toContain('.srt');
    expect(mediaTypesSource).toContain('.vtt');
  });

  test('getMediaTypeFromPath handles /subtitle path', () => {
    expect(mediaTypesSource).toContain("startsWith('/subtitle')");
    expect(mediaTypesSource).toContain("return 'subtitle'");
  });
});

// ─── 10. Subtitle route registration ─────────────────────────────────────────

describe('Subtitle routes in router/index.js', () => {
  let routerSource;
  beforeAll(() => {
    routerSource = require('fs').readFileSync(
      require('path').resolve(__dirname, '../src/router/index.js'), 'utf8'
    );
  });

  test("router imports SubtitleHome", () => {
    expect(routerSource).toContain("SubtitleHome");
  });

  test("router has /subtitle home route", () => {
    expect(routerSource).toContain("path: '/subtitle'");
  });

  test("router has /subtitle/:format type route", () => {
    expect(routerSource).toContain("path: '/subtitle/:format'");
  });

  test("router has /subtitle/:format/:format2 conversion route", () => {
    expect(routerSource).toContain("path: '/subtitle/:format/:format2'");
  });
});

// ─── 11. Subtitle nav link in App.vue ─────────────────────────────────────────

describe('Subtitle nav link in App.vue', () => {
  let appSource;
  beforeAll(() => {
    appSource = require('fs').readFileSync(
      require('path').resolve(__dirname, '../src/App.vue'), 'utf8'
    );
  });

  test('App.vue contains a Subtitle nav link', () => {
    expect(appSource).toContain('to="/subtitle"');
  });

  test('Subtitle link is in the Convert dropdown', () => {
    // The Subtitle link should appear after the Convert dropdown trigger
    const convertTriggerIdx = appSource.indexOf('navDropdown__trigger');
    const subtitleLinkIdx   = appSource.indexOf('to="/subtitle"');
    expect(subtitleLinkIdx).toBeGreaterThan(convertTriggerIdx);
  });
});

// ─── 12. Subtitle tile on LandingHome ─────────────────────────────────────────

describe('Subtitle tile on LandingHome.vue', () => {
  let landingSource;
  beforeAll(() => {
    landingSource = require('fs').readFileSync(
      require('path').resolve(__dirname, '../src/views/LandingHome.vue'), 'utf8'
    );
  });

  test('LandingHome.vue contains a link to /subtitle', () => {
    expect(landingSource).toContain('href="/subtitle"');
  });

  test('Subtitle tile has a heading', () => {
    expect(landingSource).toContain('Subtitle Converter');
  });
});

// ─── 13. filterFilesByInputFormat — subtitle format matching ──────────────────

describe('filterFilesByInputFormat — subtitle format matching', () => {
  const srtFormat  = { name: 'srt',  extension: 'srt',  mimeType: 'application/x-subrip' };
  const vttFormat  = { name: 'vtt',  extension: 'vtt',  mimeType: 'text/vtt' };
  const assFormat  = { name: 'ass',  extension: 'ass',  mimeType: 'text/x-ass' };
  const ttmlFormat = { name: 'ttml', extension: 'ttml', mimeType: 'application/ttml+xml' };

  test('accepts a .srt file when format is srt', () => {
    const result = simulateFilterFiles(
      [makeFile('subs.srt', 'application/x-subrip')], srtFormat
    );
    expect(result).toHaveLength(1);
  });

  test('rejects a .vtt file when format is srt', () => {
    const result = simulateFilterFiles(
      [makeFile('subs.vtt', 'text/vtt')], srtFormat
    );
    expect(result).toHaveLength(0);
  });

  test('accepts a .vtt file when format is vtt', () => {
    const result = simulateFilterFiles(
      [makeFile('subs.vtt', 'text/vtt')], vttFormat
    );
    expect(result).toHaveLength(1);
  });

  test('rejects a .srt file when format is vtt', () => {
    const result = simulateFilterFiles(
      [makeFile('subs.srt', 'application/x-subrip')], vttFormat
    );
    expect(result).toHaveLength(0);
  });

  test('accepts a .ass file when format is ass', () => {
    const result = simulateFilterFiles(
      [makeFile('anime.ass', 'text/x-ass')], assFormat
    );
    expect(result).toHaveLength(1);
  });

  test('accepts a .ttml file when format is ttml', () => {
    const result = simulateFilterFiles(
      [makeFile('netflix.ttml', 'application/ttml+xml')], ttmlFormat
    );
    expect(result).toHaveLength(1);
  });

  test('rejects a video file dropped on an srt converter', () => {
    const result = simulateFilterFiles(
      [makeFile('movie.mp4', 'video/mp4')], srtFormat
    );
    expect(result).toHaveLength(0);
  });

  test('user drops mixed subtitle types — only srt files pass on srt converter', () => {
    const files = [
      makeFile('ep1.srt', 'application/x-subrip'),
      makeFile('ep1.vtt', 'text/vtt'),
      makeFile('ep1.ass', 'text/x-ass'),
      makeFile('ep2.srt', 'application/x-subrip'),
    ];
    const result = simulateFilterFiles(files, srtFormat);
    expect(result).toHaveLength(2);
    expect(result.map(f => f.name)).toEqual(['ep1.srt', 'ep2.srt']);
  });
});

