import mongoose from 'mongoose'

export const StocksItemSchema = new mongoose.Schema({
  good: {type: String, required: true},
  unit: {type: Number, required: true},
  unitPrice: {type: Number, default: 0},
  left: {type: Number}
})

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
  batchSize: {type: Number, deault: 1}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const InventoryModel = mongoose.model('inventory', InventorySchema)
export default InventoryModel
