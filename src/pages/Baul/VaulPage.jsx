/**
 * @fileoverview VaulPage — Demostración del drawer de vaul-base.
 *
 * Muestra tres ejemplos del componente Modal con useDrawer=true:
 *  1. Básico   — drawer simple que se abre y cierra.
 *  2. Snap Points — drawer con tres alturas de snap.
 *  3. Scrollable  — drawer con contenido largo y scroll interno.
 */

import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Modal } from '../../components/modals/Modal';
import './VaulPage.css';

/* ─── Ejemplo 1: Básico ──────────────────────────────────────────────────── */
function BasicDrawerExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="vaul-example-card">
      <span className="vaul-example-card__label">Básico</span>
      <p className="vaul-example-card__desc">
        Drawer simple que se abre desde la parte inferior. Arrástralo hacia abajo o pulsa fuera para cerrarlo.
      </p>
      <button
        id="vaul-basic-open"
        className="vaul-open-btn"
        onClick={() => setOpen(true)}
      >
        Abrir drawer
      </button>

      <Modal
        useDrawer
        open={open}
        onClose={() => setOpen(false)}
        drawerContentClass="vaul-drawer__content"
        handleClass="vaul-drawer__handle"
        overlayClass="vaul-drawer__overlay"
      >
        <div className="vaul-drawer__body">
          <h2 className="vaul-drawer__title">Drawer básico</h2>
          <p className="vaul-drawer__text">
            Este drawer usa el componente <code>Modal</code> con <code>useDrawer=&#123;true&#125;</code>.
            Puedes arrastrarlo hacia abajo o tocar el overlay para cerrarlo.
          </p>
          <button
            id="vaul-basic-close"
            className="vaul-open-btn vaul-open-btn--secondary"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Ejemplo 2: Snap Points ─────────────────────────────────────────────── */
const SNAPS = ['160px', '360px', 1];
const SNAP_LABELS = ['Pequeño', 'Mediano', 'Completo'];

function SnapPointsExample() {
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState(SNAPS[0]);

  function handleOpen() {
    setSnap(SNAPS[0]);
    setOpen(true);
  }

  return (
    <div className="vaul-example-card">
      <span className="vaul-example-card__label">Snap Points</span>
      <p className="vaul-example-card__desc">
        El drawer puede anclar a tres alturas distintas. Arrastra o usa los botones para cambiar.
      </p>
      <button
        id="vaul-snap-open"
        className="vaul-open-btn"
        onClick={handleOpen}
      >
        Abrir con snap points
      </button>

      <Modal
        useDrawer
        open={open}
        onClose={() => setOpen(false)}
        snapPoints={SNAPS}
        activeSnapPoint={snap}
        onSnapPointChange={setSnap}
        drawerContentClass="vaul-drawer__content"
        handleClass="vaul-drawer__handle"
        overlayClass="vaul-drawer__overlay"
      >
        <div className="vaul-drawer__body">
          <h2 className="vaul-drawer__title">Snap Points</h2>
          <p className="vaul-drawer__text">
            Selecciona una altura o arrastra el handle.
          </p>
          <div className="vaul-snap-row">
            {SNAPS.map((s, i) => (
              <button
                key={s}
                id={`vaul-snap-${i}`}
                className={`vaul-snap-pill${snap === s ? ' vaul-snap-pill--active' : ''}`}
                onClick={() => setSnap(s)}
              >
                {SNAP_LABELS[i]}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Ejemplo 3: Scrollable ──────────────────────────────────────────────── */
const ITEMS = Array.from({ length: 20 }, (_, i) => `Tarea pendiente #${i + 1}`);

function ScrollableExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="vaul-example-card">
      <span className="vaul-example-card__label">Scrollable</span>
      <p className="vaul-example-card__desc">
        Drawer con contenido largo que se puede desplazar sin que el gesto de arrastre interfiera.
      </p>
      <button
        id="vaul-scroll-open"
        className="vaul-open-btn"
        onClick={() => setOpen(true)}
      >
        Abrir lista larga
      </button>

      <Modal
        useDrawer
        open={open}
        onClose={() => setOpen(false)}
        drawerContentClass="vaul-drawer__content"
        handleClass="vaul-drawer__handle"
        overlayClass="vaul-drawer__overlay"
      >
        <div className="vaul-drawer__body">
          <h2 className="vaul-drawer__title">Lista scrollable</h2>
          <ul className="vaul-scroll-list">
            {ITEMS.map((item) => (
              <li key={item} className="vaul-scroll-item">{item}</li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export function VaulPage() {
  const [open, setOpen] = useState(true);

  return (
    <AppShell>
      <Modal
        useDrawer
        open={open}
        onClose={() => setOpen(false)}
        drawerContentClass="vaul-drawer__content"
        handleClass="vaul-drawer__handle"
        overlayClass="vaul-drawer__overlay"
      >
        <main id='vaul-page'>

          <h1>Proximamente aqui podras guardar pendientes!</h1>
          <p>pendientes que sabes que tienes que hacer pero aun no los vas a hacer...</p>
          <div className="form-field">
            <label className="form-label" htmlFor="task-title">Título *</label>
            <input
              id="task-title"
              className="form-input"
              type="text"
              placeholder="Ej: Tomar vitaminas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              autoFocus
            />
          </div>
        </main>
      </Modal>

    </AppShell>
  );
}