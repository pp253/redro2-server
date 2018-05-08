import mongoose from 'mongoose'
import _ from 'lodash'

/*
{
  type: '',
  target: this
}
*/
export class Event {
  constructor (options) {
    this.type = options.type
    this.target = options.target
    this.time = Date.now()
  }
}

/*
{
  gameTime: _.cloneDeep(this.store.state.gameTime),
  stage: this.store.state.stage
}
*/
export class EngineEvent extends Event {
  constructor (options) {
    super(options)
    this.gameTime = options.gameTime
    this.stage = options.stage
  }
}

export const ENGINE_STAGE = {
  CONSTRUCTED: 'CONSTRUCTED',
  PREPARE: 'PREPARE',
  READY: 'READY',
  START: 'START',
  FINAL: 'FINAL',
  END: 'END'
}

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
