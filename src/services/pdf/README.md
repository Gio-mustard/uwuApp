# PDF Export Module — Documentación

> **Ubicación:** `src/services/pdf/`
> **Entrada pública:** `src/services/NotesService.js`

---

## 1. Resumen e introducción

El módulo de exportación a PDF de UwuApp sigue un pipeline **orientado a Domain Events**: en lugar de ejecutar transformaciones secuenciales directamente en `exportNoteToPDF`, el servicio **dispara eventos** y los handlers suscritos reaccionan de forma independiente. Esto permite extender, reordenar o desuscribir cualquier paso sin tocar el código del servicio principal.

### Motivación

| Problema anterior | Solución con eventos |
|---|---|
| Lógica de transformación acoplada en un solo método | Cada handler vive en su propio scope y es reemplazable |
| Difícil agregar nuevas transformaciones | Basta con `pdfEventBus.subscribe(Evento, handler)` |
| Estilos hardcodeados en el template | `PdfPageStyleRegistry` centraliza y desacopla los estilos |

### Flujo del pipeline

```
exportNoteToPDF(title, htmlContent)
       │
       ├─ 1. import html2pdf            (lazy — solo se carga al exportar)
       ├─ 2. buildPdfTemplate()         (función pura, sin side-effects)
       │
       ├─ 3. dispatch(PdfPageBreakMarked)   ──► markPageBreaks()
       ├─ 4. dispatch(PdfHtmlSegmented)     ──► segmentPages()
       ├─ 5. dispatch(PdfStylesInjected)    ──► injectStyles()
       │
       ├─ 6. html2pdf().set(opt).from(element)
       └─ 7. .save()
```

### Estructura de archivos

```
src/services/
 ├── NotesService.js                ← punto de entrada público
 └── pdf/
      ├── index.js                  ← setup + registro de estilos built-in
      ├── PdfEventBus.js            ← bus de eventos (singleton)
      ├── PdfDomainEvents.js        ← clases de los 3 eventos
      ├── PdfPageStyleRegistry.js   ← registro de estilos por página
      └── PdfProcessingHandlers.js  ← los 3 handlers + subscribePdfHandlers()
```

### Los 3 eventos (orden de despacho)

| # | Clase | Handler por defecto | Complejidad |
|---|---|---|---|
| 1 | `PdfPageBreakMarked` | `markPageBreaks` | O(k) — un `querySelectorAll` |
| 2 | `PdfHtmlSegmented` | `segmentPages` | O(n) — walk con `firstChild/nextSibling` + un `DocumentFragment` |
| 3 | `PdfStylesInjected` | `injectStyles` | O(1) — un `querySelector` + string concat |

---

## 2. Cómo registrar eventos (suscribirse al pipeline)

### El bus de eventos

`PdfEventBus` es un bus **sincrónico y ordenado**: los handlers se llaman en el orden en que fueron suscritos, en el mismo hilo de ejecución.

```js
import { pdfEventBus } from 'src/services/pdf';
```

### Suscribir un handler

```js
import { pdfEventBus, PdfStylesInjected } from 'src/services/pdf';

// subscribe(ClaseDeEvento, handler) → devuelve función para desuscribirse
const unsubscribe = pdfEventBus.subscribe(PdfStylesInjected, ({ element }) => {
  // tu lógica aquí
  console.log('Estilos inyectados en:', element);
});

// Para desuscribir:
unsubscribe();
```

### Los 3 eventos disponibles

#### `PdfPageBreakMarked`

Se dispara **justo después** de construir el elemento DOM. El payload contiene el elemento raíz.

```js
import { pdfEventBus, PdfPageBreakMarked } from 'src/services/pdf';

pdfEventBus.subscribe(PdfPageBreakMarked, ({ element }) => {
  // element → div raíz que contiene todo el PDF (estilos + contenido)
  const breaks = element.querySelectorAll('div[data-page-break]');
  console.log(`${breaks.length} saltos de página encontrados`);
});
```

#### `PdfHtmlSegmented`

Se dispara después de marcar los breaks. El payload contiene el wrapper `.pdf-content`.

