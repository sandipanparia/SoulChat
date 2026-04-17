import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDatabase } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import avatarRoutes from './routes/avatarRoutes.js'
import chatRoutes from './routes/chatRoutes.js'

dotenv.config()

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

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to connect MongoDB:', error.message)
    process.exit(1)
  })
