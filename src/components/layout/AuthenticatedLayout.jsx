import '../../landing.css'
import { useState, useEffect, useMemo } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import {
  HeartHandshake, LayoutDashboard, Sparkles, MessageCircleHeart,
  Home, LogOut, User
} from 'lucide-react'

export function AuthenticatedLayout({ onLogout }) {
  const [scrolled, setScrolled] = useState(false)
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('soulchat-user'))
    } catch {
      return null
    }
  })

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('soulchat-user')))
      } catch {
        // ignore
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const initials = useMemo(() => {
    if (!user?.fullName) return null
    const parts = user.fullName.split(' ')
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }, [user])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass = ({ isActive }) =>
    `landing-navbar__link ${isActive ? 'landing-navbar__link--active' : ''}`

  return (
    <div className="landing-page">
      {/* Background atmosphere */}
      <div className="auth-layout__bg">
        <div className="landing-hero__orb landing-hero__orb--1" />
        <div className="landing-hero__orb landing-hero__orb--2" />
        <div className="landing-hero__orb landing-hero__orb--3" />
        <div className="landing-hero__stars" />
      </div>

      {/* Navbar */}
      <Motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`landing-navbar ${scrolled ? 'landing-navbar--scrolled' : ''}`}
        id="app-navbar"
      >
        <div className="landing-navbar__inner">
          <Link to="/home" className="landing-navbar__logo">
            <HeartHandshake className="landing-navbar__logo-icon" />
            <span className="landing-navbar__logo-text">Soul Chat</span>
          </Link>

          <nav className="landing-navbar__links" id="app-nav-links">
            <NavLink to="/home" className={linkClass}>
              <Home size={14} style={{ marginRight: '0.25rem' }} />
              Home
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard size={14} style={{ marginRight: '0.25rem' }} />
              Dashboard
            </NavLink>
            <NavLink to="/create-avatar" className={linkClass}>
              <Sparkles size={14} style={{ marginRight: '0.25rem' }} />
              Create Avatar
            </NavLink>
            {user && (
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => setDropdownVisible(true)}
                onMouseLeave={() => setDropdownVisible(false)}
              >
                <Link to="/profile" className="home-navbar__avatar" title={user.email} style={{ overflow: 'hidden', padding: 0 }}>
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials || <User size={16} />
                  )}
                </Link>

                <AnimatePresence>
                  {dropdownVisible && (
                    <Motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        background: 'rgba(20, 20, 30, 0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '150px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                        zIndex: 100
                      }}
                    >
                      <Link 
                        to="/profile" 
                        className="landing-navbar__link" 
                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, width: '100%', boxSizing: 'border-box' }}
                      >
                        <User size={14} /> View Profile
                      </Link>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="landing-navbar__link"
                        style={{ 
                          padding: '0.5rem 1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem', 
                          margin: 0, 
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          textAlign: 'left',
                          cursor: 'pointer',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>
        </div>
      </Motion.header>

      {/* Page Content */}
      <main className="auth-layout__content">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Outlet />
        </Motion.div>
      </main>

      {/* Footer */}
      <footer className="landing-footer" id="app-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <HeartHandshake size={20} className="landing-footer__logo-icon" />
            <span className="landing-footer__logo-text">Soul Chat</span>
            <p className="landing-footer__tagline">
              A gentle space where memories remain held with love.
            </p>
          </div>
          <nav className="landing-footer__links">
            <Link to="/home" className="landing-footer__link">Home</Link>
            <Link to="/dashboard" className="landing-footer__link">Dashboard</Link>
            <Link to="/create-avatar" className="landing-footer__link">Create Avatar</Link>
            <a href="#" className="landing-footer__link">Privacy</a>
          </nav>
          <p className="landing-footer__copy">
            &copy; {new Date().getFullYear()} Soul Chat. All rights reserved. Built with care and compassion.
          </p>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="landing-mockup"
              style={{
                padding: '2.5rem',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: '#ef4444'
                }}
              >
                <LogOut size={24} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontFamily: 'var(--landing-font-heading)', color: 'var(--landing-text)' }}>
                Confirm Logout
              </h3>
              <p style={{ margin: '0 0 2rem', color: 'var(--landing-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Are you sure you want to log out of your account? You'll need to sign back in to access your memory avatars.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="landing-btn landing-btn--ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="landing-btn landing-btn--primary"
                  style={{ flex: 1, backgroundColor: '#ef4444', borderColor: '#ef4444', color: '#fff' }}
                >
                  Yes, log out
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
