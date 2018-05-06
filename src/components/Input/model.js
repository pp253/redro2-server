import mongoose from 'mongoose'
import * as schema from '@/lib/schema'

export const InputJournalGoodItemSchema = new mongoose.Schema({
  good: {type: String, required: true},
  unit: {type: Number, required: true}
}, {_id: false})

export const InputJournalItemSchema = new mongoose.Schema({
  list: [InputJournalGoodItemSchema],
  from: {type: mongoose.Schema.Types.ObjectId},
  price: {type: Number, default: 0},
  deliveringCost: {type: Number, default: 0},
  memo: String,
  time: {type: Date, default: Date.now},
  gameTime: schema.GameTimeSchema
})

export const AvailableImportGood = new mongoose.Schema({
  good: {type: String, required: true},
  limit: {type: Number, default: 0},
  left: {type: Number, default: 0}
}, {_id: false})

export const AvailableImporter = new mongoose.Schema({
  id: {type: mongoose.Schema.Types.ObjectId, required: true}
}, {_id: false})

export const InputSchema = new mongoose.Schema({
  journal: [InputJournalItemSchema],
  availableImporters: [AvailableImporter],
  availableImportGoods: [AvailableImportGood],
  hasImportLimit: {type: Boolean, default: false},
  rejectNotAvailableImpoters: {type: Boolean, default: true},
  rejectNotAvailableGoods: {type: Boolean, default: true}
},
// Fix a bug https://github.com/Automattic/mongoose/issues/5574
{usePushEach: true})

const InputModel = mongoose.model('input', InputSchema)
export default InputModel
