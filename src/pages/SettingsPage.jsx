/**
 * @fileoverview SettingsPage — Configuration options for the app.
 *
 * Displays different settings options such as profile overview,
 * app preferences, and about info, with a modern glassmorphic look.
 */

import { useSession } from '../context/SessionContext';
import { AppShell } from '../components/layout/AppShell';
import { Avatar } from '../components/common/Avatar';
import './SettingsPage.css';
import './Settings__profile.css'
import ColorPallete from '../components/common/ColorPalete';
import { useRef, useState } from 'react';
import { CameraIcon } from '../components/common/Icons';
import {  useUploadUserAvatar } from '../services/UserService';


function SettingsSection({ children, title, sectionClassName, titleClassName }) {
  return (
    <section className={`settings-section ${sectionClassName}`}>
      <h2 className={`settings-section__title ${titleClassName}`}>{title}</h2>
      <div className='settings-card'>
        {children}
      </div>
    </section>
  )
}


export function SettingsPage() {
  const { useAuth } = useSession();
  const { user, logout, uploadAvatar } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const inputAvatarRef = useRef(null);
  const {upload} = useUploadUserAvatar();

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    setUploadingAvatar(true);
    try {
      await upload(file)
    }
    catch (FileNotFoundError) {
      console.log('avatar file doesnt exists')
    }
    setUploadingAvatar(false);
  }


  const initial = user?.displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <AppShell>
      <div className="settings-page">
        <header className="settings-header">
          <h1 className="settings-header__title">Configuración</h1>
          <p className="settings-header__subtitle">Administra tus preferencias y tu cuenta</p>
        </header>

        <div className="settings-content">
          {/* Profile Section */}
          <SettingsSection title={'Tu perfil'} sectionClassName='profile'>

            <div className="profile-settings-card__avatar">

              <input
                type="file"
                accept="image/*"
                className="visually-hidden"
                onChange={handleFileChange}
                disabled={uploadingAvatar}
                ref={inputAvatarRef}
              />
              <div className={`profile-sheet__avatar${uploadingAvatar ? ' profile-sheet__avatar--uploading' : ''}`}>
                <Avatar path={user?.avatarUrl} size={160} fallback={initial} />
                {uploadingAvatar && <div className="profile-sheet__avatar-spinner" />}
                {!uploadingAvatar && (
                  <div className="profile-sheet__avatar-overlay">
                    <CameraIcon />
                  </div>
                )}
              </div>

              <button className='btn-primary btn-edit-avatar' onClick={() => inputAvatarRef.current.click()}>Editar fotico</button>

            </div>
            <div className="profile-settings-card__info">
              <h3>{user?.displayName ?? 'Usuario'}</h3>
              <p>{user?.email ?? '@usuario'}</p>

            </div>


          </SettingsSection>

          {/* Preferences Section */}
          <SettingsSection title='Preferencias'>

            <div className="settings-option">
              <div className="settings-option__info">
                <h4>Paleta de color</h4>
                <p>Ajuste de apariencia de colores principales</p>
              </div>
              <br />
              <ColorPallete />
            </div>
            {/*             
              <hr className="settings-divider" />
              <div className="settings-option">
                <div className="settings-option__info">
                  <h4>Tema Oscuro</h4>
                  <p>Ajuste de apariencia general (aun no jala pero no lo voy a quitar porque si lo quiero meter)</p>
                </div>
                <label className="switch">
                  <input type="checkbox"  disabled onInput={()=>appColorPallete.toggleTheme()} />
                  <span className="slider round"></span>
                </label>
              </div> */}



          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection title='Peligro' sectionClassName='dangerous'>


            <div className="settings-option">
              <div className="settings-option__info">
                <h4>Cerrar Sesión</h4>
                <p>Desconectar tu cuenta de este dispositivo</p>
              </div>
              <button className="settings-btn settings-btn--danger" onClick={logout}>
                Cerrar Sesión
              </button>
            </div>

          </SettingsSection>
        </div>
      </div>
    </AppShell>
  );
}
