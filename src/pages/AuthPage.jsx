import '../landing.css'
import { useState, useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import {
  HeartHandshake, Mail, Lock, User, Eye, EyeOff,
  Heart, Sparkles, Shield, ArrowLeft
} from 'lucide-react'

export function AuthPage({ onAuthSuccess, redirectTo = '/home' }) {
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const minProcessingDelayMs = 1200

  // When user switches to login mode, ask browser to show saved credentials popup
  useEffect(() => {
    if (!isLogin) return
    if (
      typeof window === 'undefined' ||
      !('PasswordCredential' in window) ||
      !navigator.credentials?.get
    ) {
      return
    }

    navigator.credentials
      .get({ password: true, mediation: 'optional' })
      .then((cred) => {
        if (cred && cred.type === 'password') {
          setFormData((prev) => ({
            ...prev,
            email: cred.id || '',
            password: cred.password || '',
          }))
          // Automatically trigger login with the retrieved credentials
          if (cred.id && cred.password) {
             performAuth(cred.id, cred.password, true)
          }
        }
      })
      .catch(() => {
        // Browser denied or user dismissed — nothing to do.
      })
  }, [isLogin])

  async function savePasswordToBrowser(email, password) {
    if (
      typeof window === 'undefined' ||
      !('PasswordCredential' in window) ||
      !navigator.credentials?.store
    ) {
      return
    }

    try {
      const credential = new window.PasswordCredential({
        id: email,
        password,
        name: email,
      })
      await navigator.credentials.store(credential)
    } catch {
      // Ignore: browser manages support and permission prompts.
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleModeSwitch(newMode) {
    if (newMode === mode) return
    setMode(newMode)
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
    setStatus({ loading: false, error: '', success: '' })
  }

  async function handleSubmit(event) {
    if (event) event.preventDefault()
    await performAuth(formData.email, formData.password, isLogin, formData.fullName)
  }

  async function performAuth(email, password, isLoginMode, fullName = '') {
    setStatus({ loading: false, error: '', success: '' })

    if (!isLoginMode && password !== formData.confirmPassword) {
      setStatus({ loading: false, error: 'Passwords do not match.', success: '' })
      return
    }

    if (!email || !password) {
      setStatus({ loading: false, error: 'Please fill in all required fields.', success: '' })
      return
    }

    if (!isLoginMode && !fullName) {
      setStatus({ loading: false, error: 'Please enter your full name.', success: '' })
      return
    }

    setStatus({ loading: true, error: '', success: '' })

    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup'
    const payload = isLoginMode
      ? { email, password }
      : {
          fullName,
          email,
          password,
        }

    try {
      const startedAt = Date.now()
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.')
      }

      const elapsed = Date.now() - startedAt
      if (elapsed < minProcessingDelayMs) {
        await new Promise((resolve) =>
          setTimeout(resolve, minProcessingDelayMs - elapsed),
        )
      }

      if (isLoginMode) {
        await savePasswordToBrowser(email, password)
        localStorage.setItem('soulchat-user', JSON.stringify({ fullName: data.user.fullName, email: data.user.email }))
        setStatus({
          loading: false,
          error: '',
          success: 'Login successful.',
        })
        onAuthSuccess()
        navigate(redirectTo, { replace: true })
      } else {
        // Save credentials to browser after successful signup
        await savePasswordToBrowser(email, password)
        setStatus({
          loading: false,
          error: '',
          success: 'Account created. Please log in with your new credentials.',
        })
        setMode('login')
        setFormData({
          fullName: '',
          email: email,
          password: '',
          confirmPassword: '',
        })
      }
    } catch (error) {
      // If the backend server is unreachable, fall back to local-only auth
      if (
        error.name === 'TypeError' &&
        (error.message === 'Failed to fetch' || error.message.includes('NetworkError'))
      ) {
        await handleLocalAuth(email, password, isLoginMode, fullName)
      } else {
        setStatus({ loading: false, error: error.message, success: '' })
      }
    }
  }

  async function handleLocalAuth(email, password, isLoginMode, fullName) {
    const USERS_KEY = 'soulchat-users'
    const stored = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const normalizedEmail = email.toLowerCase().trim()

    await new Promise((r) => setTimeout(r, minProcessingDelayMs))

    if (isLoginMode) {
      const user = stored.find((u) => u.email === normalizedEmail)
      if (!user) {
        setStatus({ loading: false, error: 'No account found with this email. Please sign up first.', success: '' })
        return
      }
      if (user.password !== password) {
        setStatus({ loading: false, error: 'Invalid email or password.', success: '' })
        return
      }
      localStorage.setItem('soulchat-user', JSON.stringify({ fullName: user.fullName, email: user.email }))
      await savePasswordToBrowser(email, password)
      setStatus({ loading: false, error: '', success: 'Login successful.' })
      onAuthSuccess()
      navigate(redirectTo, { replace: true })
    } else {
      const exists = stored.find((u) => u.email === normalizedEmail)
      if (exists) {
        setStatus({ loading: false, error: 'An account with this email already exists.', success: '' })
        return
      }
      stored.push({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: password,
      })
      localStorage.setItem(USERS_KEY, JSON.stringify(stored))
      // Save credentials to browser after local signup
      await savePasswordToBrowser(email, password)
      setStatus({
        loading: false,
        error: '',
        success: 'Account created. Please log in with your new credentials.',
      })
      setMode('login')
      setFormData({
        fullName: '',
        email: email,
        password: '',
        confirmPassword: '',
      })
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    if (!credentialResponse.credential) {
      setStatus({ loading: false, error: 'Google sign-up failed. Please try again.', success: '' })
      return
    }

    setStatus({ loading: true, error: '', success: '' })

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Google sign-up failed.')
      }

      localStorage.setItem('soulchat-user', JSON.stringify({ fullName: data.user.fullName, email: data.user.email }))
      setStatus({ loading: false, error: '', success: 'Google sign-up successful.' })
      onAuthSuccess()
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (
        error.name === 'TypeError' &&
        (error.message === 'Failed to fetch' || error.message.includes('NetworkError'))
      ) {
        // Backend unreachable — proceed with local auth for Google
        // We simulate saving a Google user to local storage.
        localStorage.setItem('soulchat-user', JSON.stringify({ fullName: 'Google User', email: 'guest@google.com' }))
        setStatus({ loading: false, error: '', success: 'Signed in with Google.' })
        onAuthSuccess()
        navigate(redirectTo, { replace: true })
      } else {
        setStatus({ loading: false, error: error.message, success: '' })
      }
    }
  }

  function handleGoogleUnavailable() {
    setStatus({
      loading: false,
      error: 'Google authentication is temporarily unavailable.',
      success: '',
    })
  }

  const sideFeatures = [
    { icon: Heart, title: 'Preserve Memories', desc: 'Keep stories, letters, and voice notes in one safe, gentle place.' },
    { icon: Sparkles, title: 'AI Memory Avatar', desc: 'Receive compassionate responses shaped by personality details you share.' },
    { icon: Shield, title: 'Private & Secure', desc: 'Full control over privacy and permissions for every profile.' },
  ]

  return (
    <div className="auth-page">
      {/* Background atmosphere — same as landing hero */}
      <div className="auth-page__bg">
        <div className="auth-page__orb auth-page__orb--1" />
        <div className="auth-page__orb auth-page__orb--2" />
        <div className="auth-page__orb auth-page__orb--3" />
        <div className="auth-page__stars" />
      </div>

      {/* Back to home navbar */}
      <Motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="auth-page__header"
      >
        <Link to="/" className="auth-page__back-link" id="auth-back-home">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <Link to="/" className="auth-page__logo">
          <HeartHandshake size={20} className="auth-page__logo-icon" />
          <span className="auth-page__logo-text">Soul Chat</span>
        </Link>
      </Motion.header>

      {/* Main content */}
      <main className="auth-page__main">
        <div className="auth-page__grid">
          {/* Left side — form */}
          <Motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="auth-card"
            id="auth-form-card"
          >
            {/* Mode toggle */}
            <div className="auth-card__toggle">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`auth-card__toggle-btn ${isLogin ? 'auth-card__toggle-btn--active' : ''}`}
                id="auth-toggle-login"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className={`auth-card__toggle-btn ${!isLogin ? 'auth-card__toggle-btn--active' : ''}`}
                id="auth-toggle-signup"
              >
                Sign Up
              </button>
            </div>

            {/* Header */}
            <div className="auth-card__header">
              <span className="auth-card__eyebrow">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </span>
              <h1 className="auth-card__title">
                {isLogin ? 'Continue your memory journey' : 'Start preserving memories with care'}
              </h1>
              <p className="auth-card__subtitle">
                {isLogin
                  ? 'Sign in to manage avatars, update memories, and reconnect.'
                  : 'Create your Soul Chat account to build a memory avatar.'}
              </p>
            </div>

            {/* Google SSO */}
            <div className="auth-card__google">
              {googleClientId ? (
                <div className="auth-card__google-wrap">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() =>
                      setStatus({
                        loading: false,
                        error: `Google ${isLogin ? 'login' : 'sign-up'} could not be completed.`,
                        success: '',
                      })
                    }
                    text={isLogin ? 'signin_with' : 'signup_with'}
                    shape="pill"
                    width="320"
                    auto_select={false}
                    useOneTap={false}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleUnavailable}
                  className="auth-card__google-btn"
                  id="auth-google-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Continue with Google
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="auth-card__divider">
              <span>or continue with email</span>
            </div>

            {/* Form */}
            <div className="auth-card__form" id="auth-form" onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}>
              {!isLogin && (
                <div className="auth-card__field">
                  <User size={16} className="auth-card__field-icon" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                    className="auth-card__input"
                    id="auth-fullname"
                  />
                </div>
              )}
              <div className="auth-card__field">
                <Mail size={16} className="auth-card__field-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username email"
                  className="auth-card__input"
                  id="auth-email"
                />
              </div>
              <div className="auth-card__field">
                <Lock size={16} className="auth-card__field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className="auth-card__input"
                    id="auth-password"
                  />
                <button
                  type="button"
                  className="auth-card__field-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {!isLogin && (
                <div className="auth-card__field">
                  <Lock size={16} className="auth-card__field-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className="auth-card__input"
                    id="auth-confirm-password"
                  />
                  <button
                    type="button"
                    className="auth-card__field-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              {status.error && (
                <Motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="auth-card__error"
                >
                  {status.error}
                </Motion.p>
              )}
              {status.success && (
                <Motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="auth-card__success"
                >
                  {status.success}
                </Motion.p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                className="auth-card__submit"
                disabled={status.loading}
                id="auth-submit"
              >
                {status.loading
                  ? isLogin
                    ? 'Signing in...'
                    : 'Creating account...'
                  : isLogin
                    ? 'Sign In'
                    : 'Create Account'}
              </button>
            </div>

            <p className="auth-card__switch">
              {isLogin ? "New here? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => handleModeSwitch(isLogin ? 'signup' : 'login')}
                className="auth-card__switch-link"
              >
                {isLogin ? 'Create an account' : 'Login'}
              </button>
            </p>
          </Motion.section>

          {/* Right side — info panel */}
          <Motion.section
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="auth-info"
            id="auth-info-panel"
          >
            <div className="auth-info__inner">
              <div className="auth-info__icon-wrap">
                <HeartHandshake size={32} />
              </div>
              <h2 className="auth-info__title">Create your safe space</h2>
              <p className="auth-info__subtitle">
                A calm, private sanctuary where memories are held with love and dignity.
              </p>

              <div className="auth-info__features">
                {sideFeatures.map((feat, i) => (
                  <Motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                    className="auth-info__feature"
                  >
                    <div className="auth-info__feature-icon">
                      <feat.icon size={18} />
                    </div>
                    <div>
                      <p className="auth-info__feature-title">{feat.title}</p>
                      <p className="auth-info__feature-desc">{feat.desc}</p>
                    </div>
                  </Motion.div>
                ))}
              </div>

              <div className="auth-info__badge">
                <Shield size={14} />
                Your dashboard unlocks after authentication
              </div>
            </div>
          </Motion.section>
        </div>
      </main>
    </div>
  )
}
