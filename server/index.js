import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDatabase } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import avatarRoutes from './routes/avatarRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import aiChatRoutes from './routes/aiChatRoutes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: '*',
  }),
)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/avatars', avatarRoutes)
app.use('/api/messages', chatRoutes)
app.use('/api/ai', aiChatRoutes)

// --- Production SPA Fallback ---
// Serve the built React app from the dist folder
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

// For any route that is NOT an API route, serve index.html
// This lets React Router handle client-side routing on page reload
// Express 5 requires named wildcard params instead of bare '*'
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

connectDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to connect MongoDB:', error.message)
    process.exit(1)
  })
