import '../landing.css'
import { useState, useEffect, useRef } from 'react'
import { motion as Motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HeartHandshake, Upload, Sparkles, MessageCircleHeart, Heart,
  Camera, Mic, MessageSquare, Clock, BookHeart, Shield,
  ChevronRight, Menu, X, ArrowRight, Quote, Star
} from 'lucide-react'
import { ThemeToggle } from '../components/ui/ThemeToggle'

/* ──────────────────────────── DATA ──────────────────────────── */

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#how-it-works' },
]

const howItWorks = [
  { icon: Upload, step: '01', title: 'Upload Memories', desc: 'Share photos, voice notes, letters, and cherished stories of your loved one.' },
  { icon: Sparkles, step: '02', title: 'Create the Avatar', desc: 'Our gentle AI shapes a respectful memory avatar from the details you share.' },
  { icon: MessageCircleHeart, step: '03', title: 'Start the Conversation', desc: 'Reconnect in a calm, private space designed for comfort and reflection.' },
  { icon: Heart, step: '04', title: 'Keep the Bond Alive', desc: 'Continue adding memories to keep conversations meaningful over time.' },
]

const features = [
  { icon: Camera, title: 'Photo Upload', desc: 'Preserve visual memories in a beautiful private gallery.' },
  { icon: Mic, title: 'Voice Memory', desc: 'Keep their voice alive with audio recordings and voice notes.' },
  { icon: MessageSquare, title: 'AI Chat', desc: 'Have warm, meaningful conversations with your memory avatar.' },
  { icon: Clock, title: 'Memory Timeline', desc: 'Organize memories chronologically in a beautiful timeline view.' },
  { icon: BookHeart, title: 'Tribute Page', desc: 'Create a beautiful memorial page to honor their legacy.' },
  { icon: Shield, title: 'Private & Secure', desc: 'Your memories are encrypted and fully under your control.' },
]

const testimonials = [
  {
    quote: "Soul Chat helps me hear my mother's kindness in my most difficult moments. It's like she's still guiding me through life.",
    author: 'Sarah M.',
    relation: 'Preserving her mother\'s memory',
    stars: 5,
  },
  {
    quote: 'It feels like opening a memory journal that can answer back with warmth. I talk to my father every evening now.',
    author: 'David K.',
    relation: 'Preserving his father\'s memory',
    stars: 5,
  },
  {
    quote: "A beautiful way to preserve family stories for generations. My grandmother's wisdom lives on through Soul Chat.",
    author: 'Priya R.',
    relation: 'Preserving her grandmother\'s memory',
    stars: 5,
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

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`landing-navbar ${scrolled ? 'landing-navbar--scrolled' : ''}`}
      id="navbar"
    >
      <div className="landing-navbar__inner">
        {/* Logo */}
        <a href="#hero" className="landing-navbar__logo">
          <HeartHandshake className="landing-navbar__logo-icon" />
          <span className="landing-navbar__logo-text">Soul Chat</span>
        </a>

        {/* Desktop Nav */}
        <nav className="landing-navbar__links" id="nav-links">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="landing-navbar__link">
              {link.label}
            </a>
          ))}
          <Link to="/auth" className="landing-navbar__link" id="nav-login">
            Login
          </Link>
          <Link to="/auth" className="landing-btn landing-btn--primary landing-btn--sm" id="nav-signup">
            Sign Up
          </Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ThemeToggle />
          {/* Mobile toggle */}
          <button
            className="landing-navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <Motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="landing-navbar__mobile-menu"
          id="mobile-menu"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="landing-navbar__mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link to="/auth" className="landing-navbar__mobile-link" onClick={() => setMobileOpen(false)}>
            Login
          </Link>
          <Link
            to="/auth"
            className="landing-btn landing-btn--primary landing-btn--sm"
            onClick={() => setMobileOpen(false)}
          >
            Sign Up
          </Link>
        </Motion.nav>
      )}
    </Motion.header>
  )
}

