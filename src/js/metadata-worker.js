import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

async function processPDF(buffer) {
  const pdfDoc = await PDFDocument.load(buffer);
  
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");
  pdfDoc.setCreationDate(new Date(0));
  pdfDoc.setModificationDate(new Date(0));
  
  const bytes = await pdfDoc.save();
  return bytes;
}

async function processArchiveDoc(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  
  // Helper to clear text inside specific tags without deleting the file
  const clearTags = async (path, tags) => {
    const file = zip.file(path);
    if (file) {
      let str = await file.async("string");
      tags.forEach(tag => {
        const regex = new RegExp(`(<${tag}[^>]*>)[\\s\\S]*?(<\\/${tag}>)`, 'gi');
        str = str.replace(regex, `$1$2`);
      });
      zip.file(path, str);
    }
  };

  // Helper to set specific values inside tags
  const setTags = async (path, tagValues) => {
    const file = zip.file(path);
    if (file) {
      let str = await file.async("string");
      Object.keys(tagValues).forEach(tag => {
        const regex = new RegExp(`(<${tag}[^>]*>)[\\s\\S]*?(<\\/${tag}>)`, 'gi');
        str = str.replace(regex, `$1${tagValues[tag]}$2`);
      });
      zip.file(path, str);
    }
  };

  // Office OpenXML properties
  await clearTags("docProps/core.xml", ["dc:creator", "cp:lastModifiedBy", "dc:title", "dc:description", "dc:subject", "cp:keywords"]);
  await setTags("docProps/core.xml", {
    "dcterms:created": "1970-01-01T00:00:00Z",
    "dcterms:modified": "1970-01-01T00:00:00Z",
    "cp:lastPrinted": "1970-01-01T00:00:00Z",
    "cp:revision": "1"
  });
  await clearTags("docProps/app.xml", ["Company", "Manager"]);
  await setTags("docProps/app.xml", { "TotalTime": "0" });
  await clearTags("docProps/custom.xml", ["vt:lpwstr", "vt:i4", "vt:bool"]);
  
  // OpenDocument metadata
  await clearTags("meta.xml", ["meta:initial-creator", "dc:creator", "dc:title", "dc:description", "dc:subject", "meta:keyword"]);
  await setTags("meta.xml", {
    "meta:creation-date": "1970-01-01T00:00:00",
    "dc:date": "1970-01-01T00:00:00",
    "meta:editing-cycles": "1",
    "meta:editing-duration": "PT0S"
  });
  
  // EPUB metadata
  const containerXml = zip.file("META-INF/container.xml");
  if (containerXml) {
    const containerStr = await containerXml.async("string");
    const opfMatch = containerStr.match(/full-path="([^"]+\.opf)"/i);
    if (opfMatch) {
      const opfPath = opfMatch[1];
      const opfFile = zip.file(opfPath);
      if (opfFile) {
        let opfStr = await opfFile.async("string");
        const tagsToRemove = ['creator', 'contributor', 'publisher', 'rights', 'description', 'subject', 'source', 'relation', 'coverage'];
        tagsToRemove.forEach(tag => {
          const regex = new RegExp(`<dc:${tag}[^>]*>[\\s\\S]*?<\\/dc:${tag}>`, 'gi');
          opfStr = opfStr.replace(regex, '');
        });
        zip.file(opfPath, opfStr);
      }
    }
  }
  
  const newBytes = await zip.generateAsync({ type: "uint8array" });
  return newBytes;
}

self.onmessage = async (e) => {
  const { id, type, buffer } = e.data;
  try {
    let resultBuffer;
    if (type === 'processPDF') {
      resultBuffer = await processPDF(buffer);
    } else if (type === 'processArchiveDoc') {
      resultBuffer = await processArchiveDoc(buffer);
    } else {
      throw new Error("Unknown task type");
    }
    
    // Transfer buffer back to main thread for performance
    self.postMessage({ id, status: 'done', buffer: resultBuffer }, [resultBuffer.buffer]);
  } catch (error) {
    self.postMessage({ id, status: 'error', error: error.message });
  }
};
