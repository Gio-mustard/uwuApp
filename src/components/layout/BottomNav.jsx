/**
 * @fileoverview BottomNav — Fixed bottom navigation bar.
 * Renders "Inicio" and "Historial" tabs with icon feedback.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { HOME_TEXTS } from '../../constants/texts/home.texts';
import './BottomNav.css';

const tabs = [
  { label: HOME_TEXTS.navHome,    path: ROUTES.HOME,    icon: HomeIcon },
  { label: HOME_TEXTS.navHistory, path: ROUTES.HISTORY, icon: HistoryIcon },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(({ label, path, icon: Icon }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            id={`nav-${label.toLowerCase()}`}
            className={`bottom-nav__tab${active ? ' bottom-nav__tab--active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon active={active} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
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
