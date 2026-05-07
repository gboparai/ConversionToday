import { createPandocInstance } from 'pandoc-wasm/src/core.js';
import * as XLSX from '@e965/xlsx';

let pandocPromise = null;
let processQueue = Promise.resolve();
let typstPromise = null;

const SPREADSHEET_FORMATS = new Set(['xlsx', 'xls', 'ods', 'csv', 'tsv']);
const SPREADSHEET_MIME_TYPES = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
};
const SHEETJS_BOOK_TYPES = {
    xlsx: 'xlsx',
    xls: 'biff8',
};
const TYPST_DIAGNOSTICS_FORMAT_NONE = 0;

function getPandoc() {
    if (!pandocPromise) {
        pandocPromise = fetch(`${self.location.origin}/vendor/pandoc/pandoc.wasm`)
            .then(r => {
                if (!r.ok) throw new Error(`Failed to fetch pandoc.wasm: ${r.status}`);
                return r.arrayBuffer();
            })
            .then(binary => createPandocInstance(binary));
    }
    return pandocPromise;
}

function isSpreadsheetFormat(formatName) {
    return SPREADSHEET_FORMATS.has(formatName);
}

function getMimeTypeForFormat(formatName, fallback = 'application/octet-stream') {
    return SPREADSHEET_MIME_TYPES[formatName] || fallback;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function tableToHtmlFromRows(rows) {
    if (!rows.length) {
        return '<table><tbody><tr><td></td></tr></tbody></table>';
    }
    const [header, ...body] = rows;
    const thead = `<thead><tr>${header.map(cell => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>`;
    const tbodyRows = body.map(
        row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
    );
    const tbody = `<tbody>${tbodyRows.join('')}</tbody>`;
    return `<table>${thead}${tbody}</table>`;
}

function workbookToHtml(workbook) {
    const sections = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
        return `<section><h2>${escapeHtml(sheetName)}</h2>${tableToHtmlFromRows(rows)}</section>`;
    });
    return `<!doctype html><html><head><meta charset="utf-8"></head><body>${sections.join('\n')}</body></html>`;
}

async function spreadsheetBlobToWorkbook(blob) {
    const buffer = await blob.arrayBuffer();
    return XLSX.read(buffer, { type: 'array', cellDates: true });
}

function workbookToSpreadsheetBlob(workbook, outputFormat) {
    if (outputFormat === 'csv' || outputFormat === 'tsv') {
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) throw new Error('Spreadsheet has no sheets');
        const firstSheet = workbook.Sheets[firstSheetName];
        const text = XLSX.utils.sheet_to_csv(firstSheet, {
            FS: outputFormat === 'tsv' ? '\t' : ',',
        });
        return new Blob([text], { type: getMimeTypeForFormat(outputFormat, 'text/plain') });
    }

    const bookType = SHEETJS_BOOK_TYPES[outputFormat];
    if (!bookType && outputFormat !== 'ods') {
        throw new Error(`Unsupported spreadsheet output format: ${outputFormat}`);
    }
    const out = XLSX.write(workbook, { type: 'array', bookType: bookType || outputFormat });
    return new Blob([out], { type: getMimeTypeForFormat(outputFormat) });
}

function workbookFromHtml(html) {
    return XLSX.read(html, { type: 'string', cellDates: true });
}

async function convertWithPandoc(inputBlob, fromName, toName, fromExt, toExt, mimeType) {
    const pandoc = await getPandoc();
    const inputFileName = `input.${fromExt}`;
    const outputFileName = `output.${toExt}`;
    const options = {
        from: fromName,
        to: toName,
        'output-file': outputFileName,
        'input-files': [inputFileName],
    };
    const result = await pandoc.convert(options, null, { [inputFileName]: inputBlob });
    let outputBlob = result.files[outputFileName];
    if (!outputBlob || (outputBlob instanceof Blob && outputBlob.size === 0)) {
        if (result.stdout && result.stdout.length > 0) {
            outputBlob = new Blob([result.stdout], { type: mimeType || 'text/plain' });
        }
    }
    if (!outputBlob || (outputBlob instanceof Blob && outputBlob.size === 0)) {
        throw new Error(`Pandoc returned empty output for ${fromName}->${toName}`);
    }
    return outputBlob;
}

async function getTypstModule() {
    if (!typstPromise) {
        typstPromise = (async () => {
            const moduleUrl = `${self.location.origin}/vendor/typst/typst_ts_web_compiler.mjs`;
            const wasmUrl = `${self.location.origin}/vendor/typst/typst_ts_web_compiler_bg.wasm`;
            const typstModule = await import(/* webpackIgnore: true */ moduleUrl);
            const wasmResponse = await fetch(wasmUrl);
            if (!wasmResponse.ok) {
                throw new Error(`Failed to fetch Typst wasm: ${wasmResponse.status}`);
            }
            const wasmBinary = await wasmResponse.arrayBuffer();
            await typstModule.default({ module_or_path: wasmBinary });
            return typstModule;
        })();
    }
    return typstPromise;
}

