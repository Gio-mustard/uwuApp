/**
 * @fileoverview Modal — Generic bottom-sheet modal shell.
 *
 * Provides shared behaviour for all app modals:
 * - Backdrop click closes the modal
 * - Escape key closes the modal
 * - Body scroll is locked while open
 *
 * Usage:
 * ```jsx
 * <Modal onClose={onClose} overlayClass="modal-overlay" sheetClass="modal">
 *   <h2>My content</h2>
 * </Modal>
 * ```
 *
 * Individual modals supply their own CSS class names so they can keep
 * their current styling without change.
 */

import { useEffect, useCallback } from 'react';

/**
 * @param {{
 *   children:     React.ReactNode,
 *   onClose:      () => void,
 *   overlayClass: string,
 *   sheetClass:   string,
 * }} props
 */
export function Modal({ children, onClose, overlayClass, sheetClass }) {
  // Stable reference so addEventListener / removeEventListener match.
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
