/**
 * Generate prerender routes from media type format definitions.
 * This utility generates routes for all media types and their format combinations.
 * 
 * Route patterns generated:
 * - /                     (home)
 * - /TYPE                 (e.g., /image, /audio, /video, /document, /archive, /font)
 * - /TYPE/FORMAT          (e.g., /image/jpg, /audio/mp3, /archive/zip)
 * - /TYPE/FORMAT/TARGET   (e.g., /image/jpg/png, /audio/mp3/wav, /archive/zip/7z)
 */

/**
 * Define format lists for each media type.
 * This is the source of truth for available formats.
 */
const formatsByMediaType = {
  image: [
    'jpg', 'jpeg', 'png', 'tiff', 'webp', 'gif', 'bmp', 'svg', 'psd', 'ai',
    'eps', 'svgz', 'dcx', 'dds', 'dpx', 'exr', 'fits', 'jfif', 'jpc', 'jpe',
    'jps', 'jpm', 'jng', 'j2c', 'j2k', 'miff', 'mng', 'palm', 'pam', 'pbm',
    'pcd', 'pcds', 'pcl', 'pcx', 'pgm', 'ptif', 'p7', 'ras', 'sgi', 'sun',
    'tga', 'vda', 'vicar', 'viff', 'vips', 'wbmp', 'xbm', 'xpm', 'xv'
  ],
  audio: [
    'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'webm', 'wma', 'alac', 'ape'
  ],
  video: [
    'mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', '3gp', 'mpeg', 'm3u8', 'ts', 'ogv'
  ],
  document: [
    'markdown', 'gfm', 'commonmark', 'html', 'docx', 'odt', 'rst', 'latex',
    'org', 'mediawiki', 'textile', 'asciidoc', 'epub', 'rtf', 'ipynb', 'jira',
    'json', 'typst', 'docbook', 'opml', 'fb2', 'muse', 'djot', 'native', 'man',
    'bibtex', 'biblatex', 'csl-json', 'csl-yaml', 'dokuwiki', 'haddock',
    'creole', 'twiki', 'tikiwiki', 'vimwiki', 'ris', 'csv', 'tsv', 'xlsx',
    'pod', 'mdoc', 'txt2tags', 'endnote-xml', 'beamer', 'revealjs', 'slidy',
    'dzslides', 's5', 'pptx', 'plain', 'texinfo', 'context', 'icml', 'jats',
    'tei', 'ms', 'xwiki', 'zimwiki', 'bbcode', 'slideous', 'ansi', 'vimdoc',
    'markua', 'odt-xml'
  ],
  archive: [
    'zip', '7z', 'rar', 'tar', 'tar.gz', 'tar.bz2', 'tar.xz', 'iso'
  ],
  font: [
    'ttf', 'otf', 'woff', 'woff2', 'eot', 'svg'
  ]
};

const ocrOutputFormats = [
  'txt', 'docx', 'pdf', 'xlsx', 'csv', 'epub', 'rtf', 'odt', 'html',
  'markdown', 'rst', 'latex', 'org', 'asciidoc', 'mediawiki', 'textile',
  'docbook', 'fb2', 'tsv', 'ods'
];

/**
 * Generate all prerender routes for the application.
 * @returns {string[]} Array of route paths
 */
function generatePrerenderRoutes() {
  const routes = ['/'];

  Object.entries(formatsByMediaType).forEach(([mediaType, formats]) => {
    // Add media type root route (e.g., /image, /audio)
    routes.push(`/${mediaType}`);

    // Add format routes and format-to-format conversion routes
    formats.forEach(fromFormat => {
      routes.push(`/${mediaType}/${fromFormat}`);

      formats.forEach(toFormat => {
        routes.push(`/${mediaType}/${fromFormat}/${toFormat}`);
      });
    });
  });

  // OCR routes
  routes.push('/ocr');
  ocrOutputFormats.forEach(fmt => routes.push(`/ocr/${fmt}`));

  // PDF ↔ Image routes
  const pdfImageInputs = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
  const pdfImageOutputsByInput = {
    pdf:  ['png', 'jpg', 'jpeg', 'webp'],
    jpg:  ['pdf'],
    jpeg: ['pdf'],
    png:  ['pdf'],
    webp: ['pdf'],
  };
  routes.push('/pdf-image');
  pdfImageInputs.forEach(input => {
    routes.push(`/pdf-image/${input}`);
    pdfImageOutputsByInput[input].forEach(output => {
      routes.push(`/pdf-image/${input}/${output}`);
    });
  });

  // Metadata Remover routes
  routes.push('/metadata-remover');
  ['image', 'video', 'audio', 'document'].forEach(mediaType => {
    if (formatsByMediaType[mediaType]) {
      formatsByMediaType[mediaType].forEach(format => {
        const route = `/metadata-remover/${format}`;
        if (!routes.includes(route)) {
          routes.push(route);
        }
      });
    }
  });

  return routes;
}

module.exports = { generatePrerenderRoutes, formatsByMediaType };
