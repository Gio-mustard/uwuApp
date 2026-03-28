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
import { Avatar } from '../common/Avatar';
import { ProfileModal } from '../modals/ProfileModal';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: HOME_TEXTS.navHome, path: ROUTES.HOME, icon: HomeIcon },
  { label: HOME_TEXTS.navHistory, path: ROUTES.HISTORY, icon: HistoryIcon },
  { label: HOME_TEXTS.navVaul, path: ROUTES.Baul, icon: VaulIcon },
  { label: 'Configuración', path: ROUTES.SETTINGS, icon: SettingsIcon },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { useAuth } = useSession();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const initial = user?.displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      <aside className="sidebar" aria-label="Navigation">
        {/* Brand */}
        <div className="sidebar__brand">
          <span className="sidebar__brand-text">UWU</span>
          <span className="sidebar__brand-dot" aria-hidden="true" />
        </div>

        {/* User card */}
        <div className="sidebar__user" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
          <Avatar path={user?.avatarUrl} size={30} fallback={initial} />
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
      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </>
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

function SettingsIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function VaulIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 0} />
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="9" x2="12" y2="10" />
      <line x1="12" y1="14" x2="12" y2="15" />
      <line x1="9" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="15" y2="12" />
    </svg>
  );
}
