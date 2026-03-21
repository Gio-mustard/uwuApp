/**
 * @fileoverview AppShell — Main layout wrapper for authenticated screens.
 *
 * Mobile  (< 768px): Content area + fixed BottomNav, max-width 430px centered.
 * Desktop (≥ 768px): Sidebar (left) + scrollable Content (right), full viewport.
 */

import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import './AppShell.css';

/**
 * @param {{ children: React.ReactNode }} props
 */
export function AppShell({ children }) {
  return (
    <div className="app-shell">
      {/* Desktop sidebar — hidden via CSS on mobile */}
      <Sidebar />

      {/* Main scrollable content */}
      <main className="app-shell__content">
        <div className="app-shell__inner">{children}</div>
      </main>

      {/* Mobile bottom nav — hidden via CSS on desktop */}
      <BottomNav />
    </div>
  );
}
