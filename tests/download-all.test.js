/**
 * Download All Functionality Tests
 *
 * Verifies that the downloadAll feature in various views
 * correctly implements an asynchronous delay between downloads
 * to prevent browsers from blocking multiple simultaneous downloads.
 */
/* eslint-env jest */

const fs = require('fs');
const path = require('path');

const VIEWS_DIR = path.resolve(__dirname, '../src/views');

describe('downloadAll functionality', () => {
  const viewsWithDownloadAll = [
    'Compression.vue',
    'Convert.vue',
    'Ocr.vue',
    'PdfImage.vue'
  ];

  test.each(viewsWithDownloadAll)('%s implements async downloadAll with a delay', (file) => {
    const filePath = path.join(VIEWS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Ensure the file contains the downloadAll method declaration
    expect(content).toMatch(/async\s+downloadAll\s*\(\)\s*\{/);
    
    // Ensure it uses a delay of 300ms using setTimeout to prevent browser blocking
    expect(content).toMatch(/await\s+new\s+Promise\s*\(\s*\(\s*resolve\s*\)\s*=>\s*setTimeout\s*\(\s*resolve\s*,\s*300\s*\)\s*\)/);
    
    // Ensure it does NOT use .forEach which would execute synchronously and trigger limits
    // In downloadAll context, we want to ensure it's not doing this.processed.forEach(...)
    // A regex check might be tricky since the file has other forEach loops,
    // but we can check that it has a for...of loop in the downloadAll method.
    
    // Extract the downloadAll method body roughly
    const match = content.match(/async\s+downloadAll\s*\(\)\s*\{([\s\S]*?)\n\s*\},/);
    if (match) {
      const methodBody = match[1];
      expect(methodBody).not.toMatch(/\.forEach/);
      expect(methodBody).toMatch(/for\s*\(\s*(const|let)\s+.*?\s+of\s+.*?\)/);
    }
  });
});
