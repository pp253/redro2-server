import mongoose from 'mongoose'
import * as schema from '@/lib/schema'

export const StorageGoodJournalItemSchema = new mongoose.Schema({
  good: {type: String, required: true},
  unit: {type: Number, required: true},
  memo: String,
  time: {type: Date, default: Date.now},
  gameTime: schema.GameTimeSchema
})

export const StorageItemSchema = new mongoose.Schema({
  good: {type: String, required: true},
  unit: {type: Number, required: true},
  journal: [StorageGoodJournalItemSchema]
}, {_id: false})

export const StorageCostItemSchema = new mongoose.Schema({
  good: {type: String, required: true},
  cost: Number
}, {_id: false})

export const InventorySchema = new mongoose.Schema({
  storage: [StorageItemSchema], // 類似分類帳
  storageCost: [StorageCostItemSchema],
  hasStorageCost: {type: Boolean, default: true}
},
// Fix a bug https://github.com/Automattic/mongoose/issues/5574
{usePushEach: true})

const InventoryModel = mongoose.model('inventory', InventorySchema)
export default InventoryModel