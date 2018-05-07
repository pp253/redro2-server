import mongoose from 'mongoose'

export const TRANSPORTATION_STATUS = {
  DELIVERING: 'DELIVERING',
  COMPLETED: 'COMPLETED'
}

export const PriceType = {type: Number, default: 0}

export const TimeType = {type: Date, default: Date.now}

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

export const CounterObjectSchema = new mongoose.Schema({
  type: {type: String, required: true},
  id: {type: mongoose.Schema.Types.ObjectId, required: true}
}, {_id: false})
