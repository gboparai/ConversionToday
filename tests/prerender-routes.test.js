/* eslint-env jest */

const { generatePrerenderRoutes, formatsByMediaType } = require('../build-utils/generatePrerenderRoutes');

const OCR_OUTPUT_FORMATS = [
  'txt', 'docx', 'pdf', 'xlsx', 'csv', 'epub', 'rtf', 'odt', 'html',
  'markdown', 'rst', 'latex', 'org', 'asciidoc', 'mediawiki', 'textile',
  'docbook', 'fb2', 'tsv', 'ods',
];

const PDF_IMAGE_OUTPUTS_BY_INPUT = {
  pdf: ['png', 'jpg', 'jpeg', 'webp'],
  jpg: ['pdf'],
  jpeg: ['pdf'],
  png: ['pdf'],
  webp: ['pdf'],
};

describe('Prerender route generation', () => {
  test('returns unique absolute routes', () => {
    const routes = generatePrerenderRoutes();
    const unique = new Set(routes);

    expect(unique.size).toBe(routes.length);
    routes.forEach((route) => {
      expect(route.startsWith('/')).toBe(true);
    });
  });

  test('includes root and media type base routes', () => {
    const routes = generatePrerenderRoutes();

    expect(routes).toContain('/');
    Object.keys(formatsByMediaType).forEach((mediaType) => {
      expect(routes).toContain(`/${mediaType}`);
    });
    expect(routes).toContain('/ocr');
    expect(routes).toContain('/pdf-image');
  });

  test('includes all media format and conversion pair routes', () => {
    const routes = generatePrerenderRoutes();

    Object.entries(formatsByMediaType).forEach(([mediaType, formats]) => {
      formats.forEach((fromFormat) => {
        expect(routes).toContain(`/${mediaType}/${fromFormat}`);
        formats.forEach((toFormat) => {
          expect(routes).toContain(`/${mediaType}/${fromFormat}/${toFormat}`);
        });
      });
    });
  });

  test('includes OCR and PDF-image routes', () => {
    const routes = generatePrerenderRoutes();

    OCR_OUTPUT_FORMATS.forEach((outputFormat) => {
      expect(routes).toContain(`/ocr/${outputFormat}`);
    });

    Object.entries(PDF_IMAGE_OUTPUTS_BY_INPUT).forEach(([input, outputs]) => {
      expect(routes).toContain(`/pdf-image/${input}`);
      outputs.forEach((output) => {
        expect(routes).toContain(`/pdf-image/${input}/${output}`);
      });
    });
  });

  test('matches expected route count', () => {
    const routes = generatePrerenderRoutes();

    const mediaTypeRouteCount = Object.values(formatsByMediaType)
      .reduce((total, formats) => total + 1 + formats.length + (formats.length * formats.length), 0);
    const ocrRouteCount = 1 + OCR_OUTPUT_FORMATS.length;
    const pdfImageRouteCount = 1 + Object.entries(PDF_IMAGE_OUTPUTS_BY_INPUT)
      .reduce((total, [, outputs]) => total + 1 + outputs.length, 0);

    const expectedRouteCount = 1 + mediaTypeRouteCount + ocrRouteCount + pdfImageRouteCount;
    expect(routes).toHaveLength(expectedRouteCount);
  });
});
