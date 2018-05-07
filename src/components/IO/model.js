import mongoose from 'mongoose'
import * as schema from '@/lib/schema'

export const IOJournalGoodItemSchema = new mongoose.Schema({
  good: {type: String, required: true},
  unit: {type: Number, required: true}
}, {_id: false})

export const IOJournalItemSchema = new mongoose.Schema({
  list: [IOJournalGoodItemSchema],
  from: {type: mongoose.Schema.Types.ObjectId},
  price: {type: Number, default: 0},
  deliveringCost: {type: Number, default: 0},
  memo: String,
  time: {type: Date, default: Date.now},
  gameTime: schema.GameTimeSchema
})

export const AvailableIOGood = new mongoose.Schema({
  good: {type: String, required: true},
  limit: {type: Number, default: 0},
  left: {type: Number, default: 0}
}, {_id: false})

export const AvailableIOObject = new mongoose.Schema({
  id: {type: mongoose.Schema.Types.ObjectId, required: true}
}, {_id: false})

export const IOSchema = new mongoose.Schema({
  enableImport: {type: Boolean, default: true},
  importJournal: [IOJournalItemSchema],
  availableImporters: [AvailableIOObject],
  availableImportGoods: [AvailableIOGood],
  hasImportLimit: {type: Boolean, default: false},
  rejectNotAvailableImpoters: {type: Boolean, default: true},
  rejectNotAvailableImportGoods: {type: Boolean, default: true},
  enableExport: {type: Boolean, default: true},
  exportJournal: [IOJournalItemSchema],
  availableExporters: [AvailableIOObject],
  availableExportGoods: [AvailableIOGood],
  hasExportLimit: {type: Boolean, default: false},
  rejectNotAvailableExpoters: {type: Boolean, default: true},
  rejectNotAvailableExportGoods: {type: Boolean, default: true}
},
// Fix a bug https://github.com/Automattic/mongoose/issues/5574
{usePushEach: true})

const IOModel = mongoose.model('io', IOSchema)
export default IOModel
