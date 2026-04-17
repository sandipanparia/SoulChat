import '../landing.css'
import { useState, useMemo, useRef } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Camera, LogOut, CheckCircle2 } from 'lucide-react'

export function ProfilePage({ onLogout }) {
  const fileInputRef = useRef(null)
  
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('soulchat-user')) || {}
    } catch {
      return {}
    }
  })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
  })
  const [profilePic, setProfilePic] = useState(user.profilePic || null)
  const [tempProfilePic, setTempProfilePic] = useState(null)
  const [showSaved, setShowSaved] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const apiBaseUrl = import.meta.env.VITE_API_URL || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000')

  const trySaveProfileToDB = async (updatedUser) => {
    try {
      await fetch(`${apiBaseUrl}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          profilePic: updatedUser.profilePic
        })
      })
    } catch (err) {
      console.log('Backend unreachable, saving locally only.')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempProfilePic(reader.result)
        setIsEditing(true) // Open save/cancel preview options natively
      }
      reader.readAsDataURL(file)
    }
    // Clear the input value so selecting the same file again triggers onChange
    e.target.value = ''
  }

  const handleSave = () => {
    const finalPic = tempProfilePic || profilePic
    const updatedUser = { ...user, ...formData, profilePic: finalPic }
    setProfilePic(finalPic)
    localStorage.setItem('soulchat-user', JSON.stringify(updatedUser))

    // Also update the global users array
    const users = JSON.parse(localStorage.getItem('soulchat-users') || '[]')
    const userIndex = users.findIndex(u => u.email === user.email)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...formData, profilePic: finalPic }
      localStorage.setItem('soulchat-users', JSON.stringify(users))
    }

    setUser(updatedUser)
    setIsEditing(false)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 3000)
    window.dispatchEvent(new CustomEvent('soulchat-user-updated'))
    
    trySaveProfileToDB(updatedUser)
  }

  const initials = useMemo(() => {
    if (!formData.fullName) return null
    const parts = formData.fullName.split(' ')
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }, [formData.fullName])

  return (
    <div className="auth-layout__page">
      <Motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="landing-mockup"
        style={{ padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div 
              className="home-navbar__avatar" 
              style={{ 
                width: '100px', 
                height: '100px', 
                fontSize: '2rem',
                margin: '0 auto',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {tempProfilePic || profilePic ? (
                <img src={tempProfilePic || profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials || <User size={40} />
              )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: 'var(--landing-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          <h1 style={{ 
            fontFamily: 'var(--landing-font-heading)', 
            fontSize: '1.8rem', 
            margin: '1rem 0 0.25rem',
            color: 'var(--landing-text)'
          }}>
            {user.fullName || 'User Profile'}
          </h1>
          <p style={{ color: 'var(--landing-text-muted)', margin: 0 }}>
            {user.email || 'user@example.com'}
          </p>
        </div>

        <div className="create-form" style={{ marginTop: '2rem' }}>
          <div className="create-form__row">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
                <input 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={!isEditing}
                  className="auth-card__input" 
                  style={{ paddingLeft: '2.5rem', opacity: isEditing ? 1 : 0.7 }} 
                />
              </div>
            </div>
          </div>
          
          <div className="create-form__row">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
                <input 
                  value={formData.email}
                  disabled={true} // Usually email shouldn't be easily edited, or just disable for aesthetics
                  className="auth-card__input" 
                  style={{ paddingLeft: '2.5rem', opacity: 0.7, cursor: 'not-allowed' }} 
                />
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <div>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleSave} className="landing-btn landing-btn--primary">
                    Save Changes
                  </button>
                  <button onClick={() => { setIsEditing(false); setTempProfilePic(null); setFormData({ fullName: user.fullName || '', email: user.email || '' }); }} className="landing-btn landing-btn--ghost">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="landing-btn landing-btn--ghost" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  Edit Profile
                </button>
              )}
            </div>

            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="landing-btn landing-btn--ghost"
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
            >
              <LogOut size={16} style={{ marginRight: '0.5rem' }} />
              Logout from account
            </button>
          </div>
          
          {showSaved && (
            <Motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: '#10b981', 
                marginTop: '1rem',
                fontSize: '0.9rem' 
              }}
            >
              <CheckCircle2 size={16} /> Profile updated successfully.
            </Motion.div>
          )}
        </div>
      </Motion.section>

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
                  onClick={onLogout}
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
