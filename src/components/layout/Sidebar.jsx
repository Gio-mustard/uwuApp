/**
 * @fileoverview Sidebar — Desktop-only left navigation panel.
 *
 * Rendered by AppShell on viewports ≥ 768px.
 * Displays the app logo, the current user info, navigation links,
 * and a logout shortcut. Hidden on mobile (BottomNav is used instead).
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { ROUTES } from '../../constants/routes';
import { HOME_TEXTS } from '../../constants/texts/home.texts';
import { COMMON_TEXTS } from '../../constants/texts/common.texts';
import './Sidebar.css';

const NAV_ITEMS = [
  { label: HOME_TEXTS.navHome,    path: ROUTES.HOME,    icon: HomeIcon },
  { label: HOME_TEXTS.navHistory, path: ROUTES.HISTORY, icon: HistoryIcon },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { useAuth } = useSession();
  const { user, logout } = useAuth();

  const initial = user?.displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <aside className="sidebar" aria-label="Navigation">
      {/* Brand */}
      <div className="sidebar__brand">
        <span className="sidebar__brand-text">UWU</span>
        <span className="sidebar__brand-dot" aria-hidden="true" />
      </div>

      {/* User card */}
      <div className="sidebar__user">
        <div className="sidebar__avatar" aria-hidden="true">{initial}</div>
        <div className="sidebar__user-info">
          <span className="sidebar__display-name">{user?.displayName}</span>
          <span className="sidebar__username">{user?.username}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              id={`sidebar-nav-${label.toLowerCase()}`}
              className={`sidebar__nav-item${active ? ' sidebar__nav-item--active' : ''}`}
              onClick={() => navigate(path)}
              aria-current={active ? 'page' : undefined}
            >
              <Icon active={active} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="sidebar__spacer" />

      {/* Logout */}
      <button
        id="sidebar-logout"
        className="sidebar__logout"
        onClick={logout}
        aria-label={COMMON_TEXTS.logout}
      >
        <LogoutIcon />
        <span>{COMMON_TEXTS.logout}</span>
      </button>
    </aside>
  );
}

function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" fill="none" />
    </svg>
  );
}

function HistoryIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 0} />
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
