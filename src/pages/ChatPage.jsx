import '../landing.css'
import { useMemo, useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { Mic, SendHorizonal, HeartHandshake, Trash2, X, MessageSquarePlus, Clock, Menu, MoreVertical } from 'lucide-react'
import { chatPrompts, memoryProfiles } from '../data/soulData'
import { getApiBaseUrl } from '../utils/api'

export function ChatPage() {
  const { avatarId } = useParams()

  const profile = useMemo(() => {
    const existing = JSON.parse(localStorage.getItem('soulchat-avatars') || '[]')
    return existing.find((entry) => entry.id === avatarId) || memoryProfiles[0]
  }, [avatarId])

  const [messages, setMessages] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(() => Date.now().toString())
  const [emptySessions, setEmptySessions] = useState([])
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesContainerRef = useRef(null)

  const sessionGroups = useMemo(() => {
    const groups = {}
    messages.forEach(msg => {
      const sid = msg.sessionId || 'default'
      if (!groups[sid]) {
        groups[sid] = {
          id: sid,
          messages: [],
          firstMessage: msg.text,
          date: new Date(msg.createdAt || msg.id || Date.now())
        }
      }
      groups[sid].messages.push(msg)
    })
    
    // Ensure any created empty sessions remain in the sidebar
    emptySessions.forEach(sid => {
      if (!groups[sid]) {
        groups[sid] = {
          id: sid,
          messages: [],
          firstMessage: 'New Chat',
          date: new Date(Number(sid)) // sid is Date.now().toString()
        }
      }
    })

    // Always show the currently active session in the sidebar even if it's empty
    if (!groups[currentSessionId]) {
      groups[currentSessionId] = {
        id: currentSessionId,
        messages: [],
        firstMessage: 'New Chat',
        date: new Date()
      }
    }

    return Object.values(groups).sort((a, b) => b.date - a.date) // newest session first
  }, [messages, currentSessionId, emptySessions])

  const handleNewChat = () => {
    const newId = Date.now().toString()
    setEmptySessions(prev => [...prev, newId])
    setCurrentSessionId(newId)
    setShowMobileSidebar(false)
  }

  const currentSessionMessages = useMemo(() => {
    return messages.filter(m => (m.sessionId || 'default') === currentSessionId)
  }, [messages, currentSessionId])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages, isTyping])
  
  const apiBaseUrl = getApiBaseUrl()

  const clearChat = async () => {
    // We can remove the old "Delete Chat" button from the main header since we have three-dot menus now, 
    // or keep it. If we keep it, it uses the same logic.
    deleteSession(null, currentSessionId)
  }

  const deleteSession = async (e, sessionId) => {
    if (e) e.stopPropagation()
    if (!confirm('Delete this chat session? This cannot be undone.')) {
      setActiveDropdownId(null)
      return
    }
    
    // Clear from localStorage for target session
    const local = JSON.parse(localStorage.getItem(`soulchat-msgs-${avatarId}`) || '[]')
    const kept = local.filter(m => (m.sessionId || 'default') !== sessionId)
    localStorage.setItem(`soulchat-msgs-${avatarId}`, JSON.stringify(kept))
    
    // Update state
    setMessages(kept)
    setEmptySessions(prev => prev.filter(id => id !== sessionId))
    
    // Clear from MongoDB for target session
    try {
      await fetch(`${apiBaseUrl}/api/messages/session/${avatarId}/${sessionId}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Failed to delete session from server:', err)
    }
    
    // If we just deleted the active session, switch to a new one
    if (currentSessionId === sessionId) {
      setCurrentSessionId(Date.now().toString())
    }
    setActiveDropdownId(null)
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
          
          if (dbMessages.length > 0) {
            const latestSession = dbMessages[dbMessages.length - 1].sessionId || 'default'
            setCurrentSessionId(latestSession)
          }
          return
        }
      } catch (err) {}
      
      setMessages(local)
      if (local.length > 0) {
        const latestSession = local[local.length - 1].sessionId || 'default'
        setCurrentSessionId(latestSession)
      }
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
    
    const userMsg = { text: inputText, sender: 'user', id: Date.now(), sessionId: currentSessionId }
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
        const aiResponse = { text: data.reply, sender: 'ai', id: Date.now() + 1, sessionId: currentSessionId }
        saveMessage(aiResponse)
      } else {
        const errData = await response.json().catch(() => ({}))
        const aiResponse = { text: errData.message || `I'm having trouble connecting right now. Please try again in a moment.`, sender: 'ai', id: Date.now() + 1, sessionId: currentSessionId }
        saveMessage(aiResponse)
      }
    } catch (err) {
      console.error('AI chat error:', err)
      const aiResponse = { text: `I'm here with you, but my connection seems to be off. Give me a moment and try again.`, sender: 'ai', id: Date.now() + 1, sessionId: currentSessionId }
      saveMessage(aiResponse)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="auth-layout__page auth-layout__page--chat">
      <div className="chat-grid">
        {/* Mobile Backdrop */}
        {showMobileSidebar && (
          <div 
            className="mobile-sidebar-backdrop"
            onClick={() => setShowMobileSidebar(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 999,
              backdropFilter: 'blur(4px)'
            }}
          />
        )}

        {/* Left — Profile Card & History */}
        <Motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className={`landing-mockup chat-sidebar-scroll ${showMobileSidebar ? 'chat-sidebar--mobile-open' : ''}`}
          style={{ 
            padding: '1.5rem', 
            alignSelf: 'start', 
            height: '100%', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column' 
          }}
        >
          {/* Mobile Close Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button 
              className="mobile-sidebar-close"
              onClick={() => setShowMobileSidebar(false)}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                color: 'var(--landing-text)', 
                cursor: 'pointer', 
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

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

          {/* New Chat Button & History */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--landing-glass-border)' }}>
            <button
              onClick={handleNewChat}
              className="landing-btn landing-btn--primary"
              style={{ width: '100%', marginBottom: '1.5rem', justifyContent: 'center' }}
            >
              <MessageSquarePlus size={16} /> New Chat
            </button>
            
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--landing-text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
              Recent Conversations
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }} className="chat-messages-scroll">
              {sessionGroups.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--landing-text-muted)', fontStyle: 'italic' }}>No previous conversations.</p>
              )}
              {sessionGroups.map(group => (
                <div key={group.id} style={{ position: 'relative', width: '100%' }}>
                  <button
                    onClick={() => {
                      setCurrentSessionId(group.id)
                      setShowMobileSidebar(false)
                      setActiveDropdownId(null)
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.75rem',
                      paddingRight: '2rem', // leave space for three dots
                      borderRadius: '8px',
                      background: currentSessionId === group.id ? 'rgba(167, 139, 218, 0.15)' : 'transparent',
                      border: currentSessionId === group.id ? '1px solid rgba(167, 139, 218, 0.3)' : '1px solid transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      width: '100%',
                    }}
                    onMouseEnter={e => {
                      if (currentSessionId !== group.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    }}
                    onMouseLeave={e => {
                      if (currentSessionId !== group.id) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: currentSessionId === group.id ? 'var(--landing-violet)' : 'var(--landing-text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {group.firstMessage}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--landing-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
                      <Clock size={12} /> {group.date.toLocaleDateString()}
                    </span>
                  </button>

                  {/* Three Dots Menu */}
                  <div style={{ position: 'absolute', right: '0.25rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === group.id ? null : group.id);
                      }}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--landing-text-muted)', 
                        cursor: 'pointer', 
                        padding: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {/* Dropdown Popup */}
                    {activeDropdownId === group.id && (
                      <div style={{ 
                        position: 'absolute', 
                        right: 0, 
                        top: '100%', 
                        background: 'var(--landing-surface)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '8px', 
                        padding: '0.5rem', 
                        zIndex: 100,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        minWidth: '120px'
                      }}>
                        <button
                          onClick={(e) => deleteSession(e, group.id)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            background: 'none', 
                            border: 'none', 
                            color: '#d35d6e', 
                            cursor: 'pointer', 
                            fontSize: '0.85rem', 
                            whiteSpace: 'nowrap',
                            width: '100%',
                            padding: '0.4rem',
                            borderRadius: '4px',
                            fontWeight: 500
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(211,93,110,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={14} /> Delete Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Motion.aside>

        {/* Right — Chat Area */}
        <Motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="landing-mockup chat-area"
          style={{ padding: '1.5rem' }}
        >
          {/* Mobile-only compact profile header */}
          <div className="chat-mobile-header">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setShowMobileSidebar(true)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--landing-glass-border)', borderRadius: '8px', padding: '0.4rem', color: 'var(--landing-text)', cursor: 'pointer', marginRight: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={18} />
            </button>
            <img
              src={profile.image}
              alt={profile.name}
              className="chat-mobile-header__avatar"
            />
            <div className="chat-mobile-header__info">
              <p className="chat-mobile-header__name">{profile.name}</p>
              <p className="chat-mobile-header__relation">{profile.relation}</p>
            </div>
          </div>
          {/* Chat Header with Clear button */}
          {currentSessionMessages.length > 0 && (
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
                <Trash2 size={13} /> Delete Chat
              </button>
            </div>
          )}
          {currentSessionMessages.length === 0 ? (
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
              {currentSessionMessages.map((msg) => (
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
                  <div className={`chat-msg-bubble chat-msg-bubble--${msg.sender}`}>
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
            {currentSessionMessages.length === 0 && (
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
