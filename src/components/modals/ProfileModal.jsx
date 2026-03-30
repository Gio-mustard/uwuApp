/**
 * @fileoverview ProfileModal — Bottom sheet for user profile and logout.
 *
 * Displays the current user's avatar, display name, username, and email,
 * with a logout button. Triggered by tapping the profile icon in the header.
 */

import { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { Modal } from './Modal';
import { Avatar } from '../common/Avatar';
import './ProfileModal.css';
import { FileNotFoundError, useUploadUserAvatar } from '../../services/UserService';
import { CameraIcon } from '../common/Icons';

/**
 * @param {{ onClose: () => void }} props
 */
export function ProfileModal({ onClose, open = true }) {
  const { useAuth } = useSession();
  const { user, logout, uploadAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const {upload} = useUploadUserAvatar();

  async function handleLogout() {
    onClose();
    await logout();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];

    setUploading(true);
    try {
      await upload(file)
    }
    catch (FileNotFoundError) {
      console.log('avatar file doesnt exists')
    }
    setUploading(false);
  }

  const initial = user?.displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <Modal
      useDrawer
      open={open}
      onClose={onClose}
      drawerContentClass="profile-vaul-content"
      handleClass="profile-vaul-handle"
      overlayClass="profile-vaul-overlay"
    >
      <div className="profile-vaul-body">
        {/* Avatar Upload */}
        <label className="profile-sheet__avatar-label" aria-label="Cambiar foto de perfil">
          <input 
            type="file" 
            accept="image/*" 
            className="visually-hidden" 
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className={`profile-sheet__avatar${uploading ? ' profile-sheet__avatar--uploading' : ''}`}>
             <Avatar path={user?.avatarUrl} size={72} fallback={initial} />
             {uploading && <div className="profile-sheet__avatar-spinner" />}
             {!uploading && (
               <div className="profile-sheet__avatar-overlay">
                 <CameraIcon />
               </div>
             )}
          </div>
        </label>

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
    </Modal>
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

