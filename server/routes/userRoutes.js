import express from 'express'
import { User } from '../models/User.js'

const router = express.Router()

router.put('/profile', async (req, res) => {
  try {
    const { email, fullName, profilePic } = req.body
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required to update profile' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { fullName, profilePic },
      { new: true, upsert: true }
    )

    return res.status(200).json({
      message: 'Profile updated',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error updating profile' })
  }
})

// Endpoint to fetch full user by email
router.get('/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim()
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error fetching user' })
  }
})

export default router
