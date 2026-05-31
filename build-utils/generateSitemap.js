const fs = require('fs');
const path = require('path');
const { generatePrerenderRoutes } = require('./generatePrerenderRoutes');

const baseUrl = (process.env.SITEMAP_BASE_URL || 'https://nolimitconverter.com').replace(/\/+$/, '');
const lastModified = new Date().toISOString().split('T')[0];
const staticRoutes = ['/', '/about', '/FAQ', '/compression', '/merge', '/compress'];

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemapXml() {
  const routes = Array.from(new Set([...staticRoutes, ...generatePrerenderRoutes()])).sort();
  const urlEntries = routes.map((route) => {
    const loc = `${baseUrl}${route === '/' ? '' : route}`;
    return [
      '<url>',
      `  <loc>${escapeXml(loc)}</loc>`,
      '  <priority>1.0</priority>',
      '  <changefreq>monthly</changefreq>',
      `  <lastmod>${lastModified}</lastmod>`,
      '</url>'
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlEntries,
    '</urlset>',
    ''
  ].join('\n');
}

function writeSitemap() {
  const sitemapPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
  const sitemapXml = generateSitemapXml();
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  console.log(`Generated sitemap at ${sitemapPath}`);
}

if (require.main === module) {
  writeSitemap();
}

module.exports = { generateSitemapXml, writeSitemap };
