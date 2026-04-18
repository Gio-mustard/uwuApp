/**
 * @fileoverview PDF processing event handlers.
 *
 * Three pure handler functions, each subscribed to one pipeline event:
 *
 *   markPageBreaks  → PdfPageBreakMarked
 *   segmentPages    → PdfHtmlSegmented
 *   injectStyles    → PdfStylesInjected
 *
 * Efficiency notes:
 *   - markPageBreaks  : single querySelectorAll pass, O(k)
 *   - segmentPages    : one querySelectorAll (breaks) + O(n) firstChild walk + one DocumentFragment insert
 *                       also sets theme background and forces min-height to cover all jsPDF pages
 *   - injectStyles    : single querySelector + one string concat
 */

import { pdfEventBus } from './PdfEventBus.js';
import { PdfPageBreakMarked, PdfHtmlSegmented, PdfStylesInjected } from './PdfDomainEvents.js';
import { pdfPageStyleRegistry } from './PdfPageStyleRegistry.js';

// ─── Handler 1: PdfPageBreakMarked ───────────────────────────────────────────

/**
 * Marks every div[data-page-break] with the html2pdf__page-break class
 * so the legacy renderer knows where to cut pages.
 *
 * Complexity: O(k) where k = number of page-break elements.
 *
 * @param {import('./PdfDomainEvents.js').PdfPageBreakMarked} event
 */
function markPageBreaks({ element }) {
  element.querySelectorAll('div[data-page-break]').forEach((el) => {
    el.classList.add('html2pdf__page-break');
  });
}

const PAGE_HEIGHT_IN = 11; // letter paper (in)

/**
 * Segments content between page-break elements into .pdf-page wrappers.
 * Also applies the theme background color and forces min-height so the
 * html2canvas canvas covers all jsPDF pages — preventing white fills on
 * sparse pages 2+.
 *
 * Algorithm:
 *   1. querySelectorAll('div[data-page-break]') — one call used for both
 *      the early-exit check (length === 0) and the page count
 *   2. Theme + background resolved from container's second class via registry
 *   3. Single O(n) firstChild linked-list walk
 *   4. One DocumentFragment.appendChild — minimal DOM mutations
 *
 * @param {import('./PdfDomainEvents.js').PdfHtmlSegmented} event
 */
function segmentPages({ contentEl, element }) {
  const containerEl = element.querySelector('.pdf-container');
  const theme       = containerEl?.classList.item(1) ?? 'default';
  const canvasBg    = pdfPageStyleRegistry.getBackground(theme);

  // One querySelectorAll serves both: page count AND early-exit check.
  const breakNodes = contentEl.querySelectorAll('div[data-page-break]');
  const pageCount  = breakNodes.length + 1;

  // Force min-height so the captured canvas always covers ALL jsPDF pages.
  // Without this, any area below the last line of text on page 2+ is
  // jsPDF-default white — unreachable by CSS or backgroundColor options.
  if (containerEl) {
    containerEl.style.minHeight       = `${pageCount * PAGE_HEIGHT_IN}in`;
    containerEl.style.backgroundColor = canvasBg;
  }
  element.style.backgroundColor = canvasBg;

  // No segmentation needed if there are no breaks.
  if (breakNodes.length === 0) return;

  const fragment = document.createDocumentFragment();
  let currentSection = createSection('default');

  let child = contentEl.firstChild;
  while (child) {
    const next = child.nextSibling;

    if (
      child.nodeType === Node.ELEMENT_NODE &&
      child.hasAttribute('data-page-break')
    ) {
      fragment.appendChild(currentSection);
      fragment.appendChild(child);
      currentSection = createSection(child.dataset.pageStyle || 'default');
    } else {
      currentSection.appendChild(child);
    }

    child = next;
  }

  fragment.appendChild(currentSection);
  contentEl.appendChild(fragment); // single DOM mutation ✓
}

/** @param {string} style */
function createSection(style) {
  const div = document.createElement('div');
  div.className = `pdf-page pdf-page--${style}`;
  return div;
}

// ─── Handler 3: PdfStylesInjected ────────────────────────────────────────────

/**
 * Appends all CSS from the PdfPageStyleRegistry to the element's <style> tag.
 * No-op if the element has no style tag or the registry is empty.
 *
 * @param {import('./PdfDomainEvents.js').PdfStylesInjected} event
 */
function injectStyles({ element }) {
  const styleEl = element.querySelector('style');
  if (!styleEl) return;

  const container = element.getElementsByClassName('pdf-container')[0];
  if (!container) return;
  const styleType = container.classList.item(1);
  const extra = pdfPageStyleRegistry.get(styleType);
  if (extra) styleEl.textContent += '\n' + extra;
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

/**
 * Wire all three handlers to the pdf event bus.
 * Called once from index.js — idempotency is the caller's responsibility.
 *
 * @returns {{ unsubscribeAll: () => void }}
 */
export function subscribePdfHandlers() {
  const unsub1 = pdfEventBus.subscribe(PdfPageBreakMarked, markPageBreaks);
  const unsub2 = pdfEventBus.subscribe(PdfHtmlSegmented, segmentPages);
  const unsub3 = pdfEventBus.subscribe(PdfStylesInjected, injectStyles);

  return {
    unsubscribeAll: () => { unsub1(); unsub2(); unsub3(); },
  };
}
