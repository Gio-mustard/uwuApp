# PdfStylePickerModal

Este componente provee la UI para que el usuario pueda seleccionar de manera visual un tema (Theme) antes de exportar una nota a PDF.

## Diseño

Se implementó como un *bottom-sheet modal* usando el componente base `Modal.jsx` (`useDrawer=true`). Consiste en:

1. **Header**: Título y breve descripción instruccional.
2. **Grid de Previews**: Las tarjetas muestran el contenido y título **real** de la nota del usuario aplicando los colores exactos del tema.
   - Las tarjetas se autogeneran iterando sobre `pdfPageStyleRegistry.getAll()`.
   - Si añades un nuevo theme usando `.register(name, css, metadata)` en `index.js`, la tarjeta **aparecerá automáticamente** en el modal, usando los colores definidos en la key `preview` del metadata.
3. **Controles**: Botón principal para exportar (llama a la función con el tema elegido) y botón para cancelar.

## Persistencia 

La preferencia elegida por el usuario para una nota particular se guarda en el **localStorage** (`pdf-theme:{noteId}`). Así, si el usuario exporta la misma nota múltiples veces, su tema favorito estará pre-seleccionado. Las notas nuevas (sin id) inician siempre en `default`. No hay necesidad de backend ni alterar la BDD para esto.

## Propiedades (Props)

```jsx
<PdfStylePickerModal
  open={Boolean}           // Controla si el modal es visible
  onClose={Function}       // Callback llamado al cancelar/cerrar
  onExport={Function}      // Recibe (themeName) al confirmar
  noteTitle={String}       // Titulo real para renderizar el snippet
  noteContent={String}     // Contenido real para obtener un preview del texto
  noteId={String}          // ID de la nota para buscar/guardar en localStorage
/>
```

## Agragar un nuevo tema a la UI

Si deseas agregar un estilo que aparezca en el picker, extiéndelo en `index.js`:

```javascript
pdfPageStyleRegistry.register('mi-tema', `
   /* Tu CSS para tu tema aquí */
`, {
  background: '#ffffff', // Para html2canvas (el fill base jsPDF)
  label: 'Mi Tema Pro',  // Se mostrará debajo de la tarjeta
  preview: {             // Colores para estilizar la miniatura
     bg: '#ffffff',
     text: '#333333',
     accent: '#ff0000',
     header: '#ff000040'
  }
});
```
