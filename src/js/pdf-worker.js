import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { decryptPDF, isEncrypted } from '@pdfsmaller/pdf-decrypt';

// Helper to handle progress reports
function emitProgress(id, fraction, message) {
  postMessage({
    status: 'progress',
    id,
    progress: Math.round(fraction * 100),
    message: message || '',
  });
}

async function splitPdf(id, buffer, splitMode, pageRange) {
  const srcDoc = await PDFDocument.load(buffer);
  const totalPages = srcDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error('The PDF has no pages.');
  }

  const pages = [];
  const zip = new JSZip();

  let groups = [];
  if (splitMode === 'all') {
    for (let i = 0; i < totalPages; i++) {
      groups.push({ label: String(i + 1), pages: [i + 1] });
    }
  } else {
    // We expect pageRange to already be parsed into groups by the main thread
    groups = pageRange;
    if (!groups || groups.length === 0) {
      throw new Error('No valid pages selected based on your range.');
    }
  }

  const count = groups.length;
  for (let idx = 0; idx < count; idx++) {
    const group = groups[idx];
    const zeroIndexedPages = group.pages.map(p => p - 1);

    emitProgress(id, (idx / count) * 0.9, `Extracting ${group.label} (${idx + 1} of ${count})…`);

    const pageDoc = await PDFDocument.create();
    const copiedPages = await pageDoc.copyPages(srcDoc, zeroIndexedPages);
    copiedPages.forEach(p => pageDoc.addPage(p));
    
    const pageBytes = await pageDoc.save();
    
    const prefix = group.pages.length > 1 ? 'pages' : 'page';
    const paddedLabel = group.pages.length === 1 
      ? String(group.pages[0]).padStart(String(totalPages).length, '0')
      : group.label;
    const name = `split-${prefix}-${paddedLabel}.pdf`;

    pages.push({ name, buffer: pageBytes });
    zip.file(name, pageBytes);
  }

  emitProgress(id, 0.95, 'Packaging ZIP…');

  const zipBytes = await zip.generateAsync({ type: 'uint8array' });
  return { zipBytes, pages, count };
}

async function encryptPdfData(buffer, userPassword, ownerPassword) {
  // @pdfsmaller/pdf-encrypt-lite uses buffer and options
  const options = {
    userPassword: userPassword,
    ownerPassword: ownerPassword || userPassword,
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false
    }
  };
  const encryptedBytes = await encryptPDF(buffer, options);
  return encryptedBytes;
}

async function decryptPdfData(buffer, password) {
  if (!isEncrypted(buffer)) {
    const pdfDoc = await PDFDocument.load(buffer);
    return await pdfDoc.save();
  }

  const decryptedBytes = await decryptPDF(buffer, password);
  const pdfDoc = await PDFDocument.load(decryptedBytes, { ignoreEncryption: true });
  return await pdfDoc.save();
}

self.onmessage = async (e) => {
  const { id, type, buffer, splitMode, pageRange, userPassword, ownerPassword } = e.data;
  try {
    if (type === 'split') {
      const result = await splitPdf(id, buffer, splitMode, pageRange);
      // Transfer the main zip bytes and the individual page buffers
      const transferList = [result.zipBytes.buffer];
      result.pages.forEach(p => transferList.push(p.buffer.buffer));
      self.postMessage({ id, status: 'done', ...result }, transferList);
      
    } else if (type === 'encrypt') {
      const encryptedBytes = await encryptPdfData(buffer, userPassword, ownerPassword);
      self.postMessage({ id, status: 'done', buffer: encryptedBytes }, [encryptedBytes.buffer]);
      
    } else if (type === 'decrypt') {
      const decryptedBytes = await decryptPdfData(buffer, userPassword);
      self.postMessage({ id, status: 'done', buffer: decryptedBytes }, [decryptedBytes.buffer]);
      
    } else {
      throw new Error("Unknown task type");
    }
  } catch (error) {
    self.postMessage({ id, status: 'error', error: error.message });
  }
};
