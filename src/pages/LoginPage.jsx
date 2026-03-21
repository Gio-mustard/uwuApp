/**
 * @fileoverview LoginPage — Authentication screen.
 *
 * Provides email/password login and registration forms.
 * Delegates to the AuthContext which internally calls the injected IAuthRepository.
 */

import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import './LoginPage.css';

export function LoginPage() {
  const { useAuth } = useSession();
  const { login, register, error, setError } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  function switchMode(m) {
    setMode(m);
    setLocalError('');
    setError && setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Completa todos los campos.');
      return;
    }
    if (mode === 'register' && !displayName) {
      setLocalError('Ingresa tu nombre.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const displayError = localError || error;

  return (
    <div className="login-page">
      <div className="login-page__top">
        <div className="login-page__logo">
          <span className="login-page__logo-text">UWU</span>
          <span className="login-page__logo-dot" />
        </div>
        <h1 className="login-page__tagline">Tus pendientes,<br />tu ritmo.</h1>
      </div>

      <div className="login-page__card">
        {/* Mode toggle */}
        <div className="login-page__toggle">
          <button
            id="login-mode-login"
            className={`login-page__toggle-btn${mode === 'login' ? ' login-page__toggle-btn--active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Iniciar sesión
          </button>
          <button
            id="login-mode-register"
            className={`login-page__toggle-btn${mode === 'register' ? ' login-page__toggle-btn--active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Registrarse
          </button>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="form-field">
              <label className="form-label" htmlFor="ln-name">Nombre</label>
              <input
                id="ln-name"
                className="form-input"
                type="text"
                placeholder="Tu nombre"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                maxLength={40}
              />
            </div>
          )}

          <div className="form-field">
            <label className="form-label" htmlFor="ln-email">Correo</label>
            <input
              id="ln-email"
              className="form-input"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="ln-password">Contraseña</label>
            <input
              id="ln-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {displayError && <p className="form-error">{displayError}</p>}

          <button
            id="ln-submit"
            className="btn-primary login-page__submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Cargando…'
              : mode === 'login'
              ? 'Iniciar sesión'
              : 'Crear cuenta'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="login-page__hint">
            <strong>Demo:</strong> giomus@uwu.app / 123456
          </p>
        )}
      </div>
    </div>
  );
}
