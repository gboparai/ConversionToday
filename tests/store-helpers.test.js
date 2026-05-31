/**
 * Store Media-Type Helpers Tests for NoLimitConverter
 *
 * Tests the createMediaMutations and createMediaActions factory functions
 * that generate Vuex mutations and actions for each media type.
 */
/* eslint-env jest */

const fs = require('fs');
const path = require('path');

const HELPERS_PATH = path.resolve(__dirname, '../src/store/media-type-helpers.js');
const STORE_PATH = path.resolve(__dirname, '../src/store/index.js');
const CONSTANTS_PATH = path.resolve(__dirname, '../src/js/constants.js');

let helpersSource;
let storeSource;
let constantsSource;

beforeAll(() => {
  helpersSource = fs.readFileSync(HELPERS_PATH, 'utf8');
  storeSource = fs.readFileSync(STORE_PATH, 'utf8');
  constantsSource = fs.readFileSync(CONSTANTS_PATH, 'utf8');
});

// ─── FILE_STATUS Constants ───────────────────────────────────────────────────

describe('FILE_STATUS constants', () => {
  test('defines all required status values', () => {
    expect(constantsSource).toContain('initialized: 0');
    expect(constantsSource).toContain('waiting: 1');
    expect(constantsSource).toContain('processing: 2');
    expect(constantsSource).toContain('failed: -1');
    expect(constantsSource).toContain('processed: 3');
  });

  test('exports FILE_STATUS', () => {
    expect(constantsSource).toContain('export { FILE_STATUS }');
  });
});

// ─── createMediaMutations ────────────────────────────────────────────────────

describe('createMediaMutations factory', () => {
  test('generates addFile mutation', () => {
    expect(helpersSource).toContain('`add${prefix}File`');
    expect(helpersSource).toContain('state[filesKey].push(fileObject)');
  });

  test('generates clearFiles mutation that resets array and index', () => {
    expect(helpersSource).toContain('`clear${prefix}Files`');
    expect(helpersSource).toContain('state[filesKey] = []');
    expect(helpersSource).toContain('state[nextIndexKey] = 0');
  });

  test('generates setData mutation', () => {
    expect(helpersSource).toContain('`set${prefix}Data`');
    expect(helpersSource).toContain('file.output.blob = data.output');
    expect(helpersSource).toContain('file.output.config = data.config');
  });

  test('generates setUrl mutation', () => {
    expect(helpersSource).toContain('`set${prefix}Url`');
    expect(helpersSource).toContain('file.output.url = url');
  });

  test('generates setName mutation', () => {
    expect(helpersSource).toContain('`set${prefix}Name`');
    expect(helpersSource).toContain('file.output.name = name');
  });

  test('generates setStatus mutation', () => {
    expect(helpersSource).toContain('`set${prefix}Status`');
    expect(helpersSource).toContain('file.status = status');
  });

  test('generates setProgress mutation that clamps between 0-100', () => {
    expect(helpersSource).toContain('`set${prefix}Progress`');
    expect(helpersSource).toContain('Math.max(0, Math.min(100, progress))');
  });

  test('generates removeFile mutation', () => {
    expect(helpersSource).toContain('`remove${prefix}File`');
    expect(helpersSource).toContain('state[filesKey].filter(f => f.id !== id)');
  });

  test('generates incrementId mutation', () => {
    expect(helpersSource).toContain('`increment${prefix}Id`');
    expect(helpersSource).toContain('state[nextIndexKey]++');
  });

  test('generates setFormat mutation', () => {
    expect(helpersSource).toContain('`set${prefix}Format`');
    expect(helpersSource).toContain('state[configKey].format = format');
  });

  test('conditionally generates setInputFormat mutation', () => {
    expect(helpersSource).toContain('if (hasInputFormat)');
    expect(helpersSource).toContain('`set${prefix}InputFormat`');
    expect(helpersSource).toContain('state[configKey].inputFormat = format');
  });

  test('mutations guard against missing file (null checks)', () => {
    expect(helpersSource).toContain('if (!file) return');
  });
});

// ─── createMediaActions ──────────────────────────────────────────────────────

