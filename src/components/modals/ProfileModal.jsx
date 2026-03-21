/**
 * @fileoverview ProfileModal — Bottom sheet for user profile and logout.
 *
 * Displays the current user's avatar, display name, username, and email,
 * with a logout button. Triggered by tapping the profile icon in the header.
 */

import { useSession } from '../../context/SessionContext';
import './ProfileModal.css';

/**
 * @param {{ onClose: () => void }} props
 */
export function ProfileModal({ onClose }) {
  const { useAuth } = useSession();
  const { user, logout } = useAuth();

  async function handleLogout() {
    onClose();
    await logout();
  }

  const initial = user?.displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <div
      className="profile-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Perfil de usuario"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="profile-sheet">
        {/* Drag handle */}
        <div className="profile-sheet__handle" aria-hidden="true" />

        {/* Avatar */}
        <div className="profile-sheet__avatar" aria-hidden="true">
          {initial}
        </div>

        {/* Info */}
        <div className="profile-sheet__info">
          <h2 className="profile-sheet__name">{user?.displayName}</h2>
          <span className="profile-sheet__username">{user?.username}</span>
          <span className="profile-sheet__email">{user?.email}</span>
        </div>

        {/* Divider */}
        <div className="profile-sheet__divider" />

        {/* Actions */}
        <button
          id="profile-logout-btn"
          className="profile-sheet__logout"
          onClick={handleLogout}
        >
          <LogoutIcon />
          Cerrar sesión
        </button>

        <button
          id="profile-cancel-btn"
          className="profile-sheet__cancel"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
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
