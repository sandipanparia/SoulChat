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

export default router
