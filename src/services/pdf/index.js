/**
 * @fileoverview Public API for the PDF export module.
 *
 * Importing this file:
 *   1. Subscribes all 3 processing handlers (once, on import)
 *   2. Registers the built-in themes with CSS + html2canvas background color
 *
 * To add a custom theme:
 *   pdfPageStyleRegistry.register('mi-tema', '.pdf-container.mi-tema { ... }', {
 *     background: '#1a1a2e',   // ← fills jsPDF page background via html2canvas
 *   });
 */

import { pdfPageStyleRegistry } from './PdfPageStyleRegistry.js';
import { subscribePdfHandlers } from './PdfProcessingHandlers.js';

// ── Subscribe all handlers exactly once on module load ─────────────────────
subscribePdfHandlers();

// ── Register built-in page styles ──────────────────────────────────────────
//
// Each style targets .pdf-container.{name} so the theme cascades via CSS
// inheritance to all children (.pdf-header, .pdf-content, .pdf-page, etc.)
// without needing per-element class changes.
//
// To apply a style: add its name as a second class on .pdf-container in
// buildPdfTemplate(), e.g.  <div class="pdf-container dark">
//
pdfPageStyleRegistry
  .register('default', `
    /* default: no overrides — base styles in buildPdfTemplate() apply */
  `, { 
    background: '#ffffff',
    label: 'Clásico',
    preview: { 
      bg: 'var(--color-surface, #ffffff)', 
      text: 'var(--color-text, #334155)', 
      accent: 'var(--color-primary, #E85D5D)', 
      header: 'color-mix(in srgb, var(--color-primary) 40%, transparent)' 
    }
  })
  .register('cover', `
    .pdf-container.cover .pdf-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding-top: 60px;
    }
    .pdf-container.cover .pdf-content h1,
    .pdf-container.cover .pdf-content h2,
    .pdf-container.cover .pdf-content h3 {
      letter-spacing: -0.025em;
      margin-top: 0.5em;
    }
    .pdf-container.cover .pdf-content p {
      font-size: 1.1em;
      opacity: 0.75;
    }
  `, { 
    background: '#ffffff',
    label: 'Portada',
    preview: { 
      bg: 'var(--color-surface, #ffffff)', 
      text: 'var(--color-text, #334155)', 
      accent: 'var(--color-primary, #E85D5D)', 
      header: 'color-mix(in srgb, var(--color-primary) 40%, transparent)',
      align: 'center'
    }
  })
  .register('dark', `
    .pdf-container.dark {
      background-color: #1e1e2e;
      color: #cdd6f4;
    }
    .pdf-container.dark .pdf-title { color: #cba6f7; }
    .pdf-container.dark .pdf-header {
      border-bottom-color: #cba6f740;
    }
    .pdf-container.dark .pdf-content { color: #cdd6f4; }
    .pdf-container.dark .pdf-content h1,
    .pdf-container.dark .pdf-content h2,
    .pdf-container.dark .pdf-content h3 { color: #cba6f7; }
    .pdf-container.dark .pdf-content code {
      background: #313244;
      color: #f38ba8;
    }
    .pdf-container.dark .pdf-content pre {
      background: #181825;
      border-color: #313244;
      box-shadow: none;
    }
    .pdf-container.dark .pdf-content blockquote {
      border-left-color: #89b4fa;
      background: #89b4fa18;
      color: #bac2de;
    }
    .pdf-container.dark .pdf-content hr {
      border-top-color: #313244;
    }
  `, { 
    background: '#1e1e2e',
    label: 'Oscuro',
    preview: { 
      bg: '#1e1e2e', 
      text: '#cdd6f4', 
      accent: '#cba6f7', 
      header: '#cba6f740' 
    }
  })
  .register('minimal', `
    .pdf-container.minimal { padding: 40px 32px; }
    .pdf-container.minimal .pdf-header {
      border-bottom: none;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .pdf-container.minimal .pdf-title { font-size: 28px; }
    .pdf-container.minimal .pdf-content { font-size: 14px; }
  `, { 
    background: '#ffffff',
    label: 'Minimalista',
    preview: { 
      bg: 'var(--color-surface, #ffffff)', 
      text: 'var(--color-text, #334155)', 
      accent: 'var(--color-text, #1a1917)', 
      header: 'transparent' 
    }
  });

// ── Re-export public API ───────────────────────────────────────────────────
export { pdfEventBus } from './PdfEventBus.js';
export {
  PdfPageBreakMarked,
  PdfHtmlSegmented,
  PdfStylesInjected,
} from './PdfDomainEvents.js';
export { pdfPageStyleRegistry } from './PdfPageStyleRegistry.js';
