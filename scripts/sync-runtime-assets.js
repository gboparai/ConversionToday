const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const legacyRootJsquashWasm = [
  'mozjpeg_dec.wasm',
  'mozjpeg_enc.wasm',
  'squoosh_png_bg.wasm',
  'webp_dec.wasm',
  'webp_enc.wasm',
  'webp_enc_simd.wasm',
  'avif_dec.wasm',
  'avif_enc.wasm',
  'avif_enc_mt.wasm',
];

const copies = [
  {
    src: path.join(root, 'node_modules', 'pandoc-wasm', 'src', 'pandoc.wasm'),
    dest: path.join(root, 'public', 'vendor', 'pandoc', 'pandoc.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@myriaddreamin', 'typst-ts-web-compiler', 'pkg', 'typst_ts_web_compiler_bg.wasm'),
    dest: path.join(root, 'public', 'vendor', 'typst', 'typst_ts_web_compiler_bg.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@myriaddreamin', 'typst-ts-web-compiler', 'pkg', 'typst_ts_web_compiler.mjs'),
    dest: path.join(root, 'public', 'vendor', 'typst', 'typst_ts_web_compiler.mjs'),
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

  // jsquash codec wasm files (kept in a dedicated vendor subdirectory).
  {
    src: path.join(root, 'node_modules', '@jsquash', 'jpeg', 'codec', 'dec', 'mozjpeg_dec.wasm'),
    dest: path.join(root, 'public', 'vendor', 'jsquash', 'mozjpeg_dec.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@jsquash', 'jpeg', 'codec', 'enc', 'mozjpeg_enc.wasm'),
    dest: path.join(root, 'public', 'vendor', 'jsquash', 'mozjpeg_enc.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@jsquash', 'png', 'codec', 'pkg', 'squoosh_png_bg.wasm'),
    dest: path.join(root, 'public', 'vendor', 'jsquash', 'squoosh_png_bg.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@jsquash', 'webp', 'codec', 'dec', 'webp_dec.wasm'),
    dest: path.join(root, 'public', 'vendor', 'jsquash', 'webp_dec.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@jsquash', 'webp', 'codec', 'enc', 'webp_enc.wasm'),
    dest: path.join(root, 'public', 'vendor', 'jsquash', 'webp_enc.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@jsquash', 'webp', 'codec', 'enc', 'webp_enc_simd.wasm'),
    dest: path.join(root, 'public', 'vendor', 'jsquash', 'webp_enc_simd.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@jsquash', 'avif', 'codec', 'dec', 'avif_dec.wasm'),
    dest: path.join(root, 'public', 'vendor', 'jsquash', 'avif_dec.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@jsquash', 'avif', 'codec', 'enc', 'avif_enc.wasm'),
    dest: path.join(root, 'public', 'vendor', 'jsquash', 'avif_enc.wasm'),
  },
  {
    src: path.join(root, 'node_modules', '@jsquash', 'avif', 'codec', 'enc', 'avif_enc_mt.wasm'),
    dest: path.join(root, 'public', 'vendor', 'jsquash', 'avif_enc_mt.wasm'),
  },
];

for (const fileName of legacyRootJsquashWasm) {
  const legacyPath = path.join(root, 'public', fileName);
  if (fs.existsSync(legacyPath)) {
    fs.unlinkSync(legacyPath);
  }
}

for (const { src, dest } of copies) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source file: ${src}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

console.log('Synced local FFmpeg, Pandoc, and Typst assets to public/vendor.');
