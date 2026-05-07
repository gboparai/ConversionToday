const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const copies = [
  {
    src: path.join(root, 'node_modules', 'pandoc-wasm', 'src', 'pandoc.wasm'),
    dest: path.join(root, 'public', 'vendor', 'pandoc', 'pandoc.wasm'),
  },

  {
    src: path.join(root, 'node_modules', '@ffmpeg', 'ffmpeg', 'dist', 'umd', 'ffmpeg.js'),
    dest: path.join(root, 'public', 'vendor', 'ffmpeg', 'ffmpeg.js'),
  },
  {
    src: path.join(root, 'node_modules', '@ffmpeg', 'ffmpeg', 'dist', 'esm', 'worker.js'),
    dest: path.join(root, 'public', 'vendor', 'ffmpeg', 'worker.js'),
  },
  {
    src: path.join(root, 'node_modules', '@ffmpeg', 'ffmpeg', 'dist', 'esm', 'const.js'),
    dest: path.join(root, 'public', 'vendor', 'ffmpeg', 'const.js'),
  },
  {
    src: path.join(root, 'node_modules', '@ffmpeg', 'ffmpeg', 'dist', 'esm', 'errors.js'),
    dest: path.join(root, 'public', 'vendor', 'ffmpeg', 'errors.js'),
  },
  {
    src: path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'umd', 'ffmpeg-core.js'),
    dest: path.join(root, 'public', 'vendor', 'ffmpeg-core', 'ffmpeg-core.js'),
  },
  {
    src: path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'umd', 'ffmpeg-core.wasm'),
    dest: path.join(root, 'public', 'vendor', 'ffmpeg-core', 'ffmpeg-core.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm', 'ffmpeg-core.js'),
    dest: path.join(root, 'public', 'vendor', 'ffmpeg-core-esm', 'ffmpeg-core.js'),
  },
  {
    src: path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm', 'ffmpeg-core.wasm'),
    dest: path.join(root, 'public', 'vendor', 'ffmpeg-core-esm', 'ffmpeg-core.wasm'),
  },
  {
    src: path.join(root, 'node_modules', 'libarchive.js', 'dist', 'libarchive.js'),
    dest: path.join(root, 'public', 'vendor', 'libarchive', 'libarchive.js'),
  },
  {
    src: path.join(root, 'node_modules', 'libarchive.js', 'dist', 'worker-bundle.js'),
    dest: path.join(root, 'public', 'vendor', 'libarchive', 'worker-bundle.js'),
  },
  {
    src: path.join(root, 'node_modules', 'libarchive.js', 'dist', 'libarchive.wasm'),
    dest: path.join(root, 'public', 'vendor', 'libarchive', 'libarchive.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '7z-wasm', '7zz.es6.js'),
    dest: path.join(root, 'public', 'vendor', '7z', '7zz.es6.js'),
  },
  {
    src: path.join(root, 'node_modules', '7z-wasm', '7zz.wasm'),
    dest: path.join(root, 'public', 'vendor', '7z', '7zz.wasm'),
  },
  {
    src: path.join(root, 'node_modules', 'fonteditor-core', 'woff2', 'woff2.wasm'),
    dest: path.join(root, 'public', 'vendor', 'fonteditor', 'woff2.wasm'),
  },
];

const optionalCopies = [
  {
    src: path.join(root, 'node_modules', 'fontforge-wasm', 'dist', 'fontforge.js'),
    dest: path.join(root, 'public', 'vendor', 'fontforge', 'fontforge.js'),
  },
  {
    src: path.join(root, 'node_modules', 'fontforge-wasm', 'dist', 'fontforge.wasm'),
    dest: path.join(root, 'public', 'vendor', 'fontforge', 'fontforge.wasm'),
  },
];

for (const { src, dest } of copies) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source file: ${src}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

for (const { src, dest } of optionalCopies) {
  if (!fs.existsSync(src)) {
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

console.log('Synced local FFmpeg and Pandoc assets to public/vendor.');
