import '../landing.css'
import { useMemo, useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { Mic, SendHorizonal, HeartHandshake, Trash2, X } from 'lucide-react'
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
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages, isTyping])
  
  const apiBaseUrl = getApiBaseUrl()

  const clearChat = async () => {
    if (!confirm('Delete all messages? This cannot be undone.')) return
    
    // Clear from localStorage
    localStorage.removeItem(`soulchat-msgs-${avatarId}`)
    setMessages([])
    
    // Clear from MongoDB
    try {
      await fetch(`${apiBaseUrl}/api/messages/${avatarId}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Failed to delete messages from server:', err)
    }
  }

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

  const deleteMessage = async (msgId) => {
    // Remove from state & localStorage
    setMessages(prev => {
      const updated = prev.filter(m => (m.id || m._id) !== msgId)
      localStorage.setItem(`soulchat-msgs-${avatarId}`, JSON.stringify(updated))
      return updated
    })

    // Remove from MongoDB
    try {
      await fetch(`${apiBaseUrl}/api/messages/single/${msgId}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  const handleSend = async () => {
    if (!inputText.trim()) return
    
    const userMsg = { text: inputText, sender: 'user', id: Date.now() }
    saveMessage(userMsg)
    const currentInput = inputText
    setInputText('')
    setIsTyping(true)
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarId,
          userMessage: currentInput,
          // Send avatar profile data as fallback for local-only avatars
          avatarName: profile.name,
          avatarRelation: profile.relation,
          avatarTone: profile.tone,
          avatarTraits: profile.traits,
          avatarPhrases: profile.phrases,
          avatarMemories: profile.memories,
          avatarBirthYear: profile.birthYear,
          avatarSpecialDates: profile.specialDates,
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiResponse = { text: data.reply, sender: 'ai', id: Date.now() + 1 }
        saveMessage(aiResponse)
      } else {
        const errData = await response.json().catch(() => ({}))
        const aiResponse = { text: errData.message || `I'm having trouble connecting right now. Please try again in a moment.`, sender: 'ai', id: Date.now() + 1 }
        saveMessage(aiResponse)
      }
    } catch (err) {
      console.error('AI chat error:', err)
      const aiResponse = { text: `I'm here with you, but my connection seems to be off. Give me a moment and try again.`, sender: 'ai', id: Date.now() + 1 }
      saveMessage(aiResponse)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="auth-layout__page auth-layout__page--chat">
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
          {/* Chat Header with Clear button */}
          {messages.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <button
                onClick={clearChat}
                id="chat-clear"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  fontFamily: 'var(--landing-font-body)',
                  color: '#d35d6e',
                  background: 'rgba(211,93,110,0.08)',
                  border: '1px solid rgba(211,93,110,0.2)',
                  borderRadius: 'var(--landing-radius-full)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(211,93,110,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(211,93,110,0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(211,93,110,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(211,93,110,0.2)'
                }}
              >
                <Trash2 size={13} /> Clear Chat
              </button>
            </div>
          )}
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
            <div ref={messagesContainerRef} className="chat-messages-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem', minHeight: 0 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id || msg._id}
                  className="chat-msg-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Delete button — left side for user messages */}
                  {msg.sender === 'user' && (
                    <button
                      onClick={() => deleteMessage(msg.id || msg._id)}
                      className="chat-msg-delete"
                      aria-label="Delete message"
                      title="Delete message"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <div style={{
                    maxWidth: '75%',
                    padding: '0.875rem 1rem',
                    borderRadius: '12px',
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, var(--landing-violet) 0%, #a67bd4 100%)'
                      : 'rgba(255,255,255,0.65)',
                    color: msg.sender === 'user' ? '#fff' : 'var(--landing-text)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(200,184,232,0.3)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: msg.sender === 'user'
                      ? '0 4px 14px rgba(139,108,199,0.3)'
                      : '0 2px 8px rgba(45,36,56,0.06)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                  }}>
                    {msg.text}
                  </div>
                  {/* Delete button — right side for AI messages */}
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => deleteMessage(msg.id || msg._id)}
                      className="chat-msg-delete"
                      aria-label="Delete message"
                      title="Delete message"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div className="typing-indicator">
                    <span className="typing-dot" style={{ animationDelay: '0s' }}></span>
                    <span className="typing-dot" style={{ animationDelay: '0.15s' }}></span>
                    <span className="typing-dot" style={{ animationDelay: '0.3s' }}></span>
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
