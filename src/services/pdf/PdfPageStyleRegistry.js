/**
 * @fileoverview Registry for CSS styles applied per document theme in the PDF.
 *
 * Each style has:
 *   - A CSS block (injected into the <style> tag via PdfStylesInjected)
 *   - Renderer metadata: background color for html2canvas
 *   - UI metadata: label and preview colors for the style picker modal
 *
 * Usage:
 *   import { pdfPageStyleRegistry } from './pdf';
 *   pdfPageStyleRegistry.register('mi-tema', `.pdf-container.mi-tema { ... }`, {
 *     background: '#1e1e2e',
 *     label: 'Oscuro',
 *     preview: { bg: '#1e1e2e', text: '#cdd6f4', accent: '#cba6f7', header: '#cba6f740' },
 *   });
 */
class PdfPageStyleRegistry {
  /** @type {Map<string, string>} name → raw CSS string */
  #styles = new Map();

  /**
   * @typedef {{
   *   background?: string,
   *   label?: string,
   *   preview?: { bg: string, text: string, accent: string, header: string },
   * }} StyleMeta
   */

  /** @type {Map<string, StyleMeta>} name → metadata */
  #meta = new Map();

  /**
   * Register a CSS block for a named document theme.
   * Re-registering the same name replaces the previous value.
   *
   * @param {string} name    - Theme identifier, e.g. 'dark', 'cover'
   * @param {string} css     - Raw CSS string (write full selectors)
   * @param {StyleMeta} [options]
   * @returns {this} Chainable
   */
  register(name, css, options = {}) {
    this.#styles.set(name, css);
    this.#meta.set(name, options);
    return this;
  }

  /**
   * Unregister a style.
   * @param {string} name 
   * @returns {this} Chainable
   */
  unregister(name) {
    this.#styles.delete(name);
    this.#meta.delete(name);
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
    return this.#meta.get(name)?.background ?? '#ffffff';
  }

  /**
   * Get full metadata for a single style.
   * @param {string} name
   * @returns {StyleMeta | undefined}
   */
  getMeta(name) {
    return this.#meta.get(name);
  }

  /**
   * Get all registered styles with their metadata.
   * Used by the UI style picker to build preview cards dynamically.
   *
   * @returns {Array<{ name: string } & StyleMeta>}
   */
  getAll() {
    return [...this.#meta.entries()].map(([name, meta]) => ({
      name,
      ...meta,
    }));
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
