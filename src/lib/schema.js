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
    this.id = options.id
    this.engineId = options.engineId
    this.nodeName = options.nodeName
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

export class AccountEvent extends Event {
  constructor (options) {
    super(options)
    this.transaction = options.transaction
    this.isBankrupt = options.isBankrupt
  }
}

export class InventoryEvent extends Event {
  constructor (options) {
    super(options)
    this.ioJournalItem = options.ioJournalItem
    this.storageCost = options.storageCost
  }
}

export class IOEvent extends Event {
  constructor (options) {
    super(options)
    this.ioJournalItem = options.ioJournalItem
  }
}

/**
 * @typedef {Object} BiddingEvent
 * @extends Event
 * @property {BiddingItem} item
 */
export class BiddingEvent extends Event {
  constructor (options) {
    super(options)
    this.provider = options.provider
    this.item = options.item
  }
}

/**
 * @typedef {Object} MarketEvent
 * @extends Event
 * @property {BiddingItem} item
 */
export class BiddingMarketEvent extends Event {
  constructor (options) {
    super(options)
    this.provider = options.provider
    this.news = options.news
    this.needs = options.needs
  }
}

export class MarketEvent extends Event {
  constructor (options) {
    super(options)
    this.provider = options.provider
    this.news = options.news
    this.needs = options.needs
  }
}

/**
 * Events Name
 */

export const ENGINE_EVENTS = {
  GAME_STAGE_CHANGE: 'GAME_STAGE_CHANGE',
  GAME_TIME_CHANGE: 'GAME_TIME_CHANGE',
  GAME_DAY_CHANGE: 'GAME_DAY_CHANGE',
  GAME_ISWORKING_CHANGE: 'GAME_ISWORKING_CHANGE',
  GAME_ONWORK: 'GAME_ONWORK',
  GAME_OFFWORK: 'GAME_OFFWORK',
  GAME_DAY_X_TIME_Y: (day, time) => `GAME_DAY_${day}_TIME_${time}`
}

export const ACCOUNT_EVENTS = {
  ACCOUNT_BALANCE_CHANGE: 'ACCOUNT_BALANCE_CHANGE',
  ACCOUNT_ADD: 'ACCOUNT_ADD',
  ACCOUNT_BANKRUPT: 'ACCOUNT_BANKRUPT'
}

export const INVENTORY_EVENTS = {
  INVENTORY_IMPORT: 'INVENTORY_IMPORT',
  INVENTORY_EXPORT: 'INVENTORY_EXPORT',
  INVENTORY_REGIST: 'INVENTORY_REGIST',
  INVENTORY_COUNT_STORAGE_COST: 'INVENTORY_COUNT_STORAGE_COST'
}

export const IO_EVENTS = {
  IO_IMPORT: 'IO_IMPORT',
  IO_EXPORT: 'IO_EXPORT',
  IO_IMPORT_COMPLETE: 'IO_IMPORT_COMPLETE',
  IO_EXPORT_COMPLETE: 'IO_EXPORT_COMPLETE'
}

export const BIDDING_EVENTS = {
  BIDDING_RELEASED: 'BIDDING_RELEASED',
  BIDDING_CANCELED: 'BIDDING_CANCELED',
  BIDDING_SIGNED: 'BIDDING_SIGNED',
  BIDDING_BREAKOFF: 'BIDDING_BREAKOFF',
  BIDDING_COMPLETED: 'BIDDING_COMPLETED'
}

export const MARKET_EVENTS = {
  MARKET_NEWS_PUBLISHED: 'MARKET_NEWS_PUBLISHED',
  MARKET_NEEDS_CHANGE: 'MARKET_NEEDS_CHANGE'
}

export const ROOM_EVENTS = {
  ROOM_JOIN: 'ROOM_JOIN',
  ROOM_LEAVE: 'ROOM_QUIT'
}

/**
 * Stage
 */
export const USER_LEVEL = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  PLAYER: 'PLAYER',
  GUEST: 'GUEST'
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

export const INVENTORY_MODE = {
  PERIODIC: 'PERIODIC', // 定期盤點制
  PERPETUAL: 'PERPETUAL' // 永續盤存制
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
