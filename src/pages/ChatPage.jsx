import '../landing.css'
import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { Mic, SendHorizonal, HeartHandshake } from 'lucide-react'
import { chatPrompts, memoryProfiles } from '../data/soulData'
import { getApiBaseUrl } from '../utils/api'

export function ChatPage() {
  const { avatarId } = useParams()

  const profile = useMemo(() => {
    const existing = JSON.parse(localStorage.getItem('soulchat-avatars') || '[]')
    return existing.find((entry) => entry.id === avatarId) || memoryProfiles[0]
  }, [avatarId])

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    const loadMessages = async () => {
      const local = JSON.parse(localStorage.getItem(`soulchat-msgs-${avatarId}`) || '[]')
      try {
        const response = await fetch(`${apiBaseUrl}/api/messages/${avatarId}`)
        if (response.ok) {
          let dbMessages = await response.json()
          
          // Auto-sync: if DB empty but local exists, sync up
          if (dbMessages.length === 0 && local.length > 0) {
            console.log('Syncing local messages up to MongoDB...')
            for (const msg of local) {
              const { id, _id, ...msgData } = msg
              const createRes = await fetch(`${apiBaseUrl}/api/messages/${avatarId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msgData)
              })
              if (createRes.ok) {
                const newMsg = await createRes.json()
                dbMessages.push(newMsg)
              }
            }
          }

          setMessages(dbMessages)
          localStorage.setItem(`soulchat-msgs-${avatarId}`, JSON.stringify(dbMessages))
          return
        }
      } catch (err) {}
      
      setMessages(local)
    }
    loadMessages()
  }, [avatarId, apiBaseUrl])

  const saveMessage = async (msgObj) => {
    setMessages(prev => {
      const updated = [...prev, msgObj]
      localStorage.setItem(`soulchat-msgs-${avatarId}`, JSON.stringify(updated))
      return updated
    })

    try {
      await fetch(`${apiBaseUrl}/api/messages/${avatarId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgObj)
      })
    } catch (err) {}
  }

  const handleSend = () => {
    if (!inputText.trim()) return
    
    const userMsg = { text: inputText, sender: 'user', id: Date.now() }
    saveMessage(userMsg)
    setInputText('')
    setIsTyping(true)
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { text: `It's so good to hear from you. I love you ${profile.relation.includes('Mom') ? 'sweetheart' : 'always'}.`, sender: 'ai', id: Date.now() + 1 }
      saveMessage(aiResponse)
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="auth-layout__page">
      <div className="chat-grid">
        {/* Left — Profile Card */}
        <Motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="landing-mockup"
          style={{ padding: '1.5rem', alignSelf: 'start' }}
        >
          <img
            src={profile.image}
            alt={profile.name}
            style={{
              width: '100%',
              height: '240px',
              objectFit: 'cover',
              borderRadius: 'var(--landing-radius-lg)',
              marginBottom: '1.25rem',
            }}
          />
          <p className="landing-section__eyebrow" style={{ textAlign: 'left', marginBottom: '0.4rem' }}>
            {profile.relation}
          </p>
          <h1
            style={{
              fontFamily: 'var(--landing-font-heading)',
              fontSize: 'clamp(1.5rem, 2.5vw, 1.9rem)',
              fontWeight: 600,
              color: 'var(--landing-text)',
              margin: '0 0 0.5rem',
            }}
          >
            {profile.name}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--landing-text-muted)', margin: 0, lineHeight: 1.6 }}>
            {profile.tone}
          </p>
        </Motion.aside>

        {/* Right — Chat Area */}
        <Motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="landing-mockup chat-area"
          style={{ padding: '1.5rem' }}
        >
          {messages.length === 0 ? (
            /* Empty state */
            <div className="chat-area__empty">
              <div className="chat-area__empty-card">
                <div className="auth-info__icon-wrap" style={{ margin: '0 auto 1rem', width: '52px', height: '52px' }}>
                  <HeartHandshake size={22} />
                </div>
                <p style={{ fontFamily: 'var(--landing-font-heading)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--landing-text)', margin: '0 0 0.5rem' }}>
                  No messages yet
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--landing-text-muted)', margin: 0, lineHeight: 1.6 }}>
                  Start your first conversation with a prompt below or share what is on your heart.
                </p>
              </div>
            </div>
          ) : (
            /* Messages List */
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '0.875rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: msg.sender === 'user' ? 'var(--landing-accent)' : 'rgba(255,255,255,0.05)',
                    color: msg.sender === 'user' ? '#fff' : 'var(--landing-text)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '0.875rem 1rem', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--landing-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                    {profile.name} is typing...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prompts & Input */}
          <div className="chat-area__bottom" style={{ marginTop: 'auto' }}>
            {messages.length === 0 && (
              <div className="chat-area__prompts">
                {chatPrompts.map((prompt) => (
                  <button key={prompt} className="chat-area__prompt-btn" onClick={() => setInputText(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <div className="chat-area__input-bar">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Share what is on your heart..."
                className="chat-area__input"
                id="chat-input"
              />
              <button className="chat-area__mic-btn" aria-label="Voice input">
                <Mic size={16} />
              </button>
              <button onClick={handleSend} className="chat-area__send-btn" aria-label="Send message" id="chat-send">
                <SendHorizonal size={16} />
              </button>
            </div>
          </div>
        </Motion.section>
      </div>
    </div>
  )
}
