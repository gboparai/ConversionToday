/**
 * subtitle-worker.js
 * Pure-JS, in-browser subtitle format converter.
 * Supports: SRT, VTT, ASS/SSA, SBV, LRC, TTML, STL (text), TXT (plain)
 *
 * All processing is synchronous text manipulation — no WASM required.
 */

// ── Timestamp helpers ──────────────────────────────────────────────────────

/**
 * Parse a timestamp string into total milliseconds.
 * Handles SRT (HH:MM:SS,mmm), VTT (HH:MM:SS.mmm or MM:SS.mmm),
 * ASS (H:MM:SS.cc), SBV (H:MM:SS.mmm), LRC (MM:SS.xx), TTML (HH:MM:SS.mmm)
 */
function parseTimestamp(ts) {
    ts = ts.trim();

    // SRT/STL: 00:00:00,000
    let m = ts.match(/^(\d+):(\d{2}):(\d{2})[,.](\d+)$/);
    if (m) {
        const ms = parseInt(m[4].padEnd(3, '0').slice(0, 3), 10);
        return ((+m[1]) * 3600 + (+m[2]) * 60 + (+m[3])) * 1000 + ms;
    }

    // VTT without hours: MM:SS.mmm
    m = ts.match(/^(\d{2}):(\d{2})[.](\d+)$/);
    if (m) {
        const ms = parseInt(m[3].padEnd(3, '0').slice(0, 3), 10);
        return ((+m[1]) * 60 + (+m[2])) * 1000 + ms;
    }

    // ASS: H:MM:SS.cc (centiseconds)
    m = ts.match(/^(\d+):(\d{2}):(\d{2})\.(\d{2})$/);
    if (m) {
        return ((+m[1]) * 3600 + (+m[2]) * 60 + (+m[3])) * 1000 + (+m[4]) * 10;
    }

    // LRC: [MM:SS.xx]
    m = ts.match(/^\[(\d+):(\d{2})\.(\d{2,3})\]$/);
    if (m) {
        const ms = m[3].length === 2 ? (+m[3]) * 10 : +m[3];
        return ((+m[1]) * 60 + (+m[2])) * 1000 + ms;
    }

    return 0;
}

/**
 * Format milliseconds into a timestamp string for the target format.
 */
