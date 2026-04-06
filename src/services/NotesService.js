/**
 * @fileoverview NotesService — Handles side-effects and logic operations for Notes, such as PDF exports.
 */

/**
 * Exports a note to a playful, dynamically colored PDF locally.
 * It builds a virtual layout utilizing the active CSS design tokens
 * and serializes it using html2canvas inside html2pdf.
 *
 * @param {string} title - The title of the note
 * @param {string} htmlContent - The marked-parsed HTML content of the note
 */
export async function exportNoteToPDF(title, htmlContent) {
  
  const module = await import('html2pdf.js');
  const html2pdf = module.default;

  // Fetch the active color palette from UwuApp's root CSS properties
  const rootStyle = window.getComputedStyle(document.documentElement);
  const primary = rootStyle.getPropertyValue('--color-primary').trim() || '#E85D5D';
  
  const surface = '#ffffff';
  const text = rootStyle.getPropertyValue('--color-text').trim() || '#1a1917';
  const border = rootStyle.getPropertyValue('--color-border').trim() || '#eae9e6';

  const element = document.createElement('div');
  
  
  element.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Inter:wght@400;600;800&display=swap');
      
      .pdf-container {
        font-family: 'Inter', system-ui, sans-serif;
        color: ${text};
        padding: 50px 60px;
        background-color: ${surface};
        min-height: 100vh;
      }
      .pdf-header {
        border-bottom: 3px dashed ${primary}60;
        padding-bottom: 20px;
        margin-bottom: 35px;
        display: flex;
        align-items: center;
        gap: 15px;
      }
      .pdf-header::before {
        content: '';
        font-size: 38px;
        display: block;
      }
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
        margin-top: 1.8em;
        margin-bottom: 0.6em;
        font-weight: 800;
      }
      .pdf-content p {
        margin-bottom: 1.2em;
      }
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
      .pdf-content ul, .pdf-content ol {
        padding-left: 24px;
        margin-bottom: 20px;
      }
      .pdf-content li {
        margin-bottom: 10px;
      }
      .pdf-content li::marker {
        color: ${primary};
        font-weight: 800;
      }
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
      .easter-egg-match {
        font-weight: 800;
        padding: 1px 4px;
        border-radius: 4px;
        background: #f1f5f9;
      }
    </style>
    <div class="pdf-container">
      <header class="pdf-header">
        <h1 class="pdf-title">${title || 'Nota sin título'}</h1>
      </header>
      <div class="pdf-content">
        ${htmlContent}
      </div>
    </div>
  `;

  const opt = {
    margin:       [0, 0, 0, 0],
    filename:     `${title || 'nota'}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}
