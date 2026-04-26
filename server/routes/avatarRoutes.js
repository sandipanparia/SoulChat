import express from 'express'
import { Avatar } from '../models/Avatar.js'
import { User } from '../models/User.js'

const router = express.Router()

// Get all avatars for a user
router.get('/', async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase().trim()
    if (!email) {
      return res.status(400).json({ message: 'Email query param required' })
    }

    let user = await User.findOne({ email })
    if (!user) {
      // User was likely created locally while backend was offline. Auto-create them to allow syncing.
      user = await User.create({ email, fullName: 'Restored User' })
    }

    const avatars = await Avatar.find({ userId: user._id }).sort({ createdAt: -1 })
    
    // Map _id to id for frontend compatibility
    const formattedAvatars = avatars.map(a => ({
      ...a.toObject(),
      id: a._id.toString()
    }))

    res.status(200).json(formattedAvatars)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error fetching avatars' })
  }
})

// Create avatar
router.post('/', async (req, res) => {
  try {
    const { email, ...avatarData } = req.body
    
    if (!email) {
      return res.status(400).json({ message: 'Email required to create avatar' })
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      // User created offline. Restore them.
      user = await User.create({ email: email.toLowerCase().trim(), fullName: 'Restored User' })
    }

    const newAvatar = await Avatar.create({
      ...avatarData,
      userId: user._id
    })

    const result = {
      ...newAvatar.toObject(),
      id: newAvatar._id.toString()
    }

    res.status(201).json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error creating avatar' })
  }
})

// Update avatar
router.put('/:id', async (req, res) => {
  try {
    const updated = await Avatar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    
    if (!updated) {
      return res.status(404).json({ message: 'Avatar not found' })
    }

    res.status(200).json({
      ...updated.toObject(),
      id: updated._id.toString()
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error updating avatar' })
  }
})

// Delete avatar
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Avatar.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: 'Avatar not found' })
    }
    res.status(200).json({ message: 'Avatar deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error deleting avatar' })
  }
})

export default router
