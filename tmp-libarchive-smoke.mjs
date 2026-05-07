(async () => {
  const { Archive, ArchiveFormat, ArchiveCompression } = await import('./node_modules/libarchive.js/dist/libarchive-node.mjs');

  const input = new Blob([Buffer.from('hello-world')]);
  const files = [{ file: input, pathname: 'hello.txt' }];

  const targets = [
    { ext: 'cpio', format: ArchiveFormat.CPIO },
    { ext: 'ar', format: ArchiveFormat.AR },
    { ext: 'argnu', format: ArchiveFormat.ARGNU },
    { ext: 'tar', format: ArchiveFormat.GNUTAR },
  ];

  for (const t of targets) {
    try {
      const out = await Archive.write({
        files,
        outputFileName: `smoke.${t.ext}`,
        compression: ArchiveCompression.NONE,
        format: t.format,
        passphrase: null,
      });
      console.log(`${t.ext}: ok size=${out.size}`);
    } catch (e) {
      console.log(`${t.ext}: fail ${e && e.message ? e.message : e}`);
    }
  }
})();
