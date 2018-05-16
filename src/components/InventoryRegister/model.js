import mongoose from 'mongoose'
import { IOJournalItemSchema } from '@/components/IO/model'

export const InventoryRegisterSchema = new mongoose.Schema({
  receivers: [{type: String}],
  journal: [IOJournalItemSchema]
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const InventoryRegisterModel = mongoose.model('inventory_register', InventoryRegisterSchema)
export default InventoryRegisterModel
