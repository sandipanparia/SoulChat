import '../landing.css'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, HeartHandshake, ArrowRight, MessageCircle, Trash2, Edit2, Camera, X } from 'lucide-react'
import { useRef } from 'react'
import { getApiBaseUrl } from '../utils/api'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export function DashboardPage() {
  const [avatars, setAvatars] = useState([])
  const [avatarToDelete, setAvatarToDelete] = useState(null)
  const [avatarToEdit, setAvatarToEdit] = useState(null)
  const fileInputRef = useRef(null)
  
  const apiBaseUrl = getApiBaseUrl()
  const user = JSON.parse(localStorage.getItem('soulchat-user') || '{}')

  const loadAvatars = async () => {
    const existing = JSON.parse(localStorage.getItem('soulchat-avatars') || '[]')
    
    try {
      if (user.email) {
        const response = await fetch(`${apiBaseUrl}/api/avatars?email=${encodeURIComponent(user.email)}`)
        if (response.ok) {
          let dbAvatars = await response.json()
          
          // Auto-sync: If backend is empty but we have local avatars, upload them!
          if (dbAvatars.length === 0 && existing.length > 0) {
            console.log('Syncing local avatars up to MongoDB...')
            for (const avatar of existing) {
              const { id, _id, ...avatarData } = avatar // remove local IDs
              const createRes = await fetch(`${apiBaseUrl}/api/avatars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, ...avatarData })
              })
              if (createRes.ok) {
                const newDbAvatar = await createRes.json()
                dbAvatars.push(newDbAvatar)
              }
            }
          }

          setAvatars(dbAvatars)
          localStorage.setItem('soulchat-avatars', JSON.stringify(dbAvatars))
          return
        }
      }
    } catch (err) {
      console.log('Fetching from DB failed, falling back to local storage.')
    }
    // Fallback
    setAvatars(existing)
  }

  useEffect(() => {
    loadAvatars()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!avatarToDelete) return
    
    try {
      await fetch(`${apiBaseUrl}/api/avatars/${avatarToDelete.id}`, { method: 'DELETE' })
    } catch (err) {}

    const updated = avatars.filter(a => a.id !== avatarToDelete.id)
    localStorage.setItem('soulchat-avatars', JSON.stringify(updated))
    setAvatars(updated)
    setAvatarToDelete(null)
  }

  const handleEditSave = async () => {
    if (!avatarToEdit) return

    try {
      await fetch(`${apiBaseUrl}/api/avatars/${avatarToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avatarToEdit)
      })
    } catch (err) {}

    const updated = avatars.map(a => a.id === avatarToEdit.id ? avatarToEdit : a)
    localStorage.setItem('soulchat-avatars', JSON.stringify(updated))
    setAvatars(updated)
    setAvatarToEdit(null)
  }

  const handleEditPhoto = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarToEdit(prev => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

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
              <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
                <img 
                  src={avatar.image} 
                  alt={avatar.name} 
                  style={{ 
                    width: '100%', 
                    height: '180px', 
                    objectFit: 'cover', 
                    borderRadius: 'var(--landing-radius)' 
                  }} 
                />
                <button
                  onClick={() => setAvatarToDelete(avatar)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'rgba(239, 68, 68, 0.9)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  title="Delete Avatar"
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Trash2 size={16} />
                </button>

                <button
                  onClick={() => setAvatarToEdit({ ...avatar })}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '3rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  title="Edit Avatar"
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Edit2 size={16} />
                </button>
              </div>
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {avatarToDelete && (
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
                <Trash2 size={24} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontFamily: 'var(--landing-font-heading)', color: 'var(--landing-text)' }}>
                Delete this Avatar?
              </h3>
              <p style={{ margin: '0 0 2rem', color: 'var(--landing-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Are you sure you want to delete your avatar for <strong>{avatarToDelete.name}</strong>? This action cannot be undone and you will lose all connected memories.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => setAvatarToDelete(null)}
                  className="landing-btn landing-btn--ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="landing-btn landing-btn--primary"
                  style={{ flex: 1, backgroundColor: '#ef4444', borderColor: '#ef4444', color: '#fff' }}
                >
                  Yes, delete
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {avatarToEdit && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <button 
                onClick={() => setAvatarToEdit(null)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--landing-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontFamily: 'var(--landing-font-heading)', color: 'var(--landing-text)' }}>
                Edit Memory Avatar
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ alignSelf: 'center', position: 'relative', marginBottom: '1rem' }}>
                  <img 
                    src={avatarToEdit.image} 
                    alt="preview" 
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute', bottom: 0, right: 0, background: 'var(--landing-accent)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Camera size={18} />
                  </button>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleEditPhoto} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '0.4rem' }}>Name</label>
                  <input 
                    value={avatarToEdit.name} 
                    onChange={e => setAvatarToEdit({...avatarToEdit, name: e.target.value})} 
                    className="auth-card__input" 
                    style={{ paddingLeft: '1rem' }} 
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '0.4rem' }}>Relationship</label>
                  <input 
                    value={avatarToEdit.relation} 
                    onChange={e => setAvatarToEdit({...avatarToEdit, relation: e.target.value})} 
                    className="auth-card__input" 
                    style={{ paddingLeft: '1rem' }} 
                  />
                </div>

                <button 
                  onClick={handleEditSave}
                  className="landing-btn landing-btn--primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  Save Changes
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
