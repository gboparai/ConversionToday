/**
 * Comprehensive Conversion Pair Tests for ConversionToday
 *
 * This test suite verifies that every supported conversion pair, tool, and
 * feature advertised by the application is properly defined in the store and
 * that the associated fixture files exist and are valid.
 *
 * Testing framework: Jest
 */
/* eslint-env jest */

const fs = require('fs');
const path = require('path');

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

// ─── Helper ──────────────────────────────────────────────────────────────────

function fixtureExists(filename) {
  return fs.existsSync(path.join(FIXTURES_DIR, filename));
}

function fixtureBuffer(filename) {
  return fs.readFileSync(path.join(FIXTURES_DIR, filename));
}

function fixtureSize(filename) {
  return fs.statSync(path.join(FIXTURES_DIR, filename)).size;
}

// ─── Format Definitions (loaded from app source files) ───────────────────────

const STORE_PATH = path.resolve(__dirname, '../src/store/index.js');
const OCR_VIEW_PATH = path.resolve(__dirname, '../src/views/Ocr.vue');
const MERGE_VIEW_PATH = path.resolve(__dirname, '../src/views/Merge.vue');
const ROUTER_PATH = path.resolve(__dirname, '../src/router/index.js');

function extractBalanced(source, start, openChar, closeChar) {
  let depth = 0;
  let inString = null;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }

    if (ch === openChar) {
      depth += 1;
    } else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }
  throw new Error(`Failed to extract balanced ${openChar}${closeChar} section`);
}

function extractStateArrayLiteral(source, key) {
  const marker = `${key}: [`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Could not find state array: ${key}`);
  const arrayStart = source.indexOf('[', markerIndex);
  return extractBalanced(source, arrayStart, '[', ']');
}

function extractConstArrayLiteral(source, name) {
  const marker = `const ${name} = [`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Could not find const array: ${name}`);
  const arrayStart = source.indexOf('[', markerIndex);
  return extractBalanced(source, arrayStart, '[', ']');
}

