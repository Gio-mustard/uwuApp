/**
 * @fileoverview Manages user-created custom PDF styles persisted in localStorage.
 * Integrates directly with PdfPageStyleRegistry to inject them on load and on save.
 */

import { pdfPageStyleRegistry } from './PdfPageStyleRegistry.js';

const STORAGE_KEY = 'custom-pdf-styles';

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   bg: string,
 *   text: string,
 *   accent: string
 * }} CustomPdfStyle
 */

/**
 * Load raw custom styles from localStorage.
 * @returns {CustomPdfStyle[]}
 */
export function getCustomStyles() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Generate the CSS block for a custom style based on its semantic colors.
 */
function buildCustomCss(id, bg, text, accent) {
  return `
    .pdf-container.${id} {
      background-color: ${bg};
      color: ${text};
    }
    .pdf-container.${id} .pdf-title { color: ${accent}; }
    .pdf-container.${id} .pdf-header { border-bottom-color: ${accent}40; }
    .pdf-container.${id} .pdf-content { color: ${text}; }
    .pdf-container.${id} .pdf-content h1,
    .pdf-container.${id} .pdf-content h2,
    .pdf-container.${id} .pdf-content h3 { color: ${accent}; }
    
    .pdf-container.${id} .pdf-content code {
      background: ${text}15;
      color: ${accent};
    }
    .pdf-container.${id} .pdf-content pre {
      background: ${text}0A;
      border-color: ${text}20;
    }
    .pdf-container.${id} .pdf-content blockquote {
      border-left-color: ${accent};
      background: ${accent}18;
      color: ${text}E0;
    }
    .pdf-container.${id} .pdf-content hr {
      border-top-color: ${text}25;
    }
  `;
}

/**
 * Register a single custom style into the pdfPageStyleRegistry
 * @param {CustomPdfStyle} style
 */
function _registerToSystem(style) {
  const css = buildCustomCss(style.id, style.bg, style.text, style.accent);
  pdfPageStyleRegistry.register(style.id, css, {
    background: style.bg,
    label: style.name,
    preview: {
      bg: style.bg,
      text: style.text,
      accent: style.accent,
      header: style.accent + '40'
    },
    isCustom: true
  });
}

/**
 * Saves a given style to localStorage and registers it for immediate use.
 * @param {CustomPdfStyle} style 
 */
export function saveCustomStyle(style) {
  const styles = getCustomStyles();
  const idx = styles.findIndex(s => s.id === style.id);
  
  if (idx >= 0) {
    styles[idx] = style;
  } else {
    styles.push(style);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
  _registerToSystem(style);
}

/**
 * Deletes a custom style by id from localStorage and unregisters it.
 * @param {string} id 
 */
export function deleteCustomStyle(id) {
  const styles = getCustomStyles();
  const filtered = styles.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  
  pdfPageStyleRegistry.unregister(id);
}

/**
 * Bootstraps all saved custom styles into the PDF registry on app starts.
 */
export function loadCustomStylesIntoRegistry() {
  const styles = getCustomStyles();
  styles.forEach(_registerToSystem);
}
