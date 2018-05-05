import mongoose from 'mongoose'

export const GameTimeSchema = new mongoose.Schema({
  day: {
    type: Number,
    default: 0
  },
  time: {
    type: Number,
    default: 0
  },
  isWorking: {
    type: Boolean,
    default: false
  }
}, {_id: false})
