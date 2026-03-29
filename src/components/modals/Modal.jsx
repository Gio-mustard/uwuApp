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
  // ── Scroll lock robusto para iOS ──────────────────────────────────────────
  // `overflow: hidden` solo no es suficiente en iOS Safari: el browser puede
  // seguir reposicionando el layout viewport al abrir el teclado. La solución
  // es fijar el body en su posición actual con position:fixed.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top:      document.body.style.top,
      width:    document.body.style.width,
    };
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top      = `-${scrollY}px`;
    document.body.style.width    = '100%';
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.position = prev.position;
      document.body.style.top      = prev.top;
      document.body.style.width    = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // ── Teclado virtual (visualViewport) ─────────────────────────────────────
  // Cuando aparece el teclado el visualViewport encoge pero position:fixed;
  // bottom:0 queda anclado al layout viewport completo. Ajustamos `bottom`
  // inline — es una propiedad distinta a `transform`, no interfiere con vaul.
  //
  // En drawers con scroll también ajustamos `maxHeight` al espacio visible
  // (vv.height). Sin esto, el drawer puede ser más alto que el área visible
  // sobre el teclado y el scroll interno se rompe o el drawer se sale por arriba.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const getDrawerContent = () =>
      document.querySelector(`.${drawerContentClass.split(' ')[0]}`);

    function onViewport() {
      const kbHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      const drawer = getDrawerContent();
      if (!drawer) return;

      if (kbHeight > 0) {

        drawer.style.bottom = `${kbHeight}px`;

        drawer.style.maxHeight = `${vv.height - 8}px`;
      } else {
        drawer.style.bottom = '0';
        drawer.style.maxHeight = '92dvh';
      }
    }

    vv.addEventListener('resize', onViewport);
    vv.addEventListener('scroll', onViewport);
    return () => {
      vv.removeEventListener('resize', onViewport);
      vv.removeEventListener('scroll', onViewport);
      const drawer = getDrawerContent();
      if (drawer) {
        drawer.style.bottom = '0';
        drawer.style.maxHeight = '92dvh';
      }
    };
  }, [open, drawerContentClass]);

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
