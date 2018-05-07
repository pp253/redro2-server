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

export const AvailableIOCounterObjectSchema = new mongoose.Schema({
  type: {type: String, required: true},
  id: {type: mongoose.Schema.Types.ObjectId, required: true}
}, {_id: false})

export const IOSchema = new mongoose.Schema({
  enableImport: {type: Boolean, default: true},
  importJournal: [IOJournalItemSchema],
  availableImporters: [AvailableIOCounterObjectSchema],
  availableImportGoods: [AvailableIOGoodSchema],
  hasImportLimit: {type: Boolean, default: false},
  rejectNotAvailableImpoters: {type: Boolean, default: true},
  rejectNotAvailableImportGoods: {type: Boolean, default: true},

  enableExport: {type: Boolean, default: true},
  exportJournal: [IOJournalItemSchema],
  availableExporters: [AvailableIOCounterObjectSchema],
  availableExportGoods: [AvailableIOGoodSchema],
  hasExportLimit: {type: Boolean, default: false},
  rejectNotAvailableExpoters: {type: Boolean, default: true},
  rejectNotAvailableExportGoods: {type: Boolean, default: true},

  transportationCost: {type: Number, default: 0},
  transportationUnitPerBatch: {type: Number, default: 0}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const IOModel = mongoose.model('io', IOSchema)
export default IOModel
