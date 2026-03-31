export function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"

      opacity={"currentOpacity"??.7}

    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
export function EmptyCheckIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="5" stroke="var(--color-border-strong)" strokeWidth="1.5" />
    </svg>
  );
}
export function CheckIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="5" fill="var(--color-primary)" />
      <polyline points="4,9 7.5,12.5 14,6" stroke="#fff" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
export function VaulIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Fondo activo */}
      <rect width="18" height="18" x="3" y="3" rx="4" ry="4" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 0} />
      {/* Cuerpo del baúl */}
      <rect width="18" height="18" x="3" y="3" rx="4" ry="4" />
      {/* Línea divisoria tapa / cuerpo */}
      <line x1="3" y1="10" x2="21" y2="10" />
      {/* Ojo de cerradura ovalado centrado en la línea */}
      <rect x="9.5" y="8" width="5" height="4" rx="2.5" ry="2" fill="currentColor"/>
      {/* Divisores verticales en la parte inferior */}
      {/* <line x1="9" y1="10" x2="9" y2="21" /> */}
      {/* <line x1="15" y1="10" x2="15" y2="21" /> */}
    </svg>
  );
}

/**
 * Icono de "promover tarea" — una flecha hacia arriba saliendo de una bandeja,
 * simboliza convertir una tarea del Baúl en un pendiente formal (diario/semanal).
 */
export function PromoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
      opacity={"currentOpacity"??.7}
    >
      {/* Bandeja / contenedor de salida */}
      <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
      {/* Flecha subiendo */}
      <polyline points="8 9 12 4 16 9" />
      <line x1="12" y1="4" x2="12" y2="15" />
    </svg>
  );
}
