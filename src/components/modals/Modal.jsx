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

import { useEffect, useCallback, useState } from 'react';
import { Drawer } from 'vaul-base';
import './Modal.css';


/* ─── Modo clásico ──────────────────────────────────────────────────────── */

/**
 * Shell clásico: overlay + sheet estáticos tal como existían antes.
 * Ningun modal existente necesita cambios.
 *
 * @param {{
 *   open:         boolean,
 *   children:     React.ReactNode,
 *   onClose:      () => void,
 *   overlayClass: string,
 *   sheetClass:   string,
 * }} props
 */
function ClassicModal({ open, children, onClose, overlayClass, sheetClass }) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  // Gestiona el ciclo de vida: open → visible; !open → animación de salida → desmontaje
  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const t = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 280); // debe coincidir con la duración de la animación CSS
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKey = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    if (!visible) return;
    document.addEventListener('keydown', handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [visible, handleKey]);

  if (!visible) return null;

  /** Cierra solo cuando se hace click en el backdrop, no en el sheet. */
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const overlayAnimClass = closing ? ' modal-overlay--closing' : ' modal-overlay--open';
  const sheetAnimClass   = closing ? ' modal-sheet--closing'   : ' modal-sheet--open';

  return (
    <div
      className={`modal-overlay${overlayAnimClass}${overlayClass ? ' ' + overlayClass : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={`modal-sheet${sheetAnimClass}${sheetClass ? ' ' + sheetClass : ''}`}>
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
  


  // ── minHeight lock ────────────────────────────────────────────────────────
 
  useEffect(() => {
    if (!open) return;

    const selector = `.${drawerContentClass.split(' ')[0]}`;

    const timer = setTimeout(() => {
      const el = document.querySelector(selector);
      if (!el) return;
      const h = el.getBoundingClientRect().height;
      if (h > 0) el.style.minHeight = `${h}px`;
    }, 350); // NO CHANGE THIS!!!!!

    return () => {
      clearTimeout(timer);
      const el = document.querySelector(selector);
      if (el) el.style.minHeight = '';
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
        <Drawer.Content className={"vaul-drawer-content "+drawerContentClass} role="dialog" aria-modal="true">
          <Drawer.Handle className={handleClass} />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}


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
    <ClassicModal open={open} onClose={onClose} overlayClass={overlayClass} sheetClass={sheetClass}>
      {children}
    </ClassicModal>
  );
}