describe('createMediaActions factory', () => {
  test('generates loadWorker action that initializes worker', () => {
    expect(helpersSource).toContain('`load${prefix}Worker`');
    expect(helpersSource).toContain("postMessage({ action: 'load' })");
  });

  test('worker message handler processes progress, processed, and failed statuses', () => {
    expect(helpersSource).toContain("status === 'progress'");
    expect(helpersSource).toContain("status === 'processed'");
    expect(helpersSource).toContain("status === 'failed'");
  });

  test('generates addFile action with proper file object structure', () => {
    expect(helpersSource).toContain('`add${prefix}File`');
    expect(helpersSource).toContain('id: context.state[nextIndexKey]');
    expect(helpersSource).toContain('ogFile: file');
    expect(helpersSource).toContain('name: file.name');
    expect(helpersSource).toContain('status: FILE_STATUS.initialized');
    expect(helpersSource).toContain('progress: 0');
    expect(helpersSource).toContain('output: { blob: null, name: null, url: null, config: null }');
  });

  test('generates addFiles action that adds files with delay', () => {
    expect(helpersSource).toContain('`add${prefix}Files`');
    expect(helpersSource).toContain('setTimeout(r, 16)');
  });

  test('generates processAllFiles action that marks files as waiting', () => {
    expect(helpersSource).toContain('`processAll${prefix}Files`');
    expect(helpersSource).toContain('FILE_STATUS.initialized');
    expect(helpersSource).toContain('status: FILE_STATUS.waiting');
  });

  test('generates processAllWaiting action with concurrency control', () => {
    expect(helpersSource).toContain('`processAllWaiting${prefix}`');
    expect(helpersSource).toContain('const slots = maxConcurrency');
    expect(helpersSource).toContain('FILE_STATUS.processing');
  });

  test('generates processFile action that posts to worker', () => {
    expect(helpersSource).toContain('`process${prefix}File`');
    expect(helpersSource).toContain("action: 'process'");
    expect(helpersSource).toContain('file: file.ogFile');
  });

  test('processFile deep-clones config before posting', () => {
    expect(helpersSource).toContain('JSON.parse(JSON.stringify(context.state[configKey]))');
  });

  test('on processed status, sets progress to 100', () => {
    expect(helpersSource).toContain('progress: 100');
  });

  test('dispatches processAllWaiting after a file finishes', () => {
    expect(helpersSource).toContain('context.dispatch(`processAllWaiting${prefix}`)');
  });
});

// ─── Store Integration ───────────────────────────────────────────────────────

describe('Store integration with helpers', () => {
  test('store imports createMediaMutations and createMediaActions', () => {
    expect(storeSource).toContain("import { createMediaMutations, createMediaActions }");
  });

  test('store imports all required workers', () => {
    expect(storeSource).toContain('AudioWorker');
    expect(storeSource).toContain('VideoWorker');
    expect(storeSource).toContain('DocWorker');
    expect(storeSource).toContain('ArchiveWorker');
    expect(storeSource).toContain('FontWorker');
  });

  test('store imports FILE_STATUS', () => {
    expect(storeSource).toContain("import { FILE_STATUS }");
  });
});

// ─── Format Definitions in Store ─────────────────────────────────────────────

describe('Store format definitions', () => {
  test('image formats array is defined', () => {
    expect(storeSource).toContain('formats: [');
  });

  test('audio formats array is defined', () => {
    expect(storeSource).toContain('audioFormats: [');
  });

  test('video formats array is defined', () => {
    expect(storeSource).toContain('videoFormats: [');
  });

  test('document formats array is defined', () => {
    expect(storeSource).toContain('documentFormats: [');
  });

  test('archive formats array is defined', () => {
    expect(storeSource).toContain('archiveFormats: [');
  });

  test('font formats array is defined', () => {
    expect(storeSource).toContain('fontFormats: [');
  });

  test('each format has name, extension, title, and description', () => {
    // Check a sample format from each type
    const formats = ['jpg', 'mp3', 'mp4', 'markdown', 'zip', 'ttf'];
    formats.forEach(fmt => {
      expect(storeSource).toContain(`name: '${fmt}'`);
    });
  });

  test('format extension matches name (bug check - exr should not be ext)', () => {
    // The exr format had a bug where extension was 'ext' instead of 'exr'
    const exrMatch = storeSource.match(/name:\s*'exr'[\s\S]*?extension:\s*'([^']+)'/);
    expect(exrMatch).not.toBeNull();
    expect(exrMatch[1]).toBe('exr');
  });
});
