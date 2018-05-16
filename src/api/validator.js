import mongoose from 'mongoose'

export function isObjectId (value) {
  return mongoose.Types.ObjectId.isValid(value)
}

export function isCode (value) {
  return value >= 0 && value < 10000
}

export default {
  'engineId': {
    in: 'body',
    notEmpty: true,
    isObjectId: {
      errorMessage: 'EngineId is not a valid ObjectId'
    },
    errorMessage: 'EngineId is required.'
  },
  'options': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'options is required.'
  }
}
