import '../landing.css'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { PlusCircle, HeartHandshake, ArrowRight, MessageCircle } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export function DashboardPage() {
  const [avatars, setAvatars] = useState([])

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('soulchat-avatars') || '[]')
    setAvatars(existing)
  }, [])

  return (
    <div className="auth-layout__page">
      {/* Header Card */}
      <Motion.section
        initial="hidden"
        animate="visible"
        className="landing-mockup"
        style={{ padding: '2.5rem 2.25rem', marginBottom: '2rem' }}
      >
        <Motion.p variants={fadeUp} className="landing-section__eyebrow" style={{ textAlign: 'left' }}>
          Dashboard
        </Motion.p>
        <Motion.h1 variants={fadeUp} custom={1} className="landing-section__title" style={{ textAlign: 'left' }}>
          Your Memory Avatars
        </Motion.h1>
        <Motion.p variants={fadeUp} custom={2} className="landing-section__subtitle" style={{ textAlign: 'left', margin: '0.75rem 0 0' }}>
          Manage memories, refine personality details, and revisit conversations.
        </Motion.p>
        <Motion.div variants={fadeUp} custom={3} style={{ marginTop: '1.5rem' }}>
          <Link to="/create-avatar" className="landing-btn landing-btn--primary" id="dash-create-btn">
            <PlusCircle size={16} />
            Create Memory Avatar
          </Link>
        </Motion.div>
      </Motion.section>

      {avatars.length === 0 ? (
        /* Empty State */
        <Motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="landing-mockup"
          style={{ padding: '3.5rem 2rem', textAlign: 'center' }}
        >
          <div className="auth-info__icon-wrap" style={{ margin: '0 auto 1.5rem' }}>
            <HeartHandshake size={28} />
          </div>
          <h2
            style={{
              fontFamily: 'var(--landing-font-heading)',
              fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
              fontWeight: 600,
              color: 'var(--landing-text)',
              margin: '0 0 0.75rem',
            }}
          >
            No Memory Avatars Yet
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'var(--landing-text-muted)',
              maxWidth: '520px',
              margin: '0 auto 1.75rem',
            }}
          >
            Your dashboard is ready. Create your first memory avatar to begin a private and meaningful conversation space.
          </p>
          <Link to="/create-avatar" className="landing-btn landing-btn--primary" id="dash-first-avatar-btn">
            Create Your First Avatar
            <ArrowRight size={16} />
          </Link>
        </Motion.section>
      ) : (
        /* Avatars Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {avatars.map((avatar, i) => (
            <Motion.div
              key={avatar.id}
              initial="hidden"
              animate="visible"
              custom={i}
              variants={fadeUp}
              className="landing-feature-card"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem' }}
            >
              <img 
                src={avatar.image} 
                alt={avatar.name} 
                style={{ 
                  width: '100%', 
                  height: '180px', 
                  objectFit: 'cover', 
                  borderRadius: 'var(--landing-radius)',
                  marginBottom: '1rem' 
                }} 
              />
              <span className="landing-section__eyebrow" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                {avatar.relation}
              </span>
              <h3 className="landing-feature-card__title" style={{ margin: '0 0 0.5rem' }}>{avatar.name}</h3>
              <p className="landing-feature-card__desc" style={{ flex: 1 }}>
                {avatar.tone}
              </p>
              
              <Link to={`/chat/${avatar.id}`} className="landing-btn landing-btn--primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <MessageCircle size={16} /> Open Chat
              </Link>
            </Motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
