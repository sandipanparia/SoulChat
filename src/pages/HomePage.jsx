import '../landing.css'
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion as Motion, useInView, AnimatePresence } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  HeartHandshake, Upload, Sparkles, MessageCircleHeart, Heart,
  LayoutDashboard, PlusCircle, LogOut, User, ArrowRight, ChevronRight,
  Shield, BookHeart, Clock, Home
} from 'lucide-react'

/* ──────────────────────────── DATA ──────────────────────────── */

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Create a Memory Avatar',
    desc: 'Go to Create Avatar and add name, relation, photos, voice notes, stories, and personality details.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'Save and Review',
    desc: 'Check the profile preview to make sure tone, values, and favorite phrases feel accurate and respectful.',
  },
  {
    icon: MessageCircleHeart,
    step: '03',
    title: 'Start a Conversation',
    desc: 'Open Chat and send your first message. Use quick prompts whenever words feel difficult.',
  },
  {
    icon: Heart,
    step: '04',
    title: 'Keep It Personal',
    desc: 'Update memories over time so conversations remain meaningful and close to your loved one.',
  },
]

const quickActions = [
  {
    icon: PlusCircle,
    title: 'Create Avatar',
    desc: 'Build a new memory avatar with photos, stories, and personality.',
    link: '/create-avatar',
    color: 'lavender',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    desc: 'View and manage all your existing memory avatars.',
    link: '/dashboard',
    color: 'pink',
  },
  {
    icon: BookHeart,
    title: 'Memory Timeline',
    desc: 'Browse your memories organized in a beautiful timeline.',
    link: '/dashboard',
    color: 'blue',
  },
]

/* ──────────────────────────── ANIMATION HELPERS ──────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function AnimatedSection({ children, className = '', threshold = 0.15 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: threshold })
  return (
    <Motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </Motion.div>
  )
}

/* ──────────────────────────── NAVBAR ──────────────────────────── */

function HomeNavbar({ onLogout }) {
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
    <Motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`landing-navbar ${scrolled ? 'landing-navbar--scrolled' : ''}`}
      id="home-navbar"
    >
      <div className="landing-navbar__inner">
        <Link to="/home" className="landing-navbar__logo">
          <HeartHandshake className="landing-navbar__logo-icon" />
          <span className="landing-navbar__logo-text">Soul Chat</span>
        </Link>

        <nav className="landing-navbar__links" id="home-nav-links">
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
    </Motion.header>
  )
}

/* ──────────────────────────── HERO SECTION ──────────────────────────── */

function HomeHero({ userName }) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <section className="landing-hero" id="home-hero" style={{ minHeight: '70vh' }}>
      {/* Atmospheric background */}
      <div className="landing-hero__bg">
        <div className="landing-hero__orb landing-hero__orb--1" />
        <div className="landing-hero__orb landing-hero__orb--2" />
        <div className="landing-hero__orb landing-hero__orb--3" />
        <div className="landing-hero__orb landing-hero__orb--4" />
        <div className="landing-hero__stars" />
        <div className="landing-hero__overlay" />
      </div>

      <div className="landing-hero__content">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="home-hero__center"
        >
          <span className="landing-hero__badge">
            <HeartHandshake size={14} />
            Your Healing Space
          </span>
          <h1 className="landing-hero__heading">
            {greeting},{' '}
            <span className="landing-hero__heading-accent">
              {userName || 'dear one'}
            </span>
          </h1>
          <p className="landing-hero__subheading" style={{ textAlign: 'center', margin: '1.5rem auto 0' }}>
            Welcome back to your gentle sanctuary. Continue preserving precious memories
            and reconnecting with the ones you carry in your heart.
          </p>
          <div className="landing-hero__actions" style={{ justifyContent: 'center', width: '100%' }}>
            <Link to="/create-avatar" className="landing-btn landing-btn--primary" id="home-create-btn">
              Create Memory Avatar
              <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="landing-btn landing-btn--ghost" id="home-dashboard-btn">
              Open Dashboard
              <ChevronRight size={16} />
            </Link>
          </div>
        </Motion.div>
      </div>

      {/* Scroll indicator */}
      <Motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="landing-hero__scroll-hint"
      >
        <ChevronRight size={20} style={{ transform: 'rotate(90deg)' }} />
      </Motion.div>
    </section>
  )
}

