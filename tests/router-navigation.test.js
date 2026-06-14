/**
 * Router & Navigation Tests for NoLimitConverter
 *
 * Verifies that all routes are properly configured, each page has
 * a valid component reference, and navigation paths are consistent.
 */
/* eslint-env jest */

const fs = require('fs');
const path = require('path');

const ROUTER_PATH = path.resolve(__dirname, '../src/router/index.js');
const VIEWS_DIR = path.resolve(__dirname, '../src/views');

let routerSource;

beforeAll(() => {
  routerSource = fs.readFileSync(ROUTER_PATH, 'utf8');
});

// ─── Route Definitions ───────────────────────────────────────────────────────

describe('Router route definitions', () => {
  test('router file exists and exports a router', () => {
    expect(routerSource).toContain('createRouter');
    expect(routerSource).toContain('export default router');
  });

  test('all defined route paths are valid URL patterns', () => {
    const paths = [...routerSource.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach(p => {
      expect(p).toMatch(/^\/[a-zA-Z0-9/:_-]*$/);
    });
  });

  test('all static pages have route entries', () => {
    const expectedPaths = ['/', '/FAQ', '/about'];
    expectedPaths.forEach(p => {
      expect(routerSource).toContain(`path: '${p}'`);
    });
  });

  test('each media type has home, format, and conversion routes', () => {
    const mediaTypes = ['image', 'audio', 'video', 'document', 'archive', 'font', 'subtitle'];
    mediaTypes.forEach(type => {
      expect(routerSource).toContain(`'/${type}'`);
      expect(routerSource).toContain(`'/${type}/:format'`);
      expect(routerSource).toContain(`'/${type}/:format/:format2'`);
    });
  });

  test('OCR routes are defined', () => {
    expect(routerSource).toContain("'/ocr'");
    expect(routerSource).toContain("'/ocr/:outputFormat'");
    expect(routerSource).toContain("'/ocr/:inputFormat/:outputFormat'");
  });

  test('PDF-Image routes are defined', () => {
    expect(routerSource).toContain("'/pdf-image'");
    expect(routerSource).toContain("'/pdf-image/:format'");
    expect(routerSource).toContain("'/pdf-image/:format/:format2'");
  });

  test('Metadata Remover routes are defined', () => {
    expect(routerSource).toContain("'/metadata-remover'");
    expect(routerSource).toContain("'/metadata-remover/:format'");
  });

  test('PDF-Split route is defined', () => {
    expect(routerSource).toContain("'/pdf-split'");
    expect(routerSource).toContain("'PdfSplit'");
  });

  test('PDF-Password routes are defined', () => {
    expect(routerSource).toContain("'/pdf-password'");
    expect(routerSource).toContain("'/pdf-password/:mode'");
    expect(routerSource).toContain("'PdfPassword'");
  });

  test('compression routes are defined', () => {
    expect(routerSource).toContain("'/compression'");
    expect(routerSource).toContain("'/compression/:format'");
  });

  test('merge routes are defined', () => {
    expect(routerSource).toContain("'/merge'");
    expect(routerSource).toContain("'/merge/:family/:format'");
  });

  test('compress routes are defined', () => {
    expect(routerSource).toContain("'/compress'");
    expect(routerSource).toContain("'/compress/:format'");
  });
});

// ─── Component Imports ───────────────────────────────────────────────────────

describe('Router component imports', () => {
  test('all imported view components exist as .vue files', () => {
    const imports = [...routerSource.matchAll(/import\(['"]\.\.\/views\/([^'"]+)['"]\)/g)].map(m => m[1]);
    imports.forEach(file => {
      const filePath = path.join(VIEWS_DIR, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('lazy-loaded components use dynamic import syntax', () => {
    // All component assignments should use () => import(...)
    const componentAssignments = [...routerSource.matchAll(/const\s+\w+\s*=\s*\(\)\s*=>\s*import\(/g)];
    expect(componentAssignments.length).toBeGreaterThan(10);
  });

  test('all named route components have matching imported constants', () => {
    const componentNames = [...routerSource.matchAll(/component:\s*(\w+)/g)].map(m => m[1]);
    const importedNames = [...routerSource.matchAll(/const\s+(\w+)\s*=/g)].map(m => m[1]);
    componentNames.forEach(name => {
      expect(importedNames).toContain(name);
    });
  });
});

// ─── Navigation Consistency ─────────────────────────────────────────────────

describe('Navigation consistency', () => {
  test('LandingHome links match defined routes', () => {
    const landingSource = fs.readFileSync(path.join(VIEWS_DIR, 'LandingHome.vue'), 'utf8');
    const hrefLinks = [...landingSource.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    const routerPaths = [...routerSource.matchAll(/path:\s*'([^']+)'/g)].map(m => m[1]);

    // Each href should match a route path pattern (static ones)
    const staticRoutes = routerPaths.filter(p => !p.includes(':'));
    hrefLinks.forEach(link => {
      // Dynamic links (with runtime values) are excluded
      if (link.includes('{{') || link.startsWith('http')) return;
      expect(staticRoutes).toContain(link);
    });
  });

  test('all route names are unique', () => {
    const names = [...routerSource.matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  test('no duplicate path definitions', () => {
    const paths = [...routerSource.matchAll(/path:\s*'([^']+)'/g)].map(m => m[1]);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  test('OCR redirect route properly redirects', () => {
    // The redirect should convert /ocr/:outputFormat -> /ocr/image/:outputFormat
    expect(routerSource).toContain("redirect: to => `/ocr/image/${to.params.outputFormat}`");
  });
});

// ─── View Files Integrity ────────────────────────────────────────────────────

describe('View files integrity', () => {
  const viewFiles = fs.readdirSync(VIEWS_DIR).filter(f => f.endsWith('.vue'));

  test('all view files contain a <template> section', () => {
    viewFiles.forEach(file => {
      const content = fs.readFileSync(path.join(VIEWS_DIR, file), 'utf8');
      expect(content).toContain('<template>');
    });
  });

  test('all view files contain a <script> section', () => {
    viewFiles.forEach(file => {
      const content = fs.readFileSync(path.join(VIEWS_DIR, file), 'utf8');
      expect(content).toContain('<script>');
    });
  });

  test('Convert.vue imports FILE_STATUS for button state management', () => {
    const convertSource = fs.readFileSync(path.join(VIEWS_DIR, 'Convert.vue'), 'utf8');
    expect(convertSource).toContain("import { FILE_STATUS }");
  });

  test('Convert.vue has process, downloadAll, downloadZip, and clearAll methods', () => {
    const convertSource = fs.readFileSync(path.join(VIEWS_DIR, 'Convert.vue'), 'utf8');
    expect(convertSource).toContain('process()');
    expect(convertSource).toContain('downloadAll()');
    expect(convertSource).toContain('downloadZip()');
    expect(convertSource).toContain('clearAll()');
  });

  test('file-picker.vue has drag-and-drop event handlers', () => {
    const pickerSource = fs.readFileSync(path.join(__dirname, '../src/components/file-picker.vue'), 'utf8');
    expect(pickerSource).toContain('fileDrop');
    expect(pickerSource).toContain('fileOver');
    expect(pickerSource).toContain('fileEnter');
    expect(pickerSource).toContain('fileLeave');
  });

  test('file-picker.vue registers and cleans up body event listeners', () => {
    const pickerSource = fs.readFileSync(path.join(__dirname, '../src/components/file-picker.vue'), 'utf8');
    expect(pickerSource).toContain('addEventListener("drop"');
    expect(pickerSource).toContain('addEventListener("dragover"');
    expect(pickerSource).toContain('addEventListener("dragenter"');
    expect(pickerSource).toContain('addEventListener("dragleave"');
    expect(pickerSource).toContain('removeEventListener("drop"');
    expect(pickerSource).toContain('removeEventListener("dragover"');
    expect(pickerSource).toContain('removeEventListener("dragenter"');
    expect(pickerSource).toContain('removeEventListener("dragleave"');
  });
});
