import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: '',
    },
    profilePic: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

export const User = mongoose.model('User', userSchema)
