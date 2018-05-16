import mongoose from 'mongoose'
import {INVENTORY_MODE, GameTimeSchema} from '@/lib/schema'

export const StocksItemSchema = new mongoose.Schema({
  good: {type: String, required: true},
  unit: {type: Number, required: true},
  unitPrice: {type: Number, default: 0},
  left: {type: Number},
  time: {type: Date, default: Date.now},
  gameTime: {type: GameTimeSchema}
}, {_id: false})

export const StorageItemSchema = new mongoose.Schema({
  good: {type: String, required: true},
  unit: {type: Number, required: true},
  stocks: [StocksItemSchema]
}, {_id: false})

export const StorageCostItemSchema = new mongoose.Schema({
  good: {type: String, required: true},
  costPerBatch: Number // cost per batch
}, {_id: false})

export const InventorySchema = new mongoose.Schema({
  storage: [StorageItemSchema], // 類似分類帳
  storageCost: [StorageCostItemSchema],
  hasStorageCost: {type: Boolean, default: true},
  batchSize: {type: Number, deault: 1},
  mode: {type: String, default: INVENTORY_MODE.PERPETUAL}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const InventoryModel = mongoose.model('inventory', InventorySchema)
export default InventoryModel
