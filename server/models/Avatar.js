import mongoose from 'mongoose'

const avatarSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    relation: {
      type: String,
      default: 'Loved One',
    },
    birthYear: String,
    specialDates: String,
    memories: String,
    traits: String,
    phrases: String,
    image: String,
    tone: String,
  },
  {
    timestamps: true,
  }
)

export const Avatar = mongoose.model('Avatar', avatarSchema)
