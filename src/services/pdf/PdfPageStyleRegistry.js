/**
 * @fileoverview Registry for CSS styles applied per document theme in the PDF.
 *
 * Each style has:
 *   - A CSS block (injected into the <style> tag via PdfStylesInjected)
 *   - Optional metadata (e.g. background color used by html2canvas)
 *
 * Usage:
 *   import { pdfPageStyleRegistry } from './pdf';
 *   pdfPageStyleRegistry.register('mi-tema', `.pdf-container.mi-tema { ... }`, {
 *     background: '#1e1e2e',
 *   });
 *
 * The background is read by NotesService after dispatching events and passed
 * to html2canvas as `backgroundColor` so jsPDF pages use the correct fill.
 */
class PdfPageStyleRegistry {
  /** @type {Map<string, string>} name → raw CSS string */
  #styles = new Map();

  /**
   * @type {Map<string, { background?: string }>}
   * name → renderer metadata
   */
  #meta = new Map();

  /**
   * Register a CSS block for a named document theme.
   * Re-registering the same name replaces the previous value.
   *
   * @param {string} name    - Theme identifier, e.g. 'dark', 'cover'
   * @param {string} css     - Raw CSS string (write full selectors)
   * @param {{ background?: string }} [options]
   *   background: color string passed to html2canvas.backgroundColor so
   *               jsPDF page fills match the theme (default: '#ffffff')
   * @returns {this} Chainable
   */
  register(name, css, options = {}) {
    this.#styles.set(name, css);
    this.#meta.set(name, options);
    return this;
  }

  /**
   * Get the CSS for a single style by name.
   * @param {string} name
   * @returns {string} CSS string, or '' if not found
   */
  get(name) {
    return this.#styles.get(name) ?? '';
  }

  /**
   * Get the background color for html2canvas for a given theme.
   * Falls back to '#ffffff' if the theme has no background set.
   *
   * @param {string} name
   * @returns {string} CSS color string
   */
  getBackground(name) {
    return this.#meta.get(name)?.background ?? '#ec0e0eff';
  }

  /**
   * Get all registered CSS blocks concatenated.
   * Called internally by the PdfStylesInjected handler.
   * @returns {string}
   */
  getAllCSS() {
    return [...this.#styles.values()].join('\n');
  }

  /** @returns {string[]} Names of all registered styles */
  getNames() {
    return [...this.#styles.keys()];
  }
}

/** Singleton registry shared across the PDF module */
export const pdfPageStyleRegistry = new PdfPageStyleRegistry();
