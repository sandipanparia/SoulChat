import express from 'express'
import { Message } from '../models/Message.js'

const router = express.Router()

// Get all messages for a specific avatar
router.get('/:avatarId', async (req, res) => {
  try {
    const { avatarId } = req.params

    const messages = await Message.find({ avatarId }).sort({ createdAt: 1 })
    
    const formatted = messages.map(m => ({
      ...m.toObject(),
      id: m._id.toString()
    }))

    res.status(200).json(formatted)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error fetching messages' })
  }
})

// Create a new message
router.post('/:avatarId', async (req, res) => {
  try {
    const { avatarId } = req.params
    const { sender, text } = req.body
    
    if (!sender || !text) {
      return res.status(400).json({ message: 'Sender and text required' })
    }

    const newMsg = await Message.create({
      avatarId,
      sender,
      text
    })

    res.status(201).json({
      ...newMsg.toObject(),
      id: newMsg._id.toString()
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error saving message' })
  }
})

// Delete a single message by ID
router.delete('/single/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params
    
    // Only try MongoDB delete if it looks like a valid ObjectId (24 hex chars)
    if (/^[0-9a-fA-F]{24}$/.test(messageId)) {
      await Message.findByIdAndDelete(messageId)
    }
    // Local-only messages (timestamp IDs) are handled client-side
    
    res.status(200).json({ message: 'Message deleted' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error deleting message' })
  }
})

// Delete all messages for a specific avatar
router.delete('/:avatarId', async (req, res) => {
  try {
    const { avatarId } = req.params
    await Message.deleteMany({ avatarId })
    res.status(200).json({ message: 'All messages deleted' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error deleting messages' })
  }
})

export default router
