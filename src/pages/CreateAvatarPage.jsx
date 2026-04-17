import '../landing.css'
import { motion as Motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSteps } from '../data/soulData'
import { Image, Mic, X } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export function CreateAvatarPage() {
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birthYear: '',
    specialDates: '',
    memories: '',
    traits: '',
    phrases: ''
  })

  const [photos, setPhotos] = useState([])
  const [voiceNotes, setVoiceNotes] = useState([])

  const photoInputRef = useRef(null)
  const voiceInputRef = useRef(null)

  const handlePhotoUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))
      setPhotos(prev => [...prev, ...newFiles])
    }
  }

  const handleVoiceUpload = (e) => {
    if (e.target.files) {
      setVoiceNotes(prev => [...prev, ...Array.from(e.target.files)])
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const removeVoiceNode = (index) => {
    setVoiceNotes(prev => prev.filter((_, i) => i !== index))
  }

  const navigate = useNavigate()

  const handleSave = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name) {
      alert("Please enter the loved one's name.")
      return
    }

    const newAvatar = {
      id: Date.now().toString(),
      name: formData.name,
      relation: formData.relationship || 'Loved One',
      birthYear: formData.birthYear,
      specialDates: formData.specialDates,
      memories: formData.memories,
      traits: formData.traits,
      phrases: formData.phrases,
      image: photos[0]?.preview || 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=2000&auto=format&fit=crop',
      tone: formData.traits ? formData.traits.slice(0, 100) : 'Warm, reassuring, and reflective. Speaks softly and includes gentle encouragement.'
    }

    const existing = JSON.parse(localStorage.getItem('soulchat-avatars') || '[]')
    localStorage.setItem('soulchat-avatars', JSON.stringify([...existing, newAvatar]))
    
    navigate('/dashboard')
  }

  return (
    <div className="auth-layout__page">
      <div className="create-avatar__grid">
        {/* Left Sidebar — Progress */}
        <Motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="landing-mockup"
          style={{ padding: '2rem 1.75rem', alignSelf: 'start' }}
        >
          <p className="landing-section__eyebrow" style={{ textAlign: 'left' }}>Progress</p>
          <h1
            style={{
              fontFamily: 'var(--landing-font-heading)',
              fontSize: 'clamp(1.5rem, 2.5vw, 1.9rem)',
              fontWeight: 600,
              color: 'var(--landing-text)',
              margin: '0.5rem 0 1.5rem',
            }}
          >
            Create Memory Avatar
          </h1>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {createSteps.map((step, index) => (
              <li
                key={step}
                className={index === 0 ? 'create-step--active' : 'create-step'}
              >
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </Motion.aside>

        {/* Right Content — Form */}
        <Motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="landing-mockup"
          style={{ padding: '2.25rem 2rem' }}
        >
          <h2
            style={{
              fontFamily: 'var(--landing-font-heading)',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--landing-text)',
              margin: '0 0 0.5rem',
            }}
          >
            Basic Information
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--landing-text-muted)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            Begin with foundational details to shape your loved one's profile with care.
          </p>

          <form className="create-form">
            <div className="create-form__row">
              <input value={formData.name} name="name" onChange={handleChange} placeholder="Loved one's name" className="auth-card__input" style={{ paddingLeft: '1rem' }} />
              <input value={formData.relationship} name="relationship" onChange={handleChange} placeholder="Relationship" className="auth-card__input" style={{ paddingLeft: '1rem' }} />
            </div>
            <div className="create-form__row">
              <input value={formData.birthYear} name="birthYear" onChange={handleChange} placeholder="Birth year" className="auth-card__input" style={{ paddingLeft: '1rem' }} />
              <input value={formData.specialDates} name="specialDates" onChange={handleChange} placeholder="Special dates" className="auth-card__input" style={{ paddingLeft: '1rem' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div 
                className="create-upload-area" 
                onClick={() => photoInputRef.current?.click()}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Image size={18} /> Upload Photos
              </div>
              <input type="file" multiple accept="image/*" ref={photoInputRef} style={{ display: 'none' }} onChange={handlePhotoUpload} />
              
              {photos.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {photos.map((p, i) => (
                    <div key={i} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={p.preview} alt="upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removePhoto(i); }} 
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div 
                className="create-upload-area" 
                onClick={() => voiceInputRef.current?.click()}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Mic size={18} /> Upload Voice Notes
              </div>
              <input type="file" multiple accept="audio/*" ref={voiceInputRef} style={{ display: 'none' }} onChange={handleVoiceUpload} />
              
              {voiceNotes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                  {voiceNotes.map((v, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--landing-text-muted)' }}>
                      <span>{v.name}</span>
                      <button onClick={() => removeVoiceNode(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              name="memories"
              value={formData.memories}
              onChange={handleChange}
              rows="4"
              placeholder="Text memories, letters, and meaningful stories"
              className="auth-card__input"
              style={{ paddingLeft: '1rem', resize: 'vertical' }}
            />
            <textarea
              name="traits"
              value={formData.traits}
              onChange={handleChange}
              rows="3"
              placeholder="Personality traits and values"
              className="auth-card__input"
              style={{ paddingLeft: '1rem', resize: 'vertical' }}
            />
            <textarea
              name="phrases"
              value={formData.phrases}
              onChange={handleChange}
              rows="3"
              placeholder="Favorite phrases"
              className="auth-card__input"
              style={{ paddingLeft: '1rem', resize: 'vertical' }}
            />
          </form>

          {/* Preview */}
          <div className="create-preview">
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--landing-text)', margin: '0 0 0.5rem' }}>
              Avatar preview
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--landing-text-muted)', margin: 0, lineHeight: 1.6 }}>
              Warm, reassuring, and reflective. Speaks softly and includes gentle encouragement.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={handleSave} className="landing-btn landing-btn--ghost" id="create-save-draft">
              Save Draft
            </button>
            <button onClick={handleSave} className="landing-btn landing-btn--primary" id="create-continue">
              Continue to Next Step
            </button>
          </div>
        </Motion.section>
      </div>
    </div>
  )
}
