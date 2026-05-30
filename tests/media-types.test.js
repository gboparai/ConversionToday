/**
 * Media Types Utility Tests for ConversionToday
 *
 * Tests the media-types.js module which handles path detection,
 * configuration resolution, and action/mutation mapping.
 */
/* eslint-env jest */

const fs = require('fs');
const path = require('path');

const MEDIA_TYPES_PATH = path.resolve(__dirname, '../src/js/media-types.js');

let source;

beforeAll(() => {
  source = fs.readFileSync(MEDIA_TYPES_PATH, 'utf8');
});

// ─── Module Structure ────────────────────────────────────────────────────────

describe('Media types module structure', () => {
  test('exports MEDIA_TYPES, getMediaTypeFromPath, and getMediaTypeConfig', () => {
    expect(source).toContain('export { MEDIA_TYPES, getMediaTypeFromPath, getMediaTypeConfig }');
  });

  test('defines all 6 media types', () => {
    const types = ['image', 'audio', 'video', 'document', 'archive', 'font'];
    types.forEach(type => {
      expect(source).toContain(`${type}: {`);
    });
  });
});

// ─── Configuration Completeness ──────────────────────────────────────────────

describe('Media type configuration completeness', () => {
  const requiredKeys = [
    'filesKey', 'formatsKey', 'nextIndexKey', 'workerKey', 'configKey',
    'label', 'addFiles', 'clearFiles', 'processAll', 'loadWorker',
    'setFormat', 'setUrl', 'setName', 'removeFile',
  ];

  // Extract each media type block (simple validation via regex)
  const mediaTypeBlocks = {};
  const types = ['image', 'audio', 'video', 'document', 'archive', 'font'];

  beforeAll(() => {
    types.forEach(type => {
      const regex = new RegExp(`${type}:\\s*\\{([\\s\\S]*?)\\}`, 'm');
      const match = source.match(regex);
      mediaTypeBlocks[type] = match ? match[1] : '';
    });
  });

  test.each(types)('%s has all required keys', (type) => {
    requiredKeys.forEach(key => {
      expect(mediaTypeBlocks[type]).toContain(`${key}:`);
    });
  });

  test('image type uses generic store key names (files, formats)', () => {
    expect(mediaTypeBlocks.image).toContain("filesKey: 'files'");
    expect(mediaTypeBlocks.image).toContain("formatsKey: 'formats'");
  });

  test('other types use prefixed store key names', () => {
    expect(mediaTypeBlocks.audio).toContain("filesKey: 'audioFiles'");
    expect(mediaTypeBlocks.video).toContain("filesKey: 'videoFiles'");
    expect(mediaTypeBlocks.document).toContain("filesKey: 'documentFiles'");
    expect(mediaTypeBlocks.archive).toContain("filesKey: 'archiveFiles'");
    expect(mediaTypeBlocks.font).toContain("filesKey: 'fontFiles'");
  });
});

// ─── getMediaTypeFromPath Logic ──────────────────────────────────────────────

describe('getMediaTypeFromPath logic', () => {
  test('correctly identifies all media type paths from source', () => {
    expect(source).toContain("if (path.startsWith('/audio')) return 'audio'");
    expect(source).toContain("if (path.startsWith('/video')) return 'video'");
    expect(source).toContain("if (path.startsWith('/document')) return 'document'");
    expect(source).toContain("if (path.startsWith('/archive')) return 'archive'");
    expect(source).toContain("if (path.startsWith('/font')) return 'font'");
  });

  test('defaults to image for unmatched paths', () => {
    expect(source).toContain("return 'image'");
  });
});

// ─── getMediaTypeConfig Fallback ─────────────────────────────────────────────

describe('getMediaTypeConfig fallback', () => {
  test('falls back to image config for unknown media types', () => {
    expect(source).toContain('MEDIA_TYPES[mediaType] || MEDIA_TYPES.image');
  });
});

// ─── Action Name Consistency ─────────────────────────────────────────────────

describe('Action name consistency', () => {
  test('each media type has matching action names for its prefix', () => {
    const patterns = [
      { type: 'audio', prefix: 'Audio' },
      { type: 'video', prefix: 'Video' },
      { type: 'document', prefix: 'Document' },
      { type: 'archive', prefix: 'Archive' },
      { type: 'font', prefix: 'Font' },
    ];
    patterns.forEach(({ type, prefix }) => {
      expect(source).toContain(`addFiles: 'add${prefix}Files'`);
      expect(source).toContain(`clearFiles: 'clear${prefix}Files'`);
      expect(source).toContain(`processAll: 'processAll${prefix}Files'`);
      expect(source).toContain(`loadWorker: 'load${prefix}Worker'`);
      expect(source).toContain(`setFormat: 'set${prefix}Format'`);
    });
  });

  test('document, archive, and font types have setInputFormat action', () => {
    // These types support input format differentiation
    expect(source).toContain("setInputFormat: 'setDocumentInputFormat'");
    expect(source).toContain("setInputFormat: 'setArchiveInputFormat'");
    expect(source).toContain("setInputFormat: 'setFontInputFormat'");
  });

  test('image and audio types do NOT have setInputFormat', () => {
    // These are null because they don't distinguish input formats
    const imageBlock = source.match(/image:\s*\{([\s\S]*?)\}/m)[1];
    const audioBlock = source.match(/audio:\s*\{([\s\S]*?)\}/m)[1];
    expect(imageBlock).toContain('setInputFormat: null');
    expect(audioBlock).toContain('setInputFormat: null');
  });
});

// ─── Accept MIME Types ──────────────────────────────────────────────────────

describe('Accept MIME types', () => {
  test('image type accepts image/*', () => {
    expect(source).toContain("acceptMimeTypes: 'image/*'");
  });

  test('audio type accepts audio/*', () => {
    expect(source).toContain("acceptMimeTypes: 'audio/*'");
  });

  test('video type accepts video/*', () => {
    expect(source).toContain("acceptMimeTypes: 'video/*'");
  });

  test('document type accepts all files', () => {
    expect(source).toContain("acceptMimeTypes: '*/*'");
  });

  test('font type computes accept dynamically (null)', () => {
    expect(source).toContain('acceptMimeTypes: null');
  });

  test('archive type has explicit extension list', () => {
    expect(source).toContain('.zip,.7z,.rar,.tar');
  });
});