async function convertTypstToPdf(typstBlob) {
    const typstModule = await getTypstModule();
    const source = await typstBlob.text();
    const builder = new typstModule.TypstCompilerBuilder();
    builder.set_dummy_access_model();
    const compiler = await builder.build();
    const mainPath = '/main.typ';
    compiler.add_source(mainPath, source);
    const pdfBytes = compiler.compile(mainPath, null, 'pdf', TYPST_DIAGNOSTICS_FORMAT_NONE);
    if (!pdfBytes || !pdfBytes.length) {
        throw new Error('Typst returned empty PDF output');
    }
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function convertDocumentWithIntermediates(file, config) {
    const outputFormat = config.format.name;
    const inputFormat = config.inputFormat.name;
    const outputExt = config.format.extension;
    const inputExt = config.inputFormat.extension;

    if (outputFormat === 'pdf') {
        if (inputFormat === 'typst') {
            return convertTypstToPdf(file);
        }
        const typstBlob = await convertWithPandoc(
            file,
            inputFormat,
            'typst',
            inputExt,
            'typ',
            'text/plain'
        );
        return convertTypstToPdf(typstBlob);
    }

    const inputIsSpreadsheet = isSpreadsheetFormat(inputFormat);
    const outputIsSpreadsheet = isSpreadsheetFormat(outputFormat);

    if (inputIsSpreadsheet && outputIsSpreadsheet) {
        const workbook = await spreadsheetBlobToWorkbook(file);
        return workbookToSpreadsheetBlob(workbook, outputFormat);
    }

    if (inputIsSpreadsheet) {
        const workbook = await spreadsheetBlobToWorkbook(file);
        const html = workbookToHtml(workbook);
        const htmlBlob = new Blob([html], { type: 'text/html' });
        if (outputFormat === 'html') return htmlBlob;
        return convertWithPandoc(
            htmlBlob,
            'html',
            outputFormat,
            'html',
            outputExt,
            config.format.mimeType
        );
    }

    if (outputIsSpreadsheet) {
        let htmlBlob = null;
        if (inputFormat === 'html') {
            htmlBlob = file;
        } else {
            htmlBlob = await convertWithPandoc(file, inputFormat, 'html', inputExt, 'html', 'text/html');
        }
        const html = await htmlBlob.text();
        const workbook = workbookFromHtml(html);
        return workbookToSpreadsheetBlob(workbook, outputFormat);
    }

    return convertWithPandoc(
        file,
        inputFormat,
        outputFormat,
        inputExt,
        outputExt,
        config.format.mimeType
    );
}

function emitProgress(id, fraction) {
    if (id === null || id === undefined) return;
    const safe = Math.max(0, Math.min(1, Number(fraction) || 0));
    postMessage({ status: 'progress', id, progress: Math.round(safe * 100) });
}

async function handleMessage(data) {
    const { action, file, config, id } = data;

    if (action === 'load') {
        // Pre-warm the pandoc instance
        try {
            await getPandoc();
            postMessage({ status: 'loaded' });
        } catch (err) {
            console.error('Doc worker: failed to load pandoc:', err);
            postMessage({ status: 'loaded' }); // still signal loaded so UI isn't stuck
        }
        return;
    }

    if (action === 'process') {
        try {
            // Validate config before using
            if (!config || !config.format || !config.inputFormat) {
                throw new Error('Incomplete config: missing format or inputFormat');
            }

            const outputFormat = config.format.name;
            const inputFormat = config.inputFormat.name;
            emitProgress(id, 0.05);
            emitProgress(id, 0.2);
            emitProgress(id, 0.35);

            const outputBlob = await convertDocumentWithIntermediates(file, config);

            emitProgress(id, 0.95);

            if (!outputBlob || (outputBlob instanceof Blob && outputBlob.size === 0)) {
                throw new Error(`Conversion returned empty output for ${inputFormat}->${outputFormat}`);
            }

            emitProgress(id, 1);

            postMessage({
                status: 'processed',
                output: outputBlob,
                config,
                id,
            });
        } catch (err) {
            console.error('Doc worker error:', err);
            postMessage({ status: 'failed', id });
        }
    }
}

onmessage = (e) => {
    processQueue = processQueue
        .then(() => handleMessage(e.data))
        .catch(err => console.error('Doc worker queue error:', err));
};
