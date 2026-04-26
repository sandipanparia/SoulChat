import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    avatarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Avatar',
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      default: 'default',
    },
  },
  {
    timestamps: true,
  }
)

export const Message = mongoose.model('Message', messageSchema)