function formatTimestamp(ms, format) {
    const totalSec = Math.floor(ms / 1000);
    const millis   = ms % 1000;
    const h  = Math.floor(totalSec / 3600);
    const m  = Math.floor((totalSec % 3600) / 60);
    const s  = totalSec % 60;

    const pad2 = n => String(n).padStart(2, '0');
    const pad3 = n => String(n).padStart(3, '0');

    switch (format) {
        case 'srt':
        case 'stl':
            return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(millis)}`;
        case 'vtt':
            return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(millis)}`;
        case 'ass':
        case 'ssa':
            // centiseconds
            return `${h}:${pad2(m)}:${pad2(s)}.${pad2(Math.floor(millis / 10))}`;
        case 'sbv':
            return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(millis)}`;
        case 'lrc':
            return `[${pad2(m + h * 60)}:${pad2(s)}.${pad2(Math.floor(millis / 10))}]`;
        case 'ttml':
            return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(millis)}`;
        case 'txt':
            return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
        default:
            return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(millis)}`;
    }
}

// ── Strip markup ───────────────────────────────────────────────────────────

function stripHtml(text) {
    return text.replace(/<[^>]+>/g, '');
}

function stripAssOverrides(text) {
    // Remove {\\pos(...)}, {\\an1}, etc.
    return text.replace(/\{[^}]*\}/g, '').replace(/\\N/g, '\n').replace(/\\n/g, '\n');
}

// ── Parsers ────────────────────────────────────────────────────────────────

/**
 * A parsed subtitle cue: { start: ms, end: ms, text: string }
 */

function parseSrt(content) {
    const cues = [];
    const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
    for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (lines.length < 2) continue;
        // Skip sequence number line if present
        let timeLine = lines[0];
        let textStart = 1;
        if (/^\d+$/.test(timeLine.trim())) {
            if (lines.length < 3) continue;
            timeLine = lines[1];
            textStart = 2;
        }
        const tm = timeLine.match(/(\S+)\s*-->\s*(\S+)/);
        if (!tm) continue;
        const text = lines.slice(textStart).join('\n').trim();
        cues.push({ start: parseTimestamp(tm[1]), end: parseTimestamp(tm[2]), text: stripHtml(text) });
    }
    return cues;
}

function parseVtt(content) {
    const cues = [];
    const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
    for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (!lines.length) continue;
        // Skip WEBVTT header, NOTE, STYLE, REGION
        if (/^WEBVTT|^NOTE|^STYLE|^REGION/.test(lines[0])) continue;
        let timeLine = lines[0];
        let textStart = 1;
        // Optional cue identifier line (no --> in it)
        if (!timeLine.includes('-->') && lines.length > 1) {
            timeLine = lines[1];
            textStart = 2;
        }
        const tm = timeLine.match(/(\S+)\s*-->\s*(\S+)/);
        if (!tm) continue;
        const text = lines.slice(textStart).join('\n').trim();
        cues.push({ start: parseTimestamp(tm[1]), end: parseTimestamp(tm[2]), text: stripHtml(text) });
    }
    return cues;
}

function parseAss(content) {
    const cues = [];
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    let formatLine = null;
    let inEvents = false;
    for (const line of lines) {
        if (/^\[Events\]/i.test(line)) { inEvents = true; continue; }
        if (!inEvents) continue;
        if (/^Format:/i.test(line)) {
            formatLine = line.replace(/^Format:\s*/i, '').split(',').map(s => s.trim());
            continue;
        }
        if (!/^Dialogue:/i.test(line)) continue;
        const vals = line.replace(/^Dialogue:\s*/i, '').split(',');
        if (!formatLine) {
            // fallback: Start=1, End=2, Text=9
            const startMs = parseTimestamp(vals[1]);
            const endMs   = parseTimestamp(vals[2]);
            const text    = stripAssOverrides(vals.slice(9).join(','));
            cues.push({ start: startMs, end: endMs, text });
            continue;
        }
        const get = key => {
            const idx = formatLine.indexOf(key);
            return idx >= 0 ? (vals[idx] || '').trim() : '';
        };
        const startMs = parseTimestamp(get('Start'));
        const endMs   = parseTimestamp(get('End'));
        const textIdx = formatLine.indexOf('Text');
        const rawText = textIdx >= 0 ? vals.slice(textIdx).join(',').trim() : '';
        const text    = stripAssOverrides(rawText);
        if (text) cues.push({ start: startMs, end: endMs, text });
    }
    return cues;
}

function parseSbv(content) {
    const cues = [];
    const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
    for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (lines.length < 2) continue;
        const tm = lines[0].match(/(\S+),(\S+)/);
        if (!tm) continue;
        const text = lines.slice(1).join('\n').trim();
        cues.push({ start: parseTimestamp(tm[1]), end: parseTimestamp(tm[2]), text: stripHtml(text) });
    }
    return cues;
}

function parseLrc(content) {
    const cues = [];
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const lrcRegex = /^(\[\d+:\d{2}\.\d+\])(.*)$/;
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(lrcRegex);
        if (!m) continue;
        const startMs = parseTimestamp(m[1]);
        const text    = m[2].trim();
        // End = next cue start or start + 3 seconds
        let endMs = startMs + 3000;
        for (let j = i + 1; j < lines.length; j++) {
            const nm = lines[j].match(lrcRegex);
            if (nm) { endMs = parseTimestamp(nm[1]); break; }
        }
        if (text) cues.push({ start: startMs, end: endMs, text });
    }
    return cues;
}

function parseTtml(content) {
    const cues = [];
    const pRegex = /<p\b[^>]*\bbegin="([^"]+)"[^>]*\bend="([^"]+)"[^>]*>([\s\S]*?)<\/p>/gi;
    let m;
    while ((m = pRegex.exec(content)) !== null) {
        const text = m[3].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
        if (text) cues.push({ start: parseTimestamp(m[1]), end: parseTimestamp(m[2]), text });
    }
    return cues;
}

// Plain text — treat as display-only (no timing), one line per cue at 2s each
function parseTxt(content) {
    const cues = [];
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    let t = 0;
    for (const line of lines) {
        const text = line.trim();
        if (!text) continue;
        cues.push({ start: t, end: t + 2000, text });
        t += 2000;
    }
    return cues;
}

// ── Serializers ────────────────────────────────────────────────────────────

function toSrt(cues) {
    return cues.map((cue, i) =>
        `${i + 1}\n${formatTimestamp(cue.start, 'srt')} --> ${formatTimestamp(cue.end, 'srt')}\n${cue.text}`
    ).join('\n\n') + '\n';
}

function toVtt(cues) {
    const body = cues.map((cue, i) =>
        `${i + 1}\n${formatTimestamp(cue.start, 'vtt')} --> ${formatTimestamp(cue.end, 'vtt')}\n${cue.text}`
    ).join('\n\n');
    return `WEBVTT\n\n${body}\n`;
}

function toAss(cues) {
    const header = `[Script Info]
