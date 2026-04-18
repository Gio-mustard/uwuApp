/**
 * @fileoverview Domain event classes for the PDF export pipeline.
 *
 * Dispatch order:
 *   1. PdfPageBreakMarked  — mark div[data-page-break] with html2pdf class
 *   2. PdfHtmlSegmented    — wrap content sections in styled .pdf-page divs
 *   3. PdfStylesInjected   — append registered CSS into the <style> tag
 */

/**
 * Dispatched right after the root PDF element is built.
 * Handlers should mark div[data-page-break] elements so the renderer
 * knows where to split pages.
 */
export class PdfPageBreakMarked {
  /** @param {HTMLElement} element - Root PDF element */
  constructor(element) {
    this.element = element;
  }
}

/**
 * Dispatched after page breaks are marked.
 * Handlers should segment .pdf-content children into .pdf-page wrappers,
 * one wrapper per section between page breaks.
 */
export class PdfHtmlSegmented {
  /**
   * @param {HTMLElement} contentEl - The .pdf-content wrapper element
   * @param {HTMLElement} element   - Root PDF element (outer wrapper div)
   */
  constructor(contentEl, element) {
    this.contentEl = contentEl;
    this.element   = element;
  }
}

/**
 * Dispatched after segmentation is complete.
 * Handlers should inject CSS (from the style registry or custom logic)
 * into the element's <style> tag.
 */
export class PdfStylesInjected {
  /** @param {HTMLElement} element - Root PDF element */
  constructor(element) {
    this.element = element;
  }
}
