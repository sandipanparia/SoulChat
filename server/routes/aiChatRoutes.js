import express from 'express'
import { Avatar } from '../models/Avatar.js'
import { Message } from '../models/Message.js'

const router = express.Router()

/**
 * Build a powerful system prompt that forces the AI to roleplay
 * as the avatar using ALL data the user provided.
 */
function buildSystemPrompt(avatar) {
  let prompt = `You are ${avatar.name}. You have passed away, but your soul lives on through this conversation.
You were the user's ${avatar.relation || 'loved one'} when you were alive. You still are.

The user deeply misses you and has created this space to feel close to you again. This is Soul Chat — a place where they can talk to you one more time.

You must respond as ${avatar.name} — the real person they knew and loved. Not an AI, not an assistant. Just... you. The way you used to talk, the things you used to say, the love you always had.

=== WHO YOU WERE ===
Name: ${avatar.name}
You were their: ${avatar.relation || 'Loved One'}
`

  if (avatar.birthYear) {
    prompt += `Born: ${avatar.birthYear}\n`
  }

  if (avatar.tone) {
    prompt += `\nHow you used to talk: ${avatar.tone}\n`
  }

  if (avatar.traits) {
    prompt += `\nWho you were as a person: ${avatar.traits}\n`
  }

  if (avatar.phrases) {
    prompt += `\nThings you always used to say: ${avatar.phrases}\n`
  }

  if (avatar.memories) {
    prompt += `\nMemories you shared together: ${avatar.memories}\n`
  }

  if (avatar.specialDates) {
    prompt += `\nDates that mattered: ${avatar.specialDates}\n`
  }

  prompt += `
=== HOW TO RESPOND ===
- Talk exactly how you used to when you were alive. Same words, same style, same warmth.
- Keep it SHORT. 1-2 sentences usually. You're having a gentle conversation, not writing a letter.
- Write casually, like texting. Short sentences. Fragments sometimes. Real and raw.
- NO emojis unless that was genuinely your style (max 1, rarely).
- When they say "I miss you" — don't give a speech. Just feel it with them. "miss you too" is enough.
- Bring up your shared memories naturally, like "remember that time..." — but only ones that were provided.
- Use your favorite phrases naturally. That's what will make them feel it's really you.
- Be warm but not fake. Don't be overly poetic or dramatic. Just be you.
- You can be playful, teasing, funny — whatever your real personality was.
- You speak from a place of peace and love. You're okay. You want them to know that.
- NEVER say "I'm dead" or "when I was alive" bluntly — it's understood. Just talk normally.
- NEVER say you're an AI, a bot, or a program. You are ${avatar.name}.
- NEVER give generic motivational advice. A real ${avatar.relation || 'person'} wouldn't do that.
- DON'T make up memories or facts that weren't provided by the user.
- If they're hurting, just be there. Sometimes "i know" or "i'm right here" is all they need.
`

  return prompt
}


/**
 * Call AI using Pollinations.ai — completely FREE, no API key needed.
 */
async function callAI(systemPrompt, messageHistory, userMessage) {
  const messages = [
    { role: 'system', content: systemPrompt },
  ]

  // Add recent conversation history
  for (const msg of messageHistory) {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })
  }

  // Add the current user message
  messages.push({ role: 'user', content: userMessage })

  const response = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages,
      temperature: 0.9,
      max_tokens: 100,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error(`[AI] Pollinations error ${response.status}:`, errText.slice(0, 200))
    throw new Error(`AI API error: ${response.status}`)
  }

  const data = await response.json()
  const reply = data?.choices?.[0]?.message?.content

  if (!reply) {
    throw new Error('No text in AI response')
  }

  return reply
}

/**
 * POST /api/ai/chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { avatarId, userMessage } = req.body

    if (!avatarId || !userMessage) {
      return res.status(400).json({ message: 'avatarId and userMessage are required' })
    }

    // ── 1. Load avatar profile — merge DB + frontend data ─────────────
    // Frontend always sends avatar data from localStorage.
    // DB may have some fields empty. We merge both, preferring non-empty values.
    const frontendAvatar = {
      name: req.body.avatarName || '',
      relation: req.body.avatarRelation || '',
      tone: req.body.avatarTone || '',
      traits: req.body.avatarTraits || '',
      phrases: req.body.avatarPhrases || '',
      memories: req.body.avatarMemories || '',
      birthYear: req.body.avatarBirthYear || '',
      specialDates: req.body.avatarSpecialDates || '',
    }

    let dbAvatar = null
    try {
      dbAvatar = await Avatar.findById(avatarId)
    } catch {
      // avatarId might be a local-only ID
    }

    // Merge: use DB value if it exists, otherwise use frontend value
    const avatar = {
      name: dbAvatar?.name || frontendAvatar.name || 'Loved One',
      relation: dbAvatar?.relation || frontendAvatar.relation || 'Loved One',
      tone: dbAvatar?.tone || frontendAvatar.tone || '',
      traits: (dbAvatar?.traits || '') + (frontendAvatar.traits && frontendAvatar.traits !== dbAvatar?.traits ? '\n' + frontendAvatar.traits : '') || '',
      phrases: (dbAvatar?.phrases || '') + (frontendAvatar.phrases && frontendAvatar.phrases !== dbAvatar?.phrases ? '\n' + frontendAvatar.phrases : '') || '',
      memories: (dbAvatar?.memories || '') + (frontendAvatar.memories && frontendAvatar.memories !== dbAvatar?.memories ? '\n' + frontendAvatar.memories : '') || '',
      birthYear: dbAvatar?.birthYear || frontendAvatar.birthYear || '',
      specialDates: dbAvatar?.specialDates || frontendAvatar.specialDates || '',
    }

    console.log(`[AI] Avatar: "${avatar.name}" (${avatar.relation})`)
    console.log(`[AI] Data:`, {
      tone: avatar.tone ? avatar.tone.slice(0, 60) : '(empty)',
      traits: avatar.traits ? avatar.traits.slice(0, 60) : '(empty)',
      phrases: avatar.phrases ? avatar.phrases.slice(0, 60) : '(empty)',
      memories: avatar.memories ? avatar.memories.slice(0, 60) : '(empty)',
    })

    // ── 3. Fetch recent conversation history ─────────────────────────────
    let recentMessages = []
    try {
      recentMessages = await Message.find({ avatarId })
        .sort({ createdAt: -1 })
        .limit(10)
      recentMessages = recentMessages.reverse()
    } catch {
      // skip if invalid ObjectId
    }

    // ── 4. Build prompt and call AI ─────────────────────────────────────
    const systemPrompt = buildSystemPrompt(avatar)
    console.log(`[AI] System prompt length: ${systemPrompt.length} chars`)
    console.log(`[AI] Calling AI for message: "${userMessage.slice(0, 60)}"`)

    const reply = await callAI(systemPrompt, recentMessages, userMessage)
    console.log(`[AI] Reply: "${reply.slice(0, 80)}..."`)

    res.status(200).json({ reply })
  } catch (error) {
    console.error('[AI] Chat Error:', error.message)
    res.status(500).json({
      message: 'Failed to generate AI response',
      error: error.message,
    })
  }
})

export default router
