/**
 * Component Structure & Integration Tests for ConversionToday
 *
 * Verifies component files exist, have proper structure, expose expected
 * props/methods, and integrate correctly with each other.
 */
/* eslint-env jest */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.resolve(__dirname, '../src/components');
const VIEWS_DIR = path.resolve(__dirname, '../src/views');

// ─── Component File Integrity ────────────────────────────────────────────────

describe('Component file integrity', () => {
  const expectedComponents = [
    'card.vue',
    'descriptor.vue',
    'faq.vue',
    'file-cell.vue',
    'format-selector.vue',
    'information.vue',
    'list.vue',
    'resize-config.vue',
    'searchable-select.vue',
  ];

  test.each(expectedComponents)('%s exists', (file) => {
    expect(fs.existsSync(path.join(COMPONENTS_DIR, file))).toBe(true);
  });

  test.each(expectedComponents)('%s has template, script sections', (file) => {
    const content = fs.readFileSync(path.join(COMPONENTS_DIR, file), 'utf8');
    expect(content).toContain('<template>');
    expect(content).toContain('<script>');
  });
});

// ─── file-cell Component ─────────────────────────────────────────────────────

describe('file-cell component', () => {
  let source;
  beforeAll(() => {
    source = fs.readFileSync(path.join(COMPONENTS_DIR, 'file-cell.vue'), 'utf8');
  });

  test('accepts file and mediaType props', () => {
    expect(source).toContain('file: Object');
    expect(source).toContain('mediaType:');
  });

  test('imports FILE_STATUS constant', () => {
    expect(source).toContain("import { FILE_STATUS }");
  });

  test('computes blobURL from file output', () => {
    expect(source).toContain('blobURL()');
    expect(source).toContain('URL.createObjectURL');
  });

  test('computes newFileName with correct extension', () => {
    expect(source).toContain('newFileName()');
    expect(source).toContain('file.output.config.format.extension');
  });

  test('has remove button for non-processed files', () => {
    expect(source).toContain('removeFile');
    expect(source).toContain('remove-btn');
  });

  test('has download button for processed files', () => {
    expect(source).toContain('download-btn');
    expect(source).toContain(':download="newFileName"');
  });

  test('shows status badges for different states', () => {
    expect(source).toContain('status-badge--waiting');
    expect(source).toContain('status-badge--converting');
    expect(source).toContain('status-badge--failed');
    expect(source).toContain('status-badge--successful');
  });

  test('shows progress bar during processing', () => {
    expect(source).toContain('processing-bar');
    expect(source).toContain('processing-fill');
    expect(source).toContain('progressPercent');
  });

  test('download button has proper accessibility attributes', () => {
    expect(source).toContain('aria-label');
    expect(source).toContain('title="Download"');
  });

  test('remove button has proper accessibility attributes', () => {
    expect(source).toContain('aria-label="Remove file"');
    expect(source).toContain('title="Remove"');
  });
});

// ─── format-selector Component ──────────────────────────────────────────────

describe('format-selector component', () => {
  let source;
  beforeAll(() => {
    source = fs.readFileSync(path.join(COMPONENTS_DIR, 'format-selector.vue'), 'utf8');
  });

  test('accepts isFrom, path, name, selectedFormat, and mediaType props', () => {
    expect(source).toContain('isFrom: Boolean');
    expect(source).toContain('path: String');
    expect(source).toContain('name: String');
    expect(source).toContain('selectedFormat: String');
    expect(source).toContain('mediaType:');
  });

  test('renders format links with correct path structure', () => {
    expect(source).toContain("'/' + path + '/' + format.name");
  });

  test('filters formats based on isFrom prop', () => {
    expect(source).toContain('canConvertFrom !== false');
    expect(source).toContain('canConvertTo !== false');
  });

  test('uses searchable-select sub-component', () => {
    expect(source).toContain('searchable-select');
    expect(source).toContain('SearchableSelect');
  });

  test('navigates on format change', () => {
    expect(source).toContain('onFormatChange');
    expect(source).toContain('window.location.href');
  });
});

// ─── card Component ─────────────────────────────────────────────────────────

describe('card component', () => {
  let source;
  beforeAll(() => {
    source = fs.readFileSync(path.join(COMPONENTS_DIR, 'card.vue'), 'utf8');
  });

  test('has named slots for header and description', () => {
    expect(source).toContain('name="header"');
    expect(source).toContain('name="description"');
  });
});

// ─── descriptor Component ────────────────────────────────────────────────────

describe('descriptor component', () => {
  let source;
  beforeAll(() => {
    source = fs.readFileSync(path.join(COMPONENTS_DIR, 'descriptor.vue'), 'utf8');
  });

  test('has named slots for header and description', () => {
    expect(source).toContain('name="header"');
    expect(source).toContain('name="description"');
  });
});

// ─── searchable-select Component ─────────────────────────────────────────────

describe('searchable-select component', () => {
  let source;
  beforeAll(() => {
    source = fs.readFileSync(path.join(COMPONENTS_DIR, 'searchable-select.vue'), 'utf8');
  });

  test('accepts options and modelValue props', () => {
    expect(source).toContain('options');
    expect(source).toContain('modelValue');
  });

  test('emits change event', () => {
    expect(source).toContain('change');
  });
});

// ─── Component Usage in Views ────────────────────────────────────────────────

describe('Component usage in views', () => {
  test('Convert.vue uses file-cell, card, descriptor, list, and information components', () => {
    const convertSource = fs.readFileSync(path.join(VIEWS_DIR, 'Convert.vue'), 'utf8');
    expect(convertSource).toContain('file-cell');
    expect(convertSource).toContain('card');
    expect(convertSource).toContain('descriptor');
    expect(convertSource).toContain('list');
    expect(convertSource).toContain('information');
  });

  test('Home.vue uses format-selector and information components', () => {
    const homeSource = fs.readFileSync(path.join(VIEWS_DIR, 'Home.vue'), 'utf8');
    expect(homeSource).toContain('format-selector');
    expect(homeSource).toContain('information');
  });

  test('Type.vue exists and has a template section', () => {
    const typeSource = fs.readFileSync(path.join(VIEWS_DIR, 'Type.vue'), 'utf8');
    expect(typeSource).toContain('<template>');
  });
});
