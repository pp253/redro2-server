import mongoose from 'mongoose'

/**
 * Events
 */

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

export class IOEvent extends Event {
  constructor (options) {
    super()
  }
}

/**
 * Events Name
 */

export var ENGINE_EVENTS = {
  GAME_STAGE_CHANGE: 'game-stage-change',
  GAME_TIME_CHANGE: 'game-time-change',
  GAME_DAY_CHANGE: 'game-day-change',
  GAME_ISWORKING_CHANGE: 'game-isworking-change',
  GAME_ONWORK: 'game-onwork',
  GAME_OFFWORK: 'game-offwork',
  GAME_DAY_X_TIME_Y: (day, time) => `game-day-${day}-time-${time}`
}

export const IO_EVENTS = {
  IO_IMPORT: 'IO_IMPORT',
  IO_EXPORT: 'IO_EXPORT'
}

export const BIDDING_EVENTS = {
  BIDDING_RELEASED: 'bidding-released',
  BIDDING_CANCELED: 'bidding-canceled',
  BIDDING_SIGNED: 'bidding-signed',
  BIDDING_BREAKOFF: 'bidding-breakoff',
  BIDDING_DELIVERING: 'bidding-delivering'
}

/**
 * Stage
 */

export var ENGINE_STAGE = {
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

export const BIDDING_ITEM_STAGE = {
  CONSTRUCTED: 'CONSTRUCTED',
  BIDDING: 'BIDDING',
  CANCELED: 'CANCELED',
  SIGNED: 'SIGNED',
  BREAKOFF: 'BREAKOFF',
  COMPLETED: 'COMPLETED'
}

export const BIDDING_CHAIN = {
  UPSTREAM: 'UPSTREAM',
  DOWNSTREAM: 'DOWNSTREAM'
}

/**
 * Type
 */

export const PriceType = {type: Number, default: 0}

export const TimeType = {type: Date, default: Date.now}

/**
 * Schema
 */

/**
 * @typedef GameTime
 * @property day {Number}
 * @property time {Number}
 * @property isWorking {Boolean}
 */
export const GameTimeSchema = new mongoose.Schema({
  day: {type: Number, default: 0},
  time: {type: Number, default: 0},
  isWorking: {type: Boolean, default: false}
}, {_id: false})

/**
 * @typedef CounterObject
 * @property type {String}
 * @property id {ObjectId}
 */
export const CounterObjectSchema = new mongoose.Schema({
  type: {type: String, required: true},
  id: {type: mongoose.Schema.Types.ObjectId, required: true}
}, {_id: false})
