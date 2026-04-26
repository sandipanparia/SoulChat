// Vercel Serverless Function — wraps the Express app
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from '../server/routes/authRoutes.js'
import userRoutes from '../server/routes/userRoutes.js'
import avatarRoutes from '../server/routes/avatarRoutes.js'
import chatRoutes from '../server/routes/chatRoutes.js'
import aiChatRoutes from '../server/routes/aiChatRoutes.js'

dotenv.config()

const app = express()

app.use(
  cors({
    origin: '*',
  }),
)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// --- MongoDB Connection (with caching for serverless) ---
let isConnected = false

async function connectDB() {
  if (isConnected) return

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Add it in Vercel Environment Variables.')
  }

  await mongoose.connect(mongoUri)
  isConnected = true
  console.log('MongoDB connected (serverless)')
}

// Connect before handling any request
app.use(async (_req, _res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('DB connection failed:', err.message)
    next(err)
  }
})

// --- API Routes ---
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/avatars', avatarRoutes)
app.use('/api/messages', chatRoutes)
app.use('/api/ai', aiChatRoutes)

// Export the Express app as a Vercel serverless function
export default app
