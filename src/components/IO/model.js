import mongoose from 'mongoose'
import * as schema from '@/lib/schema'
import { StocksItemSchema } from '@/components/Inventory/model'

export const IOJournalItemSchema = new mongoose.Schema({
  from: schema.CounterObjectSchema,
  to: schema.CounterObjectSchema,
  list: [StocksItemSchema],
  price: {type: Number, default: 0},
  transportationCost: {type: Number, default: 0},
  transportationTime: {type: Number, default: 0},
  transportationStatus: {type: String, default: schema.TRANSPORTATION_STATUS.COMPLETED},
  memo: String,
  time: schema.TimeType,
  gameTime: schema.GameTimeSchema
})

export const AvailableIOGoodSchema = new mongoose.Schema({
  good: {type: String, required: true},
  limit: {type: Number, default: 0},
  left: {type: Number, default: 0}
}, {_id: false})

export const IOSchema = new mongoose.Schema({
  enableImport: {type: Boolean, default: true},
  importJournal: [IOJournalItemSchema],
  availableImportGoods: [AvailableIOGoodSchema],
  hasImportLimit: {type: Boolean, default: false},
  rejectNotAvailableImportGoods: {type: Boolean, default: true},

  enableExport: {type: Boolean, default: true},
  exportJournal: [IOJournalItemSchema],
  availableExportGoods: [AvailableIOGoodSchema],
  hasExportLimit: {type: Boolean, default: false},
  rejectNotAvailableExportGoods: {type: Boolean, default: true},

  transportationCost: {type: Number, default: 0},
  transportationUnitPerBatch: {type: Number, default: 0}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const IOModel = mongoose.model('io', IOSchema)
export default IOModel
