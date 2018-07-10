import mongoose from 'mongoose'
import * as schema from '@/lib/schema'
import { StocksItemSchema } from '@/components/Inventory/model'

/**
 * @typedef IOJournalItem
 * @property {CounterObject} [from]
 * @property {CounterObject} to
 * @property {Array<StocksItem>} list
 * @property {Number} price
 * @property {Number} [transportationCost]
 * @property {Number} [transportationTime]
 * @property {String} [transportationStatus]
 * @property {String} [memo]
 * @property {Date} [time]
 * @property {GameTime} [gameTime]
 */
export const IOJournalItemSchema = new mongoose.Schema({
  from: {type: String, default: 0},
  to: {type: String, default: 0},
  list: [StocksItemSchema],
  price: {type: Number, default: 0},
  transportationCost: {type: Number, default: 0},
  transportationTime: {type: Number, default: 0},
  transportationStatus: {type: String, default: schema.TRANSPORTATION_STATUS.COMPLETED},
  memo: String,
  time: schema.TimeType,
  gameTime: schema.GameTimeSchema,
  serial: {type: Number}
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
  batchSize: {type: Number, default: 1}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true,
  // Fix https://stackoverflow.com/questions/22053685/mongoose-no-matching-document-found-using-id-method-error-caused-by-asynchron/22158872#22158872
  versionKey: false
})

const IOModel = mongoose.model('io', IOSchema)
export default IOModel
