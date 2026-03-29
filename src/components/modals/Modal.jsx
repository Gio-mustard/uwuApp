/**
 * @fileoverview Modal — Generic bottom-sheet modal shell.
 *
 * Provides shared behaviour for all app modals:
 * - Backdrop click closes the modal
 * - Escape key closes the modal
 * - Body scroll is locked while open
 *
 * Usage (modal clásico — sin cambios para los consumidores existentes):
 * ```jsx
 * <Modal onClose={onClose} overlayClass="modal-overlay" sheetClass="modal">
 *   <h2>My content</h2>
 * </Modal>
 * ```
 *
 * Usage (drawer de vaul-base con snap points y fondo escalado):
 * ```jsx
 * <Modal
 *   useDrawer
 *   open={open}
 *   onClose={onClose}
 *   snapPoints={['240px', '400px', 1]}
 *   shouldScaleBackground
 *   drawerContentClass="mi-drawer"
 * >
 *   <h2>Drawer content</h2>
 * </Modal>
 * ```
 *
 * Individual modals supply their own CSS class names so they can keep
 * their current styling without change.
 */

import { useEffect, useCallback } from 'react';
import { Drawer } from 'vaul-base';

/* ─── Modo clásico ──────────────────────────────────────────────────────── */

/**
 * Shell clásico: overlay + sheet estáticos tal como existían antes.
 * Ningun modal existente necesita cambios.
 *
 * @param {{
 *   children:     React.ReactNode,
 *   onClose:      () => void,
 *   overlayClass: string,
 *   sheetClass:   string,
 * }} props
 */
function ClassicModal({ children, onClose, overlayClass, sheetClass }) {
  const handleKey = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    // Lock body scroll while the modal is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [handleKey]);

  /** Close only when the backdrop itself is clicked, not the sheet. */
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={overlayClass} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className={sheetClass}>
        {children}
      </div>
    </div>
  );
}

/* ─── Modo vaul-base ────────────────────────────────────────────────────── */

/**
 * Shell de vaul-base: drawer con snap points, fondo escalado y handle.
 *
 * @param {{
 *   children:             React.ReactNode,
 *   open:                 boolean,
 *   onClose:              () => void,
 *   snapPoints?:          (string | number)[],  // ej. ['240px','400px',1]
 *   activeSnapPoint?:     string | number,
 *   onSnapPointChange?:   (snap: string | number) => void,
 *   shouldScaleBackground?: boolean,
 *   drawerContentClass?:  string,               // clase CSS para Drawer.Content
 *   handleClass?:         string,               // clase CSS para el handle
 *   overlayClass?:        string,               // clase CSS para Drawer.Overlay
 * }} props
 */
function VaulDrawer({
  children,
  open,
  onClose,
  snapPoints,
  activeSnapPoint,
  onSnapPointChange,
  shouldScaleBackground = false,
  drawerContentClass = 'vaul-drawer__content',
  handleClass = 'vaul-drawer__handle',
  overlayClass = 'vaul-drawer__overlay',
}) {
  // ── Scroll lock ───────────────────────────────────────────────────────────
  // Sin esto, en iOS el browser puede hacer scroll del window cuando el
  // teclado aparece (sobre todo la segunda vez), desplazando el drawer hacia
  // abajo aunque tenga position:fixed;bottom:0.
  //
  // NO usamos position:fixed en body porque provoca un salto al abrir.
  // En cambio: overflow:hidden + prevención de touchmove en document,
  // exceptuando los contenedores scrollables internos del drawer.
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Scrollable wrappers definidos en los distintos modales de la app.
    const SCROLL_SELECTORS = [
      '.modal-vaul-body',
      '.profile-vaul-body',
      '.vaul-drawer__body',
      '.confirm-vaul-body',
    ].join(', ');

    const preventTouchMove = (e) => {
      // Permite scroll dentro de los cuerpos scrollables del drawer.
      if (e.target.closest(SCROLL_SELECTORS)) return;
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, [open]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={onSnapPointChange}
      shouldScaleBackground={shouldScaleBackground}
    >
      <Drawer.Portal>
        <Drawer.Overlay className={overlayClass} />
        <Drawer.Content className={drawerContentClass} role="dialog" aria-modal="true">
          <Drawer.Handle className={handleClass} />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* ─── Exportación unificada ─────────────────────────────────────────────── */

/**
 * Componente unificado Modal.
 *
 * - `useDrawer={false}` (default) → comportamiento clásico idéntico al original.
 * - `useDrawer={true}`            → drawer de vaul-base con todas sus funciones.
 *
 * Las props extras de VaulDrawer sólo se usan cuando `useDrawer={true}`.
 *
 * @param {{
 *   useDrawer?:           boolean,
 *   children:             React.ReactNode,
 *   onClose:              () => void,
 *   open?:                boolean,
 *   overlayClass?:        string,
 *   sheetClass?:          string,
 *   snapPoints?:          (string | number)[],
 *   activeSnapPoint?:     string | number,
 *   onSnapPointChange?:   (snap: string | number) => void,
 *   shouldScaleBackground?: boolean,
 *   drawerContentClass?:  string,
 *   handleClass?:         string,
 * }} props
 */
export function Modal({
  useDrawer = false,
  children,
  onClose,
  open,
  overlayClass,
  sheetClass,
  snapPoints,
  activeSnapPoint,
  onSnapPointChange,
  shouldScaleBackground,
  drawerContentClass,
  handleClass,
}) {
  if (useDrawer) {
    return (
      <VaulDrawer
        open={open}
        onClose={onClose}
        snapPoints={snapPoints}
        activeSnapPoint={activeSnapPoint}
        onSnapPointChange={onSnapPointChange}
        shouldScaleBackground={shouldScaleBackground}
        drawerContentClass={drawerContentClass}
        handleClass={handleClass}
        overlayClass={overlayClass}
      >
        {children}
      </VaulDrawer>
    );
  }

  return (
    <ClassicModal onClose={onClose} overlayClass={overlayClass} sheetClass={sheetClass}>
      {children}
    </ClassicModal>
  );
}
