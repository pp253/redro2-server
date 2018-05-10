import mongoose from 'mongoose'
import * as schema from '@/lib/schema'

export const BiddingItemGoodSchema = new mongoose.Schema({
  good: {type: String, required: true},
  unit: {type: Number, required: true},
  cost: Number // cost per unit
}, {_id: false})

export const BiddingItemSchema = new mongoose.Schema({
  goods: [BiddingItemGoodSchema],
  stage: {type: String, default: schema.BIDDING_ITEM_STAGE.CONSTRUCTED},
  publishedFromChain: {type: String, default: schema.BIDDING_CHAIN.UPSTREAM},
  publisher: schema.CounterObjectSchema,
  signer: schema.CounterObjectSchema,
  price: Number,
  memo: String,
  time: schema.TimeType,
  gameTime: schema.GameTimeSchema
})

export const BiddingMarketSchema = new mongoose.Schema({
  mode: {type: String, default: 'Receiver'}, // or 'Provider'
  upstreams: [schema.CounterObjectSchema],
  downstreams: [schema.CounterObjectSchema],
  provider: schema.CounterObjectSchema,
  biddings: [BiddingItemSchema]
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const BiddingMarketModel = mongoose.model('bidding_market', BiddingMarketSchema)
export default BiddingMarketModel
