import { createPandocInstance } from '../../node_modules/pandoc-wasm/src/core.js';

let pandocPromise = null;
let processQueue = Promise.resolve();
let typstPromise = null;
let typstFontBytesPromise = null;
let xlsxPromise = null;

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
const TYPST_DIAGNOSTICS_FORMAT = 0;

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

async function getXlsx() {
    if (!xlsxPromise) {
        xlsxPromise = import('@e965/xlsx')
            .then((mod) => mod.default || mod)
            .catch((err) => {
                xlsxPromise = null;
                throw err;
            });
    }
    return xlsxPromise;
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

async function workbookToHtml(workbook) {
    const XLSX = await getXlsx();
    const sections = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
        return `<section><h2>${escapeHtml(sheetName)}</h2>${tableToHtmlFromRows(rows)}</section>`;
    });
    return `<!doctype html><html><head><meta charset="utf-8"></head><body>${sections.join('\n')}</body></html>`;
}

async function spreadsheetBlobToWorkbook(blob) {
    const XLSX = await getXlsx();
    const buffer = await blob.arrayBuffer();
    return XLSX.read(buffer, { type: 'array', cellDates: true });
}

async function workbookToSpreadsheetBlob(workbook, outputFormat) {
    const XLSX = await getXlsx();
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

async function workbookFromHtml(html) {
    const XLSX = await getXlsx();
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
        if (toName === 'html') {
            const text = await inputBlob.text();
            const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><pre>${escapeHtml(text)}</pre></body></html>`;
            outputBlob = new Blob([html], { type: mimeType || 'text/html' });
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

async function getTypstFontBytes() {
    if (!typstFontBytesPromise) {
        typstFontBytesPromise = (async () => {
            const fontRes = await fetch(`${self.location.origin}/vendor/typst/fonts/NotoSans.ttf`);
            if (!fontRes.ok) {
                throw new Error(`Failed to fetch NotoSans.ttf: ${fontRes.status}`);
            }
            return new Uint8Array(await fontRes.arrayBuffer());
        })().catch((err) => {
            typstFontBytesPromise = null;
            throw err;
        });
    }
    return typstFontBytesPromise;
}

// Pandoc's default typst template uses system fonts and #import directives that
// fail under the wasm dummy access model, producing a blank PDF. We strip the
// pandoc preamble (everything before the first non-comment content line) and
// wrap the body in a minimal, self-contained typst document instead.
function wrapTypstSourceForWasm(source) {
    const lines = source.split('\n');
    // Find where the actual content starts — skip lines that are part of the
    // pandoc template preamble (#set/#show/#import/#let rules and their multi-line blocks).
    // Key fix: check bracket depth BEFORE decrementing so closing `]` lines are
    // still treated as preamble (not mistakenly identified as the body start).
    let bodyStart = lines.length; // default: whole file is preamble → empty body
    let depth = 0;
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trimStart();
        const depthBefore = depth;
        depth += (lines[i].match(/\[/g) || []).length;
        depth -= (lines[i].match(/\]/g) || []).length;
        if (depth < 0) depth = 0;

        const isDirective =
            trimmed.startsWith('#set ') ||
            trimmed.startsWith('#show ') ||
            trimmed.startsWith('#import ') ||
            trimmed.startsWith('#let ') ||
            trimmed.startsWith('//');
        const isBlank = trimmed === '';
        // Line is preamble if we're already inside a directive block,
        // or if it IS a directive/blank. Opening a bracket does NOT make content preamble.
        const isPreambleLine = depthBefore > 0 || isDirective || isBlank;

        if (!isPreambleLine) {
            bodyStart = i;
            break;
        }
    }
    const body = lines.slice(bodyStart).join('\n').trimStart();
    // Minimal preamble that works under the wasm dummy access model
    const preamble = `#set page(margin: (x: 2cm, y: 2cm))\n#set text(size: 11pt)\n#set par(justify: false)\n#set block(breakable: true)\n#show figure: set block(breakable: true)\n\n`;
    return preamble + body;
}

async function convertTypstToPdf(typstBlob) {
    const typstModule = await getTypstModule();
    const rawSource = await typstBlob.text();
    const source = wrapTypstSourceForWasm(rawSource);
    const builder = new typstModule.TypstCompilerBuilder();
    builder.set_dummy_access_model();
    try {
        builder.add_raw_font(await getTypstFontBytes());
    } catch (e) {
        console.warn('[doc-worker] Font load error:', e);
    }
    const compiler = await builder.build();
    const mainPath = '/main.typ';
    compiler.add_source(mainPath, source);
    const pdfBytes = compiler.compile(mainPath, null, 'pdf', TYPST_DIAGNOSTICS_FORMAT);
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
        let docBlob = file;
        let docFormat = inputFormat;
        let docExt = inputExt;
        if (isSpreadsheetFormat(inputFormat)) {
            // Spreadsheets aren't understood by Pandoc directly — go through HTML
            const workbook = await spreadsheetBlobToWorkbook(file);
            const html = await workbookToHtml(workbook);
            docBlob = new Blob([html], { type: 'text/html' });
            docFormat = 'html';
            docExt = 'html';
        }
        const typstBlob = await convertWithPandoc(
            docBlob,
            docFormat,
            'typst',
            docExt,
            'typ',
            'text/plain'
        );
        return convertTypstToPdf(typstBlob);
    }

    const inputIsSpreadsheet = isSpreadsheetFormat(inputFormat);
    const outputIsSpreadsheet = isSpreadsheetFormat(outputFormat);

    if (inputIsSpreadsheet && outputIsSpreadsheet) {
        const workbook = await spreadsheetBlobToWorkbook(file);
        return await workbookToSpreadsheetBlob(workbook, outputFormat);
    }

    if (inputIsSpreadsheet) {
        const workbook = await spreadsheetBlobToWorkbook(file);
        const html = await workbookToHtml(workbook);
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
        const workbook = await workbookFromHtml(html);
        return await workbookToSpreadsheetBlob(workbook, outputFormat);
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
