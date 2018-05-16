import mongoose from 'mongoose'
import * as schema from '@/lib/schema'
import { StocksItemSchema } from '@/components/Inventory/model'

export const MarketNewsSchema = new mongoose.Schema({
  title: {type: String},
  content: {type: String},
  releasedGameTime: {type: schema.GameTimeSchema},
  marketNeeds: [StocksItemSchema]
})

export const MarketJournalItem = new mongoose.Schema({
  from: {type: String, required: true},
  price: {type: Number, default: 0},
  list: [StocksItemSchema],
  memo: String,
  time: schema.TimeType,
  gameTime: schema.GameTimeSchema
})

export const MarketSchema = new mongoose.Schema({
  upstreams: [{type: String}],
  marketNeeds: [StocksItemSchema],
  news: [MarketNewsSchema],
  accumulateNeeds: {type: Boolean, default: false},
  journal: [MarketJournalItem]
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const MarketModel = mongoose.model('market', MarketSchema)
export default MarketModel
