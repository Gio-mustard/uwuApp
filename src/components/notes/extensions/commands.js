const editor_commands = [
    { id: 'bold', title: 'Negrita', desc: 'Hacer el texto en negrita.', label: 'B', style: 'bold', action: (e) => e.chain().focus().toggleBold().run() },
    { id: 'italic', title: 'Itálica', desc: 'Hacer el texto en cursiva.', label: 'I', style: 'italic', action: (e) => e.chain().focus().toggleItalic().run() },
    { id: 'strike', title: 'Tachado', desc: 'Tachar el texto.', label: 'S̶', action: (e) => e.chain().focus().toggleStrike().run() },
    { id: 'h2', title: 'Encabezado', desc: 'Añadir un encabezado grande.', label: 'H2', action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e) => e.isActive('heading', { level: 2 }) },
    { id: 'h3', title: 'Subtítulo', desc: 'Añadir un encabezado mediano.', label: 'H3', action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), active: (e) => e.isActive('heading', { level: 3 }) },
    { id: 'ul', title: 'Lista', desc: 'Crear una lista con viñetas.', label: '≡', action: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive('bulletList') },
    { id: 'ol', title: 'Lista núm.', desc: 'Crear una lista numerada.', label: '1.', action: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive('orderedList') },
    { id: 'code', title: 'Código', desc: 'Añadir un bloque de código.', label: '<>', action: (e) => e.chain().focus().toggleCode().run(), active: (e) => e.isActive('code') },
    { id: 'quote', title: 'Cita', desc: 'Añadir una cita en bloque.', label: '❝', action: (e) => e.chain().focus().toggleBlockquote().run(), active: (e) => e.isActive('blockquote') },
    { id: 'hr', title: 'Separador', desc: 'Añadir una línea divisoria.', label: '—', action: (e) => e.chain().focus().setHorizontalRule().run() },
    { id: 'break page', title: 'Nueva Página', desc: 'Insertar un salto de página.', label: 'Pg', style: 'break-page', action: (e) => e.chain().focus().insertPageBreak().run(), active: (e) => e.isActive('blockquote') }
];

export default editor_commands;