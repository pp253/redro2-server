import mongoose from 'mongoose'
import * as schema from '@/lib/schema'
import { StocksItemSchema } from '@/components/Inventory/model'

/**
 * @typedef BiddingItem
 * @property {Array<BiddingItemGood>} goods
 * @property {String} stage
 * @property {String} publishedFromChain
 * @property {String} publisher
 * @property {String} [signer]
 * @property {Number} price
 * @property {Number} [timeLimit]
 * @property {String} [memo]
 * @property {Date} time
 * @property {GameTime} gameTime
 */
export const BiddingItemSchema = new mongoose.Schema({
  goods: [StocksItemSchema],
  stage: {type: String, default: schema.BIDDING_ITEM_STAGE.BIDDING},
  publishedFromChain: {type: String, default: schema.BIDDING_CHAIN.UPSTREAM},
  publisher: {type: String, required: true},
  signer: {type: String},
  price: {type: Number, default: 0},
  timeLimit: {type: Number, default: 600},
  memo: String,
  time: schema.TimeType,
  gameTime: schema.GameTimeSchema,
  signedGameTime: schema.GameTimeSchema,
  deliveredGameTime: schema.GameTimeSchema,
  serial: {type: Number}
})

export const BiddingMarketSchema = new mongoose.Schema({
  upstreams: [{type: String}],
  downstreams: [{type: String}],
  biddings: [BiddingItemSchema],
  defaultTimeLimit: {type: Number, default: 600},
  breakoffPaneltyRatio: {type: Number, default: 1.2},
  breakoffCompensationRatio: {type: Number, default: 1.2},
  transportationTime: {type: Number, default: 300},
  transportationStatus: {type: String, default: schema.TRANSPORTATION_STATUS.DELIVERING}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const BiddingMarketModel = mongoose.model('bidding_market', BiddingMarketSchema)
export default BiddingMarketModel
