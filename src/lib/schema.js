import mongoose from 'mongoose'

/**
 * Events
 */

/*
{
  type: '',
  target: this,
  gameTime: {}
}
*/
/**
 * @typedef {Object} Event
 * @property {String} type
 * @property {Object} target
 * @property {Date} time
 * @property {GameTime} [gameTime]
 */
export class Event {
  constructor (options) {
    this.type = options.type
    this.target = options.target
    this.time = Date.now()
    this.gameTime = options.gameTime
  }
}

/*
{
  gameTime: _.cloneDeep(this.store.state.gameTime),
  stage: this.store.state.stage
}
*/
/**
 * @typedef {Object} EngineEvent
 * @extends Event
 * @property {String} stage
 */
export class EngineEvent extends Event {
  constructor (options) {
    super(options)
    this.stage = options.stage
  }
}

export class IOEvent extends Event {
  constructor (options) {
    super()
  }
}

/**
 * @typedef {Object} BiddingEvent
 * @extends Event
 * @property {BiddingItem} item
 */
export class BiddingEvent extends Event {
  constructor (options) {
    super()
    this.provider = options.provider
    this.item = options.item
  }
}

/**
 * @typedef {Object} MarketEvent
 * @extends Event
 * @property {BiddingItem} item
 */
export class MarketEvent extends Event {
  constructor (options) {
    super()
    this.provider = options.provider
    this.news = options.news
    this.needs = options.needs
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

export const ACCOUNT_EVENTS = {
  ACCOUNT_BALANCE_CHANGE: 'account-balance-change',
  ACCOUNT_ADD: 'account-add'
}

export const IO_EVENTS = {
  IO_IMPORT: 'io-import',
  IO_EXPORT: 'io-export'
}

export const BIDDING_EVENTS = {
  BIDDING_RELEASED: 'bidding-released',
  BIDDING_CANCELED: 'bidding-canceled',
  BIDDING_SIGNED: 'bidding-signed',
  BIDDING_BREAKOFF: 'bidding-breakoff',
  BIDDING_COMPLETED: 'bidding-completed'
}

export const MARKET_EVENTS = {
  MARKET_NEWS_PUBLISHED: 'market-news-published',
  MARKET_NEEDS_CHANGE: 'market-needs-change'
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

export const ACCOUNT_LEDGER_SIDE = {
  DEBIT: 'debit',
  CREDIT: 'credit'
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
 * @deprecated
 * @typedef CounterObject
 * @property [type] {String}
 * @property [id] {ObjectId}
 * @property [name] {String}
 */
export const CounterObjectSchema = new mongoose.Schema({
  type: {type: String},
  id: {type: mongoose.Schema.Types.ObjectId},
  name: {type: String}
}, {_id: false})