; Converted by No Limit Converter
ScriptType: v4.00+
PlayResX: 384
PlayResY: 288

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;
    const events = cues.map(cue =>
        `Dialogue: 0,${formatTimestamp(cue.start, 'ass')},${formatTimestamp(cue.end, 'ass')},Default,,0,0,0,,${cue.text.replace(/\n/g, '\\N')}`
    ).join('\n');
    return `${header}\n${events}\n`;
}

function toSbv(cues) {
    return cues.map(cue =>
        `${formatTimestamp(cue.start, 'sbv')},${formatTimestamp(cue.end, 'sbv')}\n${cue.text}`
    ).join('\n\n') + '\n';
}

function toLrc(cues) {
    return cues.map(cue =>
        `${formatTimestamp(cue.start, 'lrc')}${cue.text}`
    ).join('\n') + '\n';
}

function toTtml(cues) {
    const body = cues.map(cue => {
        const escaped = cue.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
        return `      <p begin="${formatTimestamp(cue.start, 'ttml')}" end="${formatTimestamp(cue.end, 'ttml')}">${escaped}</p>`;
    }).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<tt xmlns="http://www.w3.org/ns/ttml">
  <body>
    <div>
${body}
    </div>
  </body>
</tt>\n`;
}

function toStl(cues) {
    // EBU STL text representation (simplified plain-text variant)
    return cues.map(cue =>
        `${formatTimestamp(cue.start, 'stl')} , ${formatTimestamp(cue.end, 'stl')} , ${cue.text.replace(/\n/g, ' | ')}`
    ).join('\n') + '\n';
}

function toTxt(cues) {
    return cues.map(cue => cue.text).join('\n') + '\n';
}

// ── Format dispatch ────────────────────────────────────────────────────────

function parse(content, formatName) {
    switch (formatName) {
        case 'srt':  return parseSrt(content);
        case 'vtt':  return parseVtt(content);
        case 'ass':
        case 'ssa':  return parseAss(content);
        case 'sbv':  return parseSbv(content);
        case 'lrc':  return parseLrc(content);
        case 'ttml': return parseTtml(content);
        case 'stl':  return parseSrt(content); // simplified STL parser (text is SRT-like)
        case 'txt':  return parseTxt(content);
        default:     return parseSrt(content);
    }
}

function serialize(cues, formatName) {
    switch (formatName) {
        case 'srt':  return toSrt(cues);
        case 'vtt':  return toVtt(cues);
        case 'ass':
        case 'ssa':  return toAss(cues);
        case 'sbv':  return toSbv(cues);
        case 'lrc':  return toLrc(cues);
        case 'ttml': return toTtml(cues);
        case 'stl':  return toStl(cues);
        case 'txt':  return toTxt(cues);
        default:     return toSrt(cues);
    }
}

// ── Worker message handler ─────────────────────────────────────────────────

async function handleMessage(data) {
    const { action, file, config, id } = data;

    if (action === 'load') {
        postMessage({ status: 'loaded' });
        return;
    }

    if (action === 'process') {
        try {
            if (!config || !config.format || !config.inputFormat) {
                throw new Error('Incomplete config: missing format or inputFormat');
            }

            const inputFormatName  = config.inputFormat.name;
            const outputFormatName = config.format.name;
            const outputExt        = config.format.extension;

            postMessage({ status: 'progress', id, progress: 10 });

            const text = await file.text();

            postMessage({ status: 'progress', id, progress: 40 });

            const cues   = parse(text, inputFormatName);
            const output = serialize(cues, outputFormatName);

            postMessage({ status: 'progress', id, progress: 90 });

            const mimeType = config.format.mimeType || 'text/plain';
            const blob     = new Blob([output], { type: mimeType });

            postMessage({ status: 'progress', id, progress: 100 });
            postMessage({ status: 'processed', output: blob, config, id });
        } catch (err) {
            console.error('[subtitle-worker] Error:', err);
            postMessage({ status: 'failed', id, message: err.message });
        }
    }
}

onmessage = (e) => handleMessage(e.data);
