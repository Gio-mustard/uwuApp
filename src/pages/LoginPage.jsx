/**
 * @fileoverview LoginPage — Authentication screen.
 *
 * Provides email/password login and registration forms.
 * Delegates to the AuthContext which internally calls the injected IAuthRepository.
 */

import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { AUTH_TEXTS } from '../constants/texts/auth.texts';
import './LoginPage.css';

export function LoginPage() {
  const { useAuth } = useSession();
  const { login, register, signInWithGoogle, error, setError } = useAuth();

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
      setLocalError(AUTH_TEXTS.errorEmptyFields);
      return;
    }
    if (mode === 'register' && !displayName) {
      setLocalError(AUTH_TEXTS.errorNoName);
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

  async function handleGoogleLogin() {
    setLoading(true);
    setLocalError('');
    await signInWithGoogle();
    // No finally(setLoading(false)) because if successful, the page unloads/redirects to Google
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
            {AUTH_TEXTS.loginTab}
          </button>
          <button
            id="login-mode-register"
            className={`login-page__toggle-btn${mode === 'register' ? ' login-page__toggle-btn--active' : ''}`}
            onClick={() => switchMode('register')}
          >
            {AUTH_TEXTS.registerTab}
          </button>
        </div>

        <div className="login-page__social">
          <button
            type="button"
            className="login-page__google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <GoogleIcon />
            Continuar con Google
          </button>
        </div>

        <div className="login-page__divider">
          <span>o con correo electrónico</span>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="form-field">
              <label className="form-label" htmlFor="ln-name">{AUTH_TEXTS.labelName}</label>
              <input
                id="ln-name"
                className="form-input"
                type="text"
                placeholder={AUTH_TEXTS.placeholderName}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                maxLength={40}
              />
            </div>
          )}

          <div className="form-field">
            <label className="form-label" htmlFor="ln-email">{AUTH_TEXTS.labelEmail}</label>
            <input
              id="ln-email"
              className="form-input"
              type="email"
              placeholder={AUTH_TEXTS.placeholderEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="ln-password">{AUTH_TEXTS.labelPassword}</label>
            <input
              id="ln-password"
              className="form-input"
              type="password"
              placeholder={AUTH_TEXTS.placeholderPassword}
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
              ? AUTH_TEXTS.submitting
              : mode === 'login'
              ? AUTH_TEXTS.submitLogin
              : AUTH_TEXTS.submitRegister}
          </button>
        </form>

        {mode === 'login' && (
          <p className="login-page__hint">
            <strong>{AUTH_TEXTS.demoLabel}</strong> {AUTH_TEXTS.demoHint.split(': ')[1]}
          </p>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="20px" height="20px">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}
