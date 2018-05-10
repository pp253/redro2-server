import mongoose from 'mongoose'
import * as schema from '@/lib/schema'

/**
 * @typedef BiddingItemGood
 * @property {Stirng} good
 * @property {Number} unit
 * @property {Number} [cost] Cost per unit.
 */
export const BiddingItemGoodSchema = new mongoose.Schema({
  good: {type: String, required: true},
  unit: {type: Number, required: true},
  cost: Number // cost per unit
}, {_id: false})

/**
 * @typedef BiddingItem
 * @property {Array<BiddingItemGood>} goods
 * @property {String} stage
 * @property {String} publishedFromChain
 * @property {ObjectId} [publisher]
 * @property {ObjectId} [signer]
 * @property {Number} price
 * @property {Number} [timeLimit]
 * @property {String} [memo]
 * @property {Date} time
 * @property {GameTime} gameTime
 */
export const BiddingItemSchema = new mongoose.Schema({
  goods: [BiddingItemGoodSchema],
  stage: {type: String, default: schema.BIDDING_ITEM_STAGE.CONSTRUCTED},
  publishedFromChain: {type: String, default: schema.BIDDING_CHAIN.UPSTREAM},
  publisher: schema.CounterObjectSchema,
  signer: schema.CounterObjectSchema,
  price: {type: Number, default: 0},
  timeLimit: {type: Number, default: 300},
  memo: String,
  time: schema.TimeType,
  gameTime: schema.GameTimeSchema
})

export const BiddingMarketSchema = new mongoose.Schema({
  mode: {type: String, default: 'Receiver'}, // or 'Provider'
  upstreams: [schema.CounterObjectSchema],
  downstreams: [schema.CounterObjectSchema],
  provider: schema.CounterObjectSchema,
  biddings: [BiddingItemSchema],
  breakoffPaneltyRatio: {type: Number, default: 1.2},
  breakoffCompensationRatio: {type: Number, default: 0.5}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const BiddingMarketModel = mongoose.model('bidding_market', BiddingMarketSchema)
export default BiddingMarketModel