/* ──────────────────────────── QUICK ACTIONS ──────────────────────────── */

function QuickActionsSection() {
  return (
    <section className="landing-section" id="quick-actions">
      <AnimatedSection className="landing-section__header">
        <Motion.p variants={fadeUp} className="landing-section__eyebrow">Quick Actions</Motion.p>
        <Motion.h2 variants={fadeUp} custom={1} className="landing-section__title">
          Jump right back in
        </Motion.h2>
        <Motion.p variants={fadeUp} custom={2} className="landing-section__subtitle">
          Pick up where you left off or start something new.
        </Motion.p>
      </AnimatedSection>

      <div className="landing-features-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {quickActions.map((action, i) => (
          <AnimatedSection key={action.title} threshold={0.15}>
            <Link to={action.link} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Motion.div
                variants={scaleIn}
                custom={i}
                className="landing-feature-card"
                id={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="landing-feature-card__icon">
                  <action.icon size={24} />
                </div>
                <h3 className="landing-feature-card__title">{action.title}</h3>
                <p className="landing-feature-card__desc">{action.desc}</p>
                <div className="home-card__arrow">
                  <ArrowRight size={16} />
                </div>
              </Motion.div>
            </Link>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────── HOW IT WORKS ──────────────────────────── */

function HowItWorksSection() {
  return (
    <section className="landing-section landing-section--alt" id="home-steps">
      <AnimatedSection className="landing-section__header">
        <Motion.p variants={fadeUp} className="landing-section__eyebrow">How It Works</Motion.p>
        <Motion.h2 variants={fadeUp} custom={1} className="landing-section__title">
          Your gentle journey of remembrance
        </Motion.h2>
        <Motion.p variants={fadeUp} custom={2} className="landing-section__subtitle">
          Follow these steps to create a meaningful memory avatar and begin gentle conversations.
        </Motion.p>
      </AnimatedSection>

      <div className="landing-steps">
        {steps.map((step, i) => (
          <AnimatedSection key={step.title} threshold={0.2}>
            <Motion.div variants={scaleIn} custom={i} className="landing-step-card" id={`home-step-${i}`}>
              <div className="landing-step-card__step-num">{step.step}</div>
              <div className="landing-step-card__icon-wrap">
                <step.icon size={28} />
              </div>
              <h3 className="landing-step-card__title">{step.title}</h3>
              <p className="landing-step-card__desc">{step.desc}</p>
            </Motion.div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────── CTA SECTION ──────────────────────────── */

function CtaSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="landing-cta" id="home-cta" ref={ref}>
      <div className="landing-cta__bg">
        <div className="landing-cta__orb landing-cta__orb--1" />
        <div className="landing-cta__orb landing-cta__orb--2" />
      </div>
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7 }}
        className="landing-cta__content"
      >
        <HeartHandshake size={40} className="landing-cta__icon" />
        <h2 className="landing-cta__title">
          Ready to preserve another<br />precious memory?
        </h2>
        <p className="landing-cta__subtitle">
          Every story, every voice, every moment matters. Create a new memory
          avatar today and keep your loved ones close.
        </p>
        <Link to="/create-avatar" className="landing-btn landing-btn--primary landing-btn--lg" id="home-cta-btn">
          Create New Avatar
          <ArrowRight size={18} />
        </Link>
      </Motion.div>
    </section>
  )
}

/* ──────────────────────────── FOOTER ──────────────────────────── */

function HomeFooter() {
  return (
    <footer className="landing-footer" id="home-footer">
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
          <a href="#" className="landing-footer__link">Memorial Ethics Policy</a>
        </nav>
        <p className="landing-footer__copy">
          &copy; {new Date().getFullYear()} Soul Chat. All rights reserved. Built with care and compassion.
        </p>
      </div>
    </footer>
  )
}

/* ──────────────────────────── MAIN PAGE ──────────────────────────── */

export function HomePage({ onLogout }) {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('soulchat-user'))
    } catch {
      return null
    }
  }, [])

  const firstName = useMemo(() => {
    if (!user?.fullName) return null
    return user.fullName.split(' ')[0]
  }, [user])

  return (
    <div className="landing-page">
      <HomeNavbar onLogout={onLogout} />
      <HomeHero userName={firstName} />
      <QuickActionsSection />
      <HowItWorksSection />
      <CtaSection />
      <HomeFooter />
    </div>
  )
}