```js
import { pdfEventBus, PdfHtmlSegmented } from 'src/services/pdf';

pdfEventBus.subscribe(PdfHtmlSegmented, ({ contentEl }) => {
  // contentEl → div.pdf-content (ya segmentado en div.pdf-page por el handler built-in)
  const pages = contentEl.querySelectorAll('.pdf-page');
  console.log(`${pages.length} páginas generadas`);
});
```

#### `PdfStylesInjected`

Se dispara al final del pipeline, antes de renderizar. Úsalo para inyectar cualquier CSS adicional.

```js
import { pdfEventBus, PdfStylesInjected } from 'src/services/pdf';

pdfEventBus.subscribe(PdfStylesInjected, ({ element }) => {
  const styleEl = element.querySelector('style');
  if (styleEl) {
    styleEl.textContent += `
      .mi-clase-custom { font-size: 20px; color: red; }
    `;
  }
});
```

### Reemplazar un handler built-in

Los handlers built-in se suscriben en `index.js` al importar el módulo. Si quieres reemplazarlos, debes desuscribir primero:

```js
import { subscribePdfHandlers } from 'src/services/pdf/PdfProcessingHandlers.js';
import { pdfEventBus, PdfHtmlSegmented } from 'src/services/pdf';

// 1. Desuscribir todo lo built-in
const { unsubscribeAll } = subscribePdfHandlers();
unsubscribeAll();

// 2. Tu handler personalizado
pdfEventBus.subscribe(PdfHtmlSegmented, ({ contentEl }) => {
  // segmentación completamente custom
});
```

> [!WARNING]
> `subscribePdfHandlers()` ya fue llamado una vez en `index.js`. Llamarlo de nuevo **duplica** los handlers. Desuscribe primero con `unsubscribeAll()` si vas a reemplazarlos.

---

## 3. Cómo registrar estilos

### Modelo de estilos: clase sobre el contenedor

El estilo se aplica a **todo el documento** poniendo el nombre del tema como segunda clase en `.pdf-container`:

```html
<div class="pdf-container dark">   ← dark se aplica a todo el PDF
```

El handler `injectStyles` lee esa segunda clase con `container.classList.item(1)`, busca el CSS correspondiente en el registry y lo inyecta en el `<style>` del PDF. Como los selectores apuntan a `.pdf-container.{name}`, el estilo **cascada automáticamente** a `.pdf-header`, `.pdf-title`, `.pdf-content` y todos sus hijos.

> [!WARNING]
> **Por qué el fondo es blanco en páginas 2+** — La raíz del problema:
>
> html2pdf.js captura el elemento como un canvas y lo **corta** en páginas jsPDF. El canvas solo cubre la **altura real del contenido** del `.pdf-container`. Si en la página 2 hay poco contenido (ej. una línea de texto), el canvas termina ahí. El resto de la página 2 es **jsPDF puro — blanco por defecto**. Ningún CSS ni `backgroundColor` de html2canvas llega a esa zona porque está fuera del canvas.
>
> **El fix**: `NotesService.js` calcula `breakCount + 1` páginas y fuerza `min-height = pageCount × 11in` en el contenedor antes de renderizar. Esto asegura que el canvas siempre cubra el alto total de todas las páginas jsPDF.

### El registro de estilos

`PdfPageStyleRegistry` es un singleton que almacena bloques de CSS nombrados.

```js
import { pdfPageStyleRegistry } from 'src/services/pdf';
```

### Registrar un estilo personalizado

Los selectores deben apuntar a `.pdf-container.{nombre}` para que cascaden correctamente:

