import mongoose from 'mongoose'

export function isObjectId (value) {
  return mongoose.Types.ObjectId.isValid(value)
}

export function isCode (value) {
  return value >= 0 && value < 10000
}