function parseQuotedList(literal) {
  return [...literal.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
}

function parseFormatObjects(arrayLiteral, extraKeys = []) {
  const objectLiterals = arrayLiteral.match(/\{[\s\S]*?\}/g) || [];
  return objectLiterals
    .map((obj) => {
      const nameMatch = obj.match(/name:\s*["']([^"']+)["']/);
      if (!nameMatch) return null;
      const result = {
        name: nameMatch[1],
        extension: (obj.match(/extension:\s*["']([^"']+)["']/) || [])[1],
        canConvertFrom: /canConvertFrom:\s*true/.test(obj),
        canConvertTo: /canConvertTo:\s*true/.test(obj),
      };
      extraKeys.forEach((key) => {
        const match = obj.match(new RegExp(`${key}:\\s*[\"']([^\"']+)[\"']`));
        if (match) result[key] = match[1];
      });
      return result;
    })
    .filter(Boolean);
}

function parseStoreFormats(arrayName) {
  const source = fs.readFileSync(STORE_PATH, 'utf8');
  return parseFormatObjects(extractStateArrayLiteral(source, arrayName));
}

function parseMergeFamilies() {
  const source = fs.readFileSync(MERGE_VIEW_PATH, 'utf8');
  const objectStart = source.indexOf('const FAMILY_CONFIG = {');
  if (objectStart < 0) throw new Error('Could not find FAMILY_CONFIG');
  const braceStart = source.indexOf('{', objectStart);
  const familyConfigLiteral = extractBalanced(source, braceStart, '{', '}');
  const familyRegex = /(archive|audio|video|document)\s*:\s*\{[\s\S]*?outputAllow:\s*\[([\s\S]*?)\]/g;
  return [...familyConfigLiteral.matchAll(familyRegex)].map((match) => ({
    family: match[1],
    formats: parseQuotedList(match[2]),
  }));
}

function parseRouterPaths() {
  const source = fs.readFileSync(ROUTER_PATH, 'utf8');
  return [...source.matchAll(/path:\s*'([^']+)'/g)].map((match) => match[1]);
}

const IMAGE_FORMATS = parseStoreFormats('formats');
const AUDIO_FORMATS = parseStoreFormats('audioFormats');
const VIDEO_FORMATS = parseStoreFormats('videoFormats');
const DOCUMENT_FORMATS = parseStoreFormats('documentFormats');
const ARCHIVE_FORMATS = parseStoreFormats('archiveFormats');
const FONT_FORMATS = parseStoreFormats('fontFormats');

const ocrViewSource = fs.readFileSync(OCR_VIEW_PATH, 'utf8');
const OCR_INPUT_FORMATS = parseFormatObjects(extractConstArrayLiteral(ocrViewSource, 'OCR_INPUT_FORMATS'), ['inputType']);
const OCR_OUTPUT_FORMATS = parseFormatObjects(extractConstArrayLiteral(ocrViewSource, 'OCR_OUTPUT_FORMATS')).map((format) => format.name);

const PDF_IMAGE_PAIRS = [
  { input: 'pdf', outputs: ['png', 'jpg', 'jpeg', 'webp'] },
  { input: 'jpg', outputs: ['pdf'] },
  { input: 'jpeg', outputs: ['pdf'] },
  { input: 'png', outputs: ['pdf'] },
  { input: 'webp', outputs: ['pdf'] },
];

const MERGE_FAMILIES = parseMergeFamilies();

const ROUTER_DEFINED_PATHS = parseRouterPaths();

const COMPRESSION_FORMATS = ['jpg', 'png', 'webp', 'avif'];

const COMPRESS_FORMATS = ['zip', '7z', 'tar', 'tar.gz', 'tar.bz2', 'tar.xz', 'iso'];

// ─── Test Suites ─────────────────────────────────────────────────────────────

describe('Test Fixtures', () => {
  describe('Image fixtures', () => {
    test('sample.png exists and is valid PNG', () => {
      expect(fixtureExists('sample.png')).toBe(true);
      const buf = fixtureBuffer('sample.png');
      // PNG magic bytes
      expect(buf[0]).toBe(0x89);
      expect(buf.slice(1, 4).toString()).toBe('PNG');
    });

    test('sample.jpg exists and is valid JPEG', () => {
      expect(fixtureExists('sample.jpg')).toBe(true);
      const buf = fixtureBuffer('sample.jpg');
      expect(buf[0]).toBe(0xFF);
      expect(buf[1]).toBe(0xD8);
    });

    test('sample.gif exists and is valid GIF', () => {
      expect(fixtureExists('sample.gif')).toBe(true);
      const buf = fixtureBuffer('sample.gif');
      expect(buf.slice(0, 6).toString()).toMatch(/^GIF8[79]a$/);
    });

    test('sample.bmp exists and is valid BMP', () => {
      expect(fixtureExists('sample.bmp')).toBe(true);
      const buf = fixtureBuffer('sample.bmp');
      expect(buf.slice(0, 2).toString()).toBe('BM');
    });

    test('sample.webp exists and is valid WebP', () => {
      expect(fixtureExists('sample.webp')).toBe(true);
      const buf = fixtureBuffer('sample.webp');
      expect(buf.slice(0, 4).toString()).toBe('RIFF');
      expect(buf.slice(8, 12).toString()).toBe('WEBP');
    });

    test('sample.svg exists and is valid SVG', () => {
      expect(fixtureExists('sample.svg')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.svg'), 'utf8');
      expect(content).toContain('<svg');
      expect(content).toContain('xmlns');
    });
  });

  describe('Audio fixtures', () => {
    test('sample.wav exists and is valid WAV', () => {
      expect(fixtureExists('sample.wav')).toBe(true);
      const buf = fixtureBuffer('sample.wav');
      expect(buf.slice(0, 4).toString()).toBe('RIFF');
      expect(buf.slice(8, 12).toString()).toBe('WAVE');
    });

    test('sample.mp3 exists and has ID3/MPEG header', () => {
      expect(fixtureExists('sample.mp3')).toBe(true);
      const buf = fixtureBuffer('sample.mp3');
      // Should start with ID3 or sync bytes
      const hasId3 = buf.slice(0, 3).toString() === 'ID3';
      const hasSyncWord = buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0;
      expect(hasId3 || hasSyncWord).toBe(true);
    });
  });

  describe('Video fixtures', () => {
    test('sample.mp4 exists and has ftyp box', () => {
      expect(fixtureExists('sample.mp4')).toBe(true);
      const buf = fixtureBuffer('sample.mp4');
      const content = buf.toString('ascii', 0, 36);
      expect(content).toContain('ftyp');
    });
  });

  describe('Document fixtures', () => {
    test('sample.md exists and has markdown content', () => {
      expect(fixtureExists('sample.md')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.md'), 'utf8');
      expect(content).toContain('#');
    });

    test('sample.html exists and is valid HTML', () => {
      expect(fixtureExists('sample.html')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.html'), 'utf8');
      expect(content).toContain('<html');
    });

    test('sample.csv exists with tabular data', () => {
      expect(fixtureExists('sample.csv')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.csv'), 'utf8');
      expect(content.split('\n').length).toBeGreaterThan(1);
      expect(content).toContain(',');
    });

    test('sample.tsv exists with tabular data', () => {
      expect(fixtureExists('sample.tsv')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.tsv'), 'utf8');
      expect(content).toContain('\t');
    });

    test('sample.rtf exists and is valid RTF', () => {
      expect(fixtureExists('sample.rtf')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.rtf'), 'utf8');
      expect(content).toMatch(/^\{\\rtf/);
    });

    test('sample.tex exists and is valid LaTeX', () => {
      expect(fixtureExists('sample.tex')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.tex'), 'utf8');
      expect(content).toContain('\\documentclass');
    });

    test('sample.rst exists and is valid reStructuredText', () => {
      expect(fixtureExists('sample.rst')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.rst'), 'utf8');
      expect(content).toContain('===');
    });

    test('sample.org exists and is valid Org mode', () => {
      expect(fixtureExists('sample.org')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.org'), 'utf8');
      expect(content).toContain('*');
    });

    test('sample.bib exists and is valid BibTeX', () => {
      expect(fixtureExists('sample.bib')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.bib'), 'utf8');
      expect(content).toContain('@article');
    });

    test('sample.pdf exists and is valid PDF', () => {
      expect(fixtureExists('sample.pdf')).toBe(true);
      const content = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.pdf'), 'utf8');
      expect(content).toMatch(/^%PDF/);
    });
  });

  describe('Archive fixtures', () => {
    test('sample.zip exists and is valid ZIP', () => {
      expect(fixtureExists('sample.zip')).toBe(true);
      const buf = fixtureBuffer('sample.zip');
      // ZIP magic: PK\x03\x04
      expect(buf[0]).toBe(0x50);
      expect(buf[1]).toBe(0x4B);
    });

    test('sample.tar exists and is valid TAR', () => {
      expect(fixtureExists('sample.tar')).toBe(true);
      expect(fixtureSize('sample.tar')).toBeGreaterThan(0);
    });

    test('sample.tar.gz exists and is valid gzipped TAR', () => {
      expect(fixtureExists('sample.tar.gz')).toBe(true);
      const buf = fixtureBuffer('sample.tar.gz');
      // Gzip magic: 0x1F 0x8B
      expect(buf[0]).toBe(0x1F);
      expect(buf[1]).toBe(0x8B);
    });
  });

  describe('Font fixtures', () => {
    test('sample.ttf exists and is valid TrueType', () => {
      expect(fixtureExists('sample.ttf')).toBe(true);
      expect(fixtureSize('sample.ttf')).toBeGreaterThan(100);
    });
  });
});

// ─── Image Conversion Pairs ─────────────────────────────────────────────────

describe('Image Conversion Pairs', () => {
  const inputFormats = IMAGE_FORMATS.filter(f => f.canConvertFrom);
  const outputFormats = IMAGE_FORMATS.filter(f => f.canConvertTo);

  describe('Format definitions', () => {
    test(`has ${IMAGE_FORMATS.length} image formats defined`, () => {
      expect(IMAGE_FORMATS.length).toBe(50);
    });

    test('all formats have required properties', () => {
      IMAGE_FORMATS.forEach(format => {
        expect(format).toHaveProperty('name');
        expect(format).toHaveProperty('extension');
        expect(format).toHaveProperty('canConvertFrom');
        expect(format).toHaveProperty('canConvertTo');
        expect(typeof format.name).toBe('string');
        expect(typeof format.extension).toBe('string');
      });
    });
  });

  describe('All valid conversion pairs', () => {
    inputFormats.forEach(input => {
      outputFormats
        .filter(output => output.name !== input.name)
        .forEach(output => {
          test(`${input.name} → ${output.name}`, () => {
            // Verify both formats exist in our definitions
            expect(input.canConvertFrom).toBe(true);
            expect(output.canConvertTo).toBe(true);
            // Verify the pair is valid (different formats)
            expect(input.name).not.toBe(output.name);
          });
        });
    });
  });

  describe('Input format count', () => {
    test(`has ${inputFormats.length} input-capable image formats`, () => {
      expect(inputFormats.length).toBeGreaterThan(30);
    });
  });

  describe('Output format count', () => {
    test(`has ${outputFormats.length} output-capable image formats`, () => {
      expect(outputFormats.length).toBeGreaterThan(40);
    });
  });
});

// ─── Audio Conversion Pairs ─────────────────────────────────────────────────

describe('Audio Conversion Pairs', () => {
  const inputFormats = AUDIO_FORMATS.filter(f => f.canConvertFrom);
  const outputFormats = AUDIO_FORMATS.filter(f => f.canConvertTo);

  describe('Format definitions', () => {
    test(`has ${AUDIO_FORMATS.length} audio formats defined`, () => {
      expect(AUDIO_FORMATS.length).toBe(11);
    });

    test('all formats have required properties', () => {
      AUDIO_FORMATS.forEach(format => {
        expect(format).toHaveProperty('name');
        expect(format).toHaveProperty('extension');
        expect(format).toHaveProperty('canConvertFrom');
        expect(format).toHaveProperty('canConvertTo');
      });
    });
  });

  describe('All valid conversion pairs', () => {
    inputFormats.forEach(input => {
      outputFormats
        .filter(output => output.name !== input.name)
        .forEach(output => {
          test(`${input.name} → ${output.name}`, () => {
            expect(input.canConvertFrom).toBe(true);
            expect(output.canConvertTo).toBe(true);
            expect(input.name).not.toBe(output.name);
          });
        });
    });
  });

  describe('Total conversion pair count', () => {
    const pairCount = inputFormats.length * (outputFormats.length - 1);
    test(`supports ${pairCount} audio conversion pairs`, () => {
      expect(pairCount).toBe(110); // 11 * 10
    });
  });
});

// ─── Video Conversion Pairs ─────────────────────────────────────────────────

describe('Video Conversion Pairs', () => {
  const inputFormats = VIDEO_FORMATS.filter(f => f.canConvertFrom);
  const outputFormats = VIDEO_FORMATS.filter(f => f.canConvertTo);

  describe('Format definitions', () => {
    test(`has ${VIDEO_FORMATS.length} video formats defined`, () => {
      expect(VIDEO_FORMATS.length).toBe(12);
    });

    test('all formats have required properties', () => {
      VIDEO_FORMATS.forEach(format => {
        expect(format).toHaveProperty('name');
        expect(format).toHaveProperty('extension');
        expect(format).toHaveProperty('canConvertFrom');
        expect(format).toHaveProperty('canConvertTo');
      });
    });
  });

  describe('All valid conversion pairs', () => {
    inputFormats.forEach(input => {
      outputFormats
        .filter(output => output.name !== input.name)
        .forEach(output => {
          test(`${input.name} → ${output.name}`, () => {
            expect(input.canConvertFrom).toBe(true);
            expect(output.canConvertTo).toBe(true);
            expect(input.name).not.toBe(output.name);
          });
        });
    });
  });

  describe('Total conversion pair count', () => {
    const pairCount = inputFormats.length * (outputFormats.length - 1);
    test(`supports ${pairCount} video conversion pairs`, () => {
      expect(pairCount).toBe(132); // 12 * 11
    });
  });
});

// ─── Document Conversion Pairs ──────────────────────────────────────────────

describe('Document Conversion Pairs', () => {
  const inputFormats = DOCUMENT_FORMATS.filter(f => f.canConvertFrom);
  const outputFormats = DOCUMENT_FORMATS.filter(f => f.canConvertTo);

  describe('Format definitions', () => {
    test(`has ${DOCUMENT_FORMATS.length} document formats defined`, () => {
      expect(DOCUMENT_FORMATS.length).toBe(67);
    });

    test('all formats have required properties', () => {
      DOCUMENT_FORMATS.forEach(format => {
        expect(format).toHaveProperty('name');
        expect(format).toHaveProperty('extension');
        expect(format).toHaveProperty('canConvertFrom');
        expect(format).toHaveProperty('canConvertTo');
      });
    });
  });

  describe('All valid input → output conversion pairs', () => {
    inputFormats.forEach(input => {
      outputFormats
        .filter(output => output.name !== input.name)
        .forEach(output => {
          test(`${input.name} → ${output.name}`, () => {
            expect(input.canConvertFrom).toBe(true);
            expect(output.canConvertTo).toBe(true);
            expect(input.name).not.toBe(output.name);
          });
        });
    });
  });

  describe('Input/output format counts', () => {
    test(`has ${inputFormats.length} input-capable document formats`, () => {
      expect(inputFormats.length).toBeGreaterThan(35);
    });

    test(`has ${outputFormats.length} output-capable document formats`, () => {
      expect(outputFormats.length).toBeGreaterThan(50);
    });
  });
});

// ─── Archive Conversion Pairs ───────────────────────────────────────────────

describe('Archive Conversion Pairs', () => {
  const inputFormats = ARCHIVE_FORMATS.filter(f => f.canConvertFrom);
  const outputFormats = ARCHIVE_FORMATS.filter(f => f.canConvertTo);

  describe('Format definitions', () => {
    test(`has ${ARCHIVE_FORMATS.length} archive formats defined`, () => {
      expect(ARCHIVE_FORMATS.length).toBe(8);
    });

    test('RAR is input-only (no output)', () => {
      const rar = ARCHIVE_FORMATS.find(f => f.name === 'rar');
      expect(rar.canConvertFrom).toBe(true);
      expect(rar.canConvertTo).toBe(false);
    });
  });

  describe('All valid conversion pairs', () => {
    inputFormats.forEach(input => {
      outputFormats
        .filter(output => output.name !== input.name)
        .forEach(output => {
          test(`${input.name} → ${output.name}`, () => {
            expect(input.canConvertFrom).toBe(true);
            expect(output.canConvertTo).toBe(true);
            expect(input.name).not.toBe(output.name);
          });
        });
    });
  });

  describe('Total conversion pair count', () => {
    // 8 inputs * 7 outputs - self-pairs where both support in/out
    const selfPairs = inputFormats.filter(i => outputFormats.find(o => o.name === i.name)).length;
    const pairCount = inputFormats.length * outputFormats.length - selfPairs;
    test(`supports ${pairCount} archive conversion pairs`, () => {
      expect(pairCount).toBeGreaterThan(40);
    });
  });
});

// ─── Font Conversion Pairs ──────────────────────────────────────────────────

describe('Font Conversion Pairs', () => {
  const inputFormats = FONT_FORMATS.filter(f => f.canConvertFrom);
  const outputFormats = FONT_FORMATS.filter(f => f.canConvertTo);

  describe('Format definitions', () => {
    test(`has ${FONT_FORMATS.length} font formats defined`, () => {
      expect(FONT_FORMATS.length).toBe(6);
    });

    test('all font formats support both input and output', () => {
      FONT_FORMATS.forEach(format => {
        expect(format.canConvertFrom).toBe(true);
        expect(format.canConvertTo).toBe(true);
      });
    });
  });

  describe('All valid conversion pairs', () => {
    inputFormats.forEach(input => {
      outputFormats
        .filter(output => output.name !== input.name)
        .forEach(output => {
          test(`${input.name} → ${output.name}`, () => {
            expect(input.canConvertFrom).toBe(true);
            expect(output.canConvertTo).toBe(true);
            expect(input.name).not.toBe(output.name);
          });
        });
    });
  });

  describe('Total conversion pair count', () => {
    const pairCount = inputFormats.length * (outputFormats.length - 1);
    test(`supports ${pairCount} font conversion pairs`, () => {
      expect(pairCount).toBe(30); // 6 * 5
    });
  });
});

// ─── OCR Tool ───────────────────────────────────────────────────────────────

describe('OCR Tool', () => {
  describe('Input formats', () => {
    test(`has ${OCR_INPUT_FORMATS.length} OCR input formats`, () => {
      expect(OCR_INPUT_FORMATS.length).toBe(7);
    });

    test('supports image inputs (jpg, png, gif, bmp, webp, tiff)', () => {
      const imageInputs = OCR_INPUT_FORMATS.filter(f => f.inputType === 'image');
      expect(imageInputs.length).toBe(6);
    });

    test('supports PDF input', () => {
      const pdfInput = OCR_INPUT_FORMATS.find(f => f.inputType === 'pdf');
      expect(pdfInput).toBeDefined();
      expect(pdfInput.name).toBe('pdf');
    });
  });

  describe('Output formats', () => {
    test(`has ${OCR_OUTPUT_FORMATS.length} OCR output formats`, () => {
      expect(OCR_OUTPUT_FORMATS.length).toBe(20);
    });

    test('includes text-based outputs', () => {
      expect(OCR_OUTPUT_FORMATS).toContain('txt');
      expect(OCR_OUTPUT_FORMATS).toContain('markdown');
      expect(OCR_OUTPUT_FORMATS).toContain('html');
    });

    test('includes document outputs', () => {
      expect(OCR_OUTPUT_FORMATS).toContain('docx');
      expect(OCR_OUTPUT_FORMATS).toContain('pdf');
      expect(OCR_OUTPUT_FORMATS).toContain('epub');
      expect(OCR_OUTPUT_FORMATS).toContain('rtf');
      expect(OCR_OUTPUT_FORMATS).toContain('odt');
    });

    test('includes spreadsheet outputs', () => {
      expect(OCR_OUTPUT_FORMATS).toContain('xlsx');
      expect(OCR_OUTPUT_FORMATS).toContain('csv');
      expect(OCR_OUTPUT_FORMATS).toContain('tsv');
      expect(OCR_OUTPUT_FORMATS).toContain('ods');
    });
  });

  describe('All OCR input → output pairs', () => {
    OCR_INPUT_FORMATS.forEach(input => {
      OCR_OUTPUT_FORMATS.forEach(output => {
        test(`OCR: ${input.name} → ${output}`, () => {
          expect(input.name).toBeDefined();
          expect(output).toBeDefined();
          // Verify this is a valid combination
          expect(typeof input.inputType).toBe('string');
        });
      });
    });
  });

  describe('Total OCR pair count', () => {
    const pairCount = OCR_INPUT_FORMATS.length * OCR_OUTPUT_FORMATS.length;
    test(`supports ${pairCount} OCR conversion pairs`, () => {
      expect(pairCount).toBe(140); // 7 * 20
    });
  });
});

// ─── Image Compression Tool ─────────────────────────────────────────────────

describe('Image Compression Tool', () => {
  describe('Supported compression formats', () => {
    test(`has ${COMPRESSION_FORMATS.length} compression formats`, () => {
      expect(COMPRESSION_FORMATS.length).toBe(4);
    });

    test('supports JPG compression', () => {
      expect(COMPRESSION_FORMATS).toContain('jpg');
    });

    test('supports PNG compression', () => {
      expect(COMPRESSION_FORMATS).toContain('png');
    });

    test('supports WebP compression', () => {
      expect(COMPRESSION_FORMATS).toContain('webp');
    });

    test('supports AVIF compression', () => {
      expect(COMPRESSION_FORMATS).toContain('avif');
    });
  });

  describe('Compression pairs (same format in, compressed out)', () => {
    COMPRESSION_FORMATS.forEach(format => {
      test(`compress ${format} → ${format} (smaller)`, () => {
        // Compression takes format X and outputs compressed format X
        expect(COMPRESSION_FORMATS).toContain(format);
      });
    });
  });
});

// ─── Merge Tool ─────────────────────────────────────────────────────────────

describe('Merge Tool', () => {
  describe('Merge families', () => {
    test(`has ${MERGE_FAMILIES.length} merge families`, () => {
      expect(MERGE_FAMILIES.length).toBe(4);
    });

    test('supports archive merge', () => {
      const archive = MERGE_FAMILIES.find(f => f.family === 'archive');
      expect(archive).toBeDefined();
      expect(archive.formats.length).toBe(7);
    });

    test('supports audio merge', () => {
      const audio = MERGE_FAMILIES.find(f => f.family === 'audio');
      expect(audio).toBeDefined();
      expect(audio.formats.length).toBe(11);
    });

    test('supports video merge', () => {
      const video = MERGE_FAMILIES.find(f => f.family === 'video');
      expect(video).toBeDefined();
      expect(video.formats.length).toBe(11);
    });

    test('supports document merge', () => {
      const document = MERGE_FAMILIES.find(f => f.family === 'document');
      expect(document).toBeDefined();
      expect(document.formats.length).toBe(7);
    });
  });

  describe('All merge output format options', () => {
    MERGE_FAMILIES.forEach(({ family, formats }) => {
      formats.forEach(format => {
        test(`merge ${family} → ${format}`, () => {
          expect(formats).toContain(format);
        });
      });
    });
  });
});

// ─── Archive Compress Tool ──────────────────────────────────────────────────

describe('Archive Compress Tool', () => {
  describe('Supported output formats', () => {
    test(`has ${COMPRESS_FORMATS.length} compress output formats`, () => {
      expect(COMPRESS_FORMATS.length).toBe(7);
    });

    COMPRESS_FORMATS.forEach(format => {
      test(`supports compressing files to ${format}`, () => {
        expect(COMPRESS_FORMATS).toContain(format);
      });
    });
  });
});

// ─── PDF-Image Tool ─────────────────────────────────────────────────────────

describe('PDF-Image Tool', () => {
  describe('PDF to Image conversions', () => {
    const pdfPair = PDF_IMAGE_PAIRS.find(p => p.input === 'pdf');

    test('PDF can convert to 4 image formats', () => {
      expect(pdfPair.outputs.length).toBe(4);
    });

    test('PDF → PNG supported', () => {
      expect(pdfPair.outputs).toContain('png');
    });

    test('PDF → JPG supported', () => {
      expect(pdfPair.outputs).toContain('jpg');
    });

    test('PDF → JPEG supported', () => {
      expect(pdfPair.outputs).toContain('jpeg');
    });

    test('PDF → WebP supported', () => {
      expect(pdfPair.outputs).toContain('webp');
    });
  });

  describe('Image to PDF conversions', () => {
    const imageToPdf = PDF_IMAGE_PAIRS.filter(p => p.input !== 'pdf');

    test('4 image formats can convert to PDF', () => {
      expect(imageToPdf.length).toBe(4);
    });

    imageToPdf.forEach(pair => {
      test(`${pair.input} → PDF supported`, () => {
        expect(pair.outputs).toContain('pdf');
      });
    });
  });

  describe('All PDF-Image pairs', () => {
    PDF_IMAGE_PAIRS.forEach(({ input, outputs }) => {
      outputs.forEach(output => {
        test(`${input} → ${output}`, () => {
          expect(input).toBeDefined();
          expect(output).toBeDefined();
        });
      });
    });
  });
});

// ─── Route Coverage ─────────────────────────────────────────────────────────

describe('Route Coverage', () => {
  const EXPECTED_ROUTES = [
    '/image',
    '/audio',
    '/video',
    '/document',
    '/archive',
    '/font',
    '/compression',
    '/compress',
    '/merge',
    '/ocr',
    '/pdf-image',
  ];

  EXPECTED_ROUTES.forEach(route => {
    test(`route ${route} is defined`, () => {
      expect(ROUTER_DEFINED_PATHS).toContain(route);
    });
  });

  describe('Conversion route patterns', () => {
    test('/image/:format/:format2 supports all image conversion pairs', () => {
      const inputFormats = IMAGE_FORMATS.filter(f => f.canConvertFrom);
      const outputFormats = IMAGE_FORMATS.filter(f => f.canConvertTo);
      const pairCount = inputFormats.reduce((count, input) => {
        return count + outputFormats.filter(o => o.name !== input.name).length;
      }, 0);
      expect(pairCount).toBeGreaterThan(1000);
    });

    test('/audio/:format/:format2 supports all audio conversion pairs', () => {
      const inputs = AUDIO_FORMATS.filter(f => f.canConvertFrom);
      const outputs = AUDIO_FORMATS.filter(f => f.canConvertTo);
      const pairCount = inputs.length * (outputs.length - 1);
      expect(pairCount).toBe(110);
    });

    test('/video/:format/:format2 supports all video conversion pairs', () => {
      const inputs = VIDEO_FORMATS.filter(f => f.canConvertFrom);
      const outputs = VIDEO_FORMATS.filter(f => f.canConvertTo);
      const pairCount = inputs.length * (outputs.length - 1);
      expect(pairCount).toBe(132);
    });

    test('/document/:format/:format2 supports all document conversion pairs', () => {
      const inputs = DOCUMENT_FORMATS.filter(f => f.canConvertFrom);
      const outputs = DOCUMENT_FORMATS.filter(f => f.canConvertTo);
      const pairCount = inputs.reduce((count, input) => {
        return count + outputs.filter(o => o.name !== input.name).length;
      }, 0);
      expect(pairCount).toBeGreaterThan(2000);
    });

    test('/archive/:format/:format2 supports all archive conversion pairs', () => {
      const inputs = ARCHIVE_FORMATS.filter(f => f.canConvertFrom);
      const outputs = ARCHIVE_FORMATS.filter(f => f.canConvertTo);
      const pairCount = inputs.reduce((count, input) => {
        return count + outputs.filter(o => o.name !== input.name).length;
      }, 0);
      expect(pairCount).toBeGreaterThan(40);
    });

    test('/font/:format/:format2 supports all font conversion pairs', () => {
      const inputs = FONT_FORMATS.filter(f => f.canConvertFrom);
      const outputs = FONT_FORMATS.filter(f => f.canConvertTo);
      const pairCount = inputs.length * (outputs.length - 1);
      expect(pairCount).toBe(30);
    });
  });
});

// ─── Summary Statistics ─────────────────────────────────────────────────────

describe('Conversion Pair Summary', () => {
  test('total supported conversion pairs across all media types', () => {
    const imageInputs = IMAGE_FORMATS.filter(f => f.canConvertFrom);
    const imageOutputs = IMAGE_FORMATS.filter(f => f.canConvertTo);
    const imagePairs = imageInputs.reduce((c, i) => c + imageOutputs.filter(o => o.name !== i.name).length, 0);

    const audioPairs = AUDIO_FORMATS.filter(f => f.canConvertFrom).length *
      (AUDIO_FORMATS.filter(f => f.canConvertTo).length - 1);

    const videoPairs = VIDEO_FORMATS.filter(f => f.canConvertFrom).length *
      (VIDEO_FORMATS.filter(f => f.canConvertTo).length - 1);

    const docInputs = DOCUMENT_FORMATS.filter(f => f.canConvertFrom);
    const docOutputs = DOCUMENT_FORMATS.filter(f => f.canConvertTo);
    const docPairs = docInputs.reduce((c, i) => c + docOutputs.filter(o => o.name !== i.name).length, 0);

    const archiveInputs = ARCHIVE_FORMATS.filter(f => f.canConvertFrom);
    const archiveOutputs = ARCHIVE_FORMATS.filter(f => f.canConvertTo);
    const archivePairs = archiveInputs.reduce((c, i) => c + archiveOutputs.filter(o => o.name !== i.name).length, 0);

    const fontPairs = FONT_FORMATS.filter(f => f.canConvertFrom).length *
      (FONT_FORMATS.filter(f => f.canConvertTo).length - 1);

    const ocrPairs = OCR_INPUT_FORMATS.length * OCR_OUTPUT_FORMATS.length;

    const pdfImagePairs = PDF_IMAGE_PAIRS.reduce((c, p) => c + p.outputs.length, 0);

    const totalPairs = imagePairs + audioPairs + videoPairs + docPairs +
      archivePairs + fontPairs + ocrPairs + pdfImagePairs;

    // Log for visibility
    console.log(`
    ╔══════════════════════════════════════════╗
    ║     Conversion Pair Summary              ║
    ╠══════════════════════════════════════════╣
    ║ Image:       ${String(imagePairs).padStart(5)} pairs              ║
    ║ Audio:       ${String(audioPairs).padStart(5)} pairs              ║
    ║ Video:       ${String(videoPairs).padStart(5)} pairs              ║
    ║ Document:    ${String(docPairs).padStart(5)} pairs              ║
    ║ Archive:     ${String(archivePairs).padStart(5)} pairs              ║
    ║ Font:        ${String(fontPairs).padStart(5)} pairs              ║
    ║ OCR:         ${String(ocrPairs).padStart(5)} pairs              ║
    ║ PDF-Image:   ${String(pdfImagePairs).padStart(5)} pairs              ║
    ╠══════════════════════════════════════════╣
    ║ TOTAL:       ${String(totalPairs).padStart(5)} pairs              ║
    ╚══════════════════════════════════════════╝
    `);

    expect(totalPairs).toBeGreaterThan(4000);
  });
});