/* ──────────────────────────── HERO ──────────────────────────── */

function HeroSection() {
  return (
    <section className="landing-hero" id="hero">
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
        <div className="landing-hero__grid">
          {/* Text Side */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="landing-hero__text-side"
          >
            <span className="landing-hero__badge">
              <HeartHandshake size={14} />
              Gentle AI Memory Companion
            </span>
            <h1 className="landing-hero__heading">
              Talk to the ones you still carry in your{' '}
              <span className="landing-hero__heading-accent">heart</span>
            </h1>
            <p className="landing-hero__subheading">
              Soul Chat helps you preserve memories, voice, and personality of loved ones
              through a respectful AI memory avatar — so love and wisdom can stay close, always.
            </p>
            <div className="landing-hero__actions">
              <Link to="/create-avatar" className="landing-btn landing-btn--primary" id="hero-create-btn">
                Create Memory Avatar
                <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="landing-btn landing-btn--ghost" id="hero-learn-btn">
                Learn More
                <ChevronRight size={16} />
              </a>
            </div>
          </Motion.div>

          {/* Mockup Side */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="landing-hero__mockup-side"
          >
            <div className="landing-mockup">
              {/* Floating decorative elements */}
              <div className="landing-mockup__float landing-mockup__float--1" />
              <div className="landing-mockup__float landing-mockup__float--2" />
              <div className="landing-mockup__float landing-mockup__float--3" />

              {/* Avatar Card */}
              <div className="landing-mockup__avatar-card">
                <div className="landing-mockup__avatar-img">
                  <HeartHandshake size={24} />
                </div>
                <div>
                  <p className="landing-mockup__avatar-name">Amara</p>
                  <p className="landing-mockup__avatar-relation">Mother • Memory Avatar</p>
                </div>
                <span className="landing-mockup__avatar-status">Active</span>
              </div>

              {/* Chat Messages */}
              <div className="landing-mockup__chat">
                <div className="landing-mockup__msg landing-mockup__msg--received">
                  <p>I'm always with you in your heart, dear. Remember our morning walks? 🌸</p>
                </div>
                <div className="landing-mockup__msg landing-mockup__msg--sent">
                  <p>I miss those walks so much, Mom. Tell me about the garden?</p>
                </div>
                <div className="landing-mockup__msg landing-mockup__msg--received">
                  <p>The roses were your favorite. You'd always pick the pink ones for the kitchen table. 💕</p>
                </div>
              </div>

              {/* Input Bar */}
              <div className="landing-mockup__input-bar">
                <span>Type a message...</span>
                <Heart size={16} />
              </div>
            </div>
          </Motion.div>
        </div>
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

/* ──────────────────────────── HOW IT WORKS ──────────────────────────── */

function HowItWorksSection() {
  return (
    <section className="landing-section" id="how-it-works">
      <AnimatedSection className="landing-section__header">
        <Motion.p variants={fadeUp} className="landing-section__eyebrow">How It Works</Motion.p>
        <Motion.h2 variants={fadeUp} custom={1} className="landing-section__title">
          A calm and respectful journey
        </Motion.h2>
        <Motion.p variants={fadeUp} custom={2} className="landing-section__subtitle">
          Designed to make preserving memory feel simple, meaningful, and deeply personal.
        </Motion.p>
      </AnimatedSection>

      <div className="landing-steps">
        {howItWorks.map((step, i) => (
          <AnimatedSection key={step.title} threshold={0.2}>
            <Motion.div variants={scaleIn} custom={i} className="landing-step-card" id={`step-card-${i}`}>
              <div className="landing-step-card__step-num">{step.step}</div>
              <div className="landing-step-card__icon-wrap">
                <step.icon size={28} />
              </div>
              <h3 className="landing-step-card__title">{step.title}</h3>
              <p className="landing-step-card__desc">{step.desc}</p>
              {i < howItWorks.length - 1 && (
                <div className="landing-step-card__connector" />
              )}
            </Motion.div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────── FEATURES ──────────────────────────── */

function FeaturesSection() {
  return (
    <section className="landing-section landing-section--alt" id="features">
      <AnimatedSection className="landing-section__header">
        <Motion.p variants={fadeUp} className="landing-section__eyebrow">Platform Features</Motion.p>
        <Motion.h2 variants={fadeUp} custom={1} className="landing-section__title">
          Everything you need to preserve love
        </Motion.h2>
        <Motion.p variants={fadeUp} custom={2} className="landing-section__subtitle">
          Every feature is designed with care, privacy, and emotional sensitivity at its core.
        </Motion.p>
      </AnimatedSection>

      <div className="landing-features-grid">
        {features.map((feat, i) => (
          <AnimatedSection key={feat.title} threshold={0.15}>
            <Motion.div variants={scaleIn} custom={i} className="landing-feature-card" id={`feature-${feat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="landing-feature-card__icon">
                <feat.icon size={24} />
              </div>
              <h3 className="landing-feature-card__title">{feat.title}</h3>
              <p className="landing-feature-card__desc">{feat.desc}</p>
            </Motion.div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────── TESTIMONIALS ──────────────────────────── */

function TestimonialsSection() {
  return (
    <section className="landing-section" id="testimonials">
      <AnimatedSection className="landing-section__header">
        <Motion.p variants={fadeUp} className="landing-section__eyebrow">Words from Families</Motion.p>
        <Motion.h2 variants={fadeUp} custom={1} className="landing-section__title">
          Moments of comfort and healing
        </Motion.h2>
        <Motion.p variants={fadeUp} custom={2} className="landing-section__subtitle">
          Real stories from people who found solace in preserving the memories of those they love.
        </Motion.p>
      </AnimatedSection>

      <div className="landing-testimonials">
        {testimonials.map((t, i) => (
          <AnimatedSection key={t.author} threshold={0.2}>
            <Motion.div variants={fadeUp} custom={i} className="landing-testimonial-card" id={`testimonial-${i}`}>
              <Quote size={28} className="landing-testimonial-card__quote-icon" />
              <div className="landing-testimonial-card__stars">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="landing-testimonial-card__text">{t.quote}</p>
              <div className="landing-testimonial-card__author">
                <div className="landing-testimonial-card__avatar">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <p className="landing-testimonial-card__name">{t.author}</p>
                  <p className="landing-testimonial-card__relation">{t.relation}</p>
                </div>
              </div>
            </Motion.div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────── FINAL CTA ──────────────────────────── */

function CtaSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="landing-cta" id="cta" ref={ref}>
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
          Preserve love, memories, and voice<br />in one safe place
        </h2>
        <p className="landing-cta__subtitle">
          Begin your gentle journey of remembrance today. Create a space where
          their presence never fades.
        </p>
        <Link to="/auth" className="landing-btn landing-btn--primary landing-btn--lg" id="cta-get-started">
          Get Started — It's Free
          <ArrowRight size={18} />
        </Link>
      </Motion.div>
    </section>
  )
}

/* ──────────────────────────── FOOTER ──────────────────────────── */

function Footer() {
  return (
    <footer className="landing-footer" id="footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__brand">
          <HeartHandshake size={20} className="landing-footer__logo-icon" />
          <span className="landing-footer__logo-text">Soul Chat</span>
          <p className="landing-footer__tagline">
            A gentle space where memories remain held with love.
          </p>
        </div>
        <nav className="landing-footer__links">
          <a href="#" className="landing-footer__link">About</a>
          <a href="#" className="landing-footer__link">Privacy</a>
          <a href="#" className="landing-footer__link">Contact</a>
          <a href="#" className="landing-footer__link">Terms</a>
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

export function LandingHomePage() {
  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
