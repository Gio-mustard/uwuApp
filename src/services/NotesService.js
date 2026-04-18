/**
 * @fileoverview NotesService — Side-effects and logic operations for Notes.
 *
 * PDF export follows a domain-event driven pipeline:
 *   1. Load renderer  (html2pdf — lazy import)
 *   2. Build element  (buildPdfTemplate — pure function)
 *   3. Fire events    (PdfPageBreakMarked → PdfHtmlSegmented → PdfStylesInjected)
 *   4. Render to PDF
 *   5. Save file
 */

import {
  pdfEventBus,
  PdfPageBreakMarked,
  PdfHtmlSegmented,
  PdfStylesInjected,
} from './pdf/index.js';

/**
 * @param {string} title       - Note title
 * @param {string} htmlContent - Note content as HTML (from editor.getHTML() or other)
 */
export async function exportNoteToPDF(title, htmlContent) {

  // ── 1. Load renderer ───────────────────────────────────────────────────────
  const { default: html2pdf } = await import('html2pdf.js');

  const rootStyle = window.getComputedStyle(document.documentElement);
  const colors = {
    primary : rootStyle.getPropertyValue('--color-primary').trim() || '#E85D5D',
    surface : '#ffffff',
    text    : rootStyle.getPropertyValue('--color-text').trim()    || '#1a1917',
    border  : rootStyle.getPropertyValue('--color-border').trim()  || '#eae9e6',
  };

  // ── 2. Build element ───────────────────────────────────────────────────────
  const element = document.createElement('div');
  element.innerHTML = buildPdfTemplate(title, htmlContent, colors);

  // ── 3. Fire processing events ──────────────────────────────────────────────
  const contentEl = element.querySelector('.pdf-content');

  pdfEventBus.dispatch(new PdfPageBreakMarked(element));
  pdfEventBus.dispatch(new PdfHtmlSegmented(contentEl, element)); // handler owns background + minHeight
  pdfEventBus.dispatch(new PdfStylesInjected(element));

  // ── 4. Render ──────────────────────────────────────────────────────────────
  const opt = {
    margin:      [0, 0, 0, 0],
    filename:    `${title || 'nota'}.pdf`,
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false,
                   backgroundColor: element.style.backgroundColor || '#ffffff' },
    jsPDF:       { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak:   { mode: ['legacy'] },
  };

  // ── 5. Save ────────────────────────────────────────────────────────────────
  html2pdf().set(opt).from(element).save();
}

// ─── Pure template builder — no side effects ──────────────────────────────────

/**
 * Builds the PDF's root HTML element as a string.
 * Dynamic color values are interpolated here; static per-page styles
 * come later via the PdfStylesInjected event.
 *
 * @param {string} title
 * @param {string} htmlContent
 * @param {{ primary: string, surface: string, text: string, border: string }} colors
 * @returns {string} innerHTML string
 */
function buildPdfTemplate(title, htmlContent, { primary, surface, text, border }) {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Inter:wght@400;600;800&display=swap');

      .pdf-container {
        font-family: 'Inter', system-ui, sans-serif;
        color: ${text};
        padding: 0 60px;
        background-color: ${surface};
      }
      .pdf-header {
        border-bottom: 3px dashed ${primary}60;
        padding: 20px 0;
        
        display: flex;
        align-items: center;
        gap: 15px;
      }
      .pdf-header::before { content: ''; font-size: 38px; display: block; }
      .pdf-title {
        font-family: 'Outfit', sans-serif;
        font-size: 38px;
        font-weight: 800;
        color: ${primary};
        margin: 0;
        letter-spacing: -0.03em;
      }
      .pdf-content {
        line-height: 1.75;
        font-size: 16px;
        color: #334155;
      }
      .pdf-content h1, .pdf-content h2, .pdf-content h3 {
        font-family: 'Outfit', sans-serif;
        color: ${primary};
        margin-top: 1em;
        margin-bottom: 0.6em;
        font-weight: 800;
      }
      .pdf-content p { margin-bottom: 1.2em; }
      .pdf-content blockquote {
        border-left: 6px solid ${primary};
        background: ${primary}12;
        padding: 16px 20px;
        border-radius: 0 16px 16px 0;
        margin: 24px 0;
        font-style: italic;
        color: ${text};
      }
      .pdf-content pre {
        background: #f8fafc;
        padding: 20px;
        border-radius: 14px;
        border: 2px solid ${border};
        box-shadow: 4px 4px 0px ${border};
        overflow-x: auto;
      }
      .pdf-content code {
        font-family: 'Menlo', 'Monaco', monospace;
        background: ${primary}15;
        color: ${primary};
        padding: 3px 8px;
        border-radius: 8px;
        font-size: 0.85em;
        font-weight: 600;
      }
      .pdf-content ul, .pdf-content ol { padding-left: 24px; margin-bottom: 20px; }
      .pdf-content li { margin-bottom: 10px; }
      .pdf-content li::marker { color: ${primary}; font-weight: 800; }
      .pdf-content input[type="checkbox"] {
        accent-color: ${primary};
        width: 18px;
        height: 18px;
        margin-right: 10px;
        border-radius: 6px;
      }
      .pdf-content hr {
        border: none;
        border-top: 3px dotted ${border};
        margin: 30px 0;
      }
      /* page-break node — zero-height, fully invisible in the rendered PDF */
      .pdf-content div[data-page-break] {
        display: block;
        height: 0;
        margin: 0;
        padding: 0;
        border: none;
        font-size: 0;
        line-height: 0;
      }
      /* .pdf-page — base for all section wrappers added by PdfHtmlSegmented */
      .pdf-page {
        padding:10px 0;
      }
      .easter-egg-match {
        font-weight: 800;
        padding: 1px 4px;
        border-radius: 4px;
        background: #f1f5f9;
      }
    </style>
    <div class="pdf-container dark">
      <header class="pdf-header">
        <h1 class="pdf-title">${title || 'Nota sin título'}</h1>
      </header>
      <div class="pdf-content">
        ${htmlContent}
      </div>
    </div>
  `;
}
