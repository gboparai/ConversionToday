/**
 * Generate prerender routes from media type format definitions.
 * This utility generates routes for all media types and their format combinations.
 * 
 * Route patterns generated:
 * - /                     (home)
 * - /TYPE                 (e.g., /image, /audio, /video, /document)
 * - /TYPE/FORMAT          (e.g., /image/jpg, /audio/mp3)
 * - /TYPE/FORMAT/TARGET   (e.g., /image/jpg/png, /audio/mp3/wav)
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
  ]
};

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

  return routes;
}

module.exports = { generatePrerenderRoutes, formatsByMediaType };