```js
pdfPageStyleRegistry.register('mi-tema', `
  .pdf-container.mi-tema {
    background-color: #f0f9ff;
    color: #0c4a6e;
  }
  .pdf-container.mi-tema .pdf-title { color: #0ea5e9; }
  .pdf-container.mi-tema .pdf-content h1,
  .pdf-container.mi-tema .pdf-content h2 { color: #0284c7; }
`, { background: '#f0f9ff' });
//   ↑ background: MISMO color que background-color del CSS
//   html2canvas usa esto para rellenar las páginas jsPDF 2, 3...
//   Si no lo defines, las páginas más allá del contenido serán blancas.
```

> [!IMPORTANT]
> `background` en el registro se usa de **tres formas** en `NotesService.js`:
> 1. `containerEl.style.minHeight = pageCount * 11in` — el fix principal: el canvas siempre cubre todas las páginas jsPDF
> 2. `containerEl.style.backgroundColor = canvasBg` — inline style en el contenedor
> 3. `html2canvas.backgroundColor = canvasBg` — fallback para áreas fuera del elemento renderizado

### Aplicar el estilo al exportar

Pasa el nombre del tema como segunda clase en `buildPdfTemplate()` dentro de `NotesService.js`:

```js
// NotesService.js — buildPdfTemplate()
`<div class="pdf-container mi-tema">`
```

Eventualmente esto puede venir como parámetro de `exportNoteToPDF(title, html, theme)`.

### Estilos built-in disponibles

Registrados automáticamente en `index.js`:

| Nombre | Descripción | Selector base | `background` |
|---|---|---|---|
| `default` | Sin overrides — estilos base de `buildPdfTemplate()` | — | `#ffffff` |
| `cover` | Contenido centrado verticalmente | `.pdf-container.cover .pdf-content` | `#ffffff` |
| `dark` | Fondo `#1e1e2e`, texto claro, acentos en violeta/azul | `.pdf-container.dark` | `#1e1e2e` |
| `minimal` | Padding reducido, header simplificado, tipografía compacta | `.pdf-container.minimal` | `#ffffff` |

### API del registro

```js
// Registrar (chainable) — tercer argumento opcional con metadata del renderer
pdfPageStyleRegistry
  .register('portada', `.pdf-container.portada { ... }`, { background: '#ffffff' })
  .register('apendice', `.pdf-container.apendice { ... }`, { background: '#f8fafc' });

// Obtener el CSS de un estilo por nombre
pdfPageStyleRegistry.get('dark');

// Obtener el color de fondo para html2canvas (fallback: '#ffffff')
pdfPageStyleRegistry.getBackground('dark'); // '#1e1e2e'

// Obtener todos los nombres registrados
pdfPageStyleRegistry.getNames(); // ['default', 'cover', 'dark', 'minimal', ...]

// Obtener todo el CSS concatenado (injectStyles lo usa internamente)
pdfPageStyleRegistry.getAllCSS();
```

---

## 4. Guía de extensión

### Agregar un paso al pipeline

Si necesitas una transformación nueva (ej. numerar páginas), lo más limpio es crear un **nuevo evento**:

```js
// 1. Definir el evento en PdfDomainEvents.js
export class PdfPageNumbered {
  constructor(contentEl) { this.contentEl = contentEl; }
}

// 2. Suscribir tu handler
import { pdfEventBus, PdfPageNumbered } from 'src/services/pdf';

pdfEventBus.subscribe(PdfPageNumbered, ({ contentEl }) => {
  contentEl.querySelectorAll('.pdf-page').forEach((page, i) => {
    const num = document.createElement('div');
    num.className = 'pdf-page-number';
    num.textContent = `Página ${i + 1}`;
    page.appendChild(num);
  });
});

// 3. Despachar en NotesService.js después de PdfStylesInjected
pdfEventBus.dispatch(new PdfPageNumbered(contentEl));
```

### Añadir selector de estilo desde la UI

Por ahora el tema se pasa hardcodeado en `buildPdfTemplate()`. Para exponerlo al usuario, el flujo recomendado es:

1. Pasar el tema como parámetro: `exportNoteToPDF(title, html, theme = 'default')`
2. Interpolarlo en el template: `<div class="pdf-container ${theme}">`
3. En la UI, mostrar un selector con `pdfPageStyleRegistry.getNames()` al usuario antes de exportar

---

## 5. Referencia de archivos

| Archivo | Responsabilidad |
|---|---|
| `NotesService.js` | `exportNoteToPDF()` — orquesta el algoritmo de 5 pasos |
| `pdf/PdfEventBus.js` | Bus sincrónico. `subscribe(Clase, fn)` / `dispatch(instancia)` |
| `pdf/PdfDomainEvents.js` | Clases `PdfPageBreakMarked`, `PdfHtmlSegmented`, `PdfStylesInjected` |
| `pdf/PdfPageStyleRegistry.js` | `register()`, `get()`, `getAllCSS()`, `getNames()` |
| `pdf/PdfProcessingHandlers.js` | Los 3 handlers + `subscribePdfHandlers()` |
| `pdf/index.js` | Setup automático al importar. Re-exports públicos. |
