import mongoose from 'mongoose'
import sharp from 'sharp'
import dotenv from 'dotenv'

dotenv.config()

import { User } from './models/User.js'
import { Avatar } from './models/Avatar.js'

async function compressBase64(base64Str) {
  if (!base64Str || !base64Str.startsWith('data:image/')) return base64Str
  
  try {
    const matches = base64Str.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) return base64Str

    const buffer = Buffer.from(matches[2], 'base64')
    
    // Only compress if larger than 100KB
    if (buffer.length < 100 * 1024) return base64Str

    const compressedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer()

    console.log(`Compressed from ${Math.round(buffer.length/1024)}KB to ${Math.round(compressedBuffer.length/1024)}KB`)
    return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`
  } catch (err) {
    console.error('Error compressing image:', err)
    return base64Str
  }
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const users = await User.find({})
    for (const user of users) {
      if (user.profilePic && user.profilePic.length > 200000) { // ~150KB base64 string
        console.log(`Compressing profile pic for user ${user.email}...`)
        user.profilePic = await compressBase64(user.profilePic)
        await user.save()
      }
    }

    const avatars = await Avatar.find({})
    for (const avatar of avatars) {
      if (avatar.image && avatar.image.length > 200000) {
        console.log(`Compressing image for avatar ${avatar.name}...`)
        avatar.image = await compressBase64(avatar.image)
        await avatar.save()
      }
    }

    console.log('Compression complete.')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
