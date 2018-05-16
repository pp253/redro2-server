import mongoose from 'mongoose'
import * as schema from '@/lib/schema'
import { StocksItemSchema } from '@/components/Inventory/model'

export const BOMSchema = new mongoose.Schema({
  good: {type: String, required: true},
  components: [StocksItemSchema]
})

export const AssemblyDepartmentSchema = new mongoose.Schema({
  receivers: [{type: String}],
  bom: [BOMSchema]
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true,
  // Fix https://stackoverflow.com/questions/22053685/mongoose-no-matching-document-found-using-id-method-error-caused-by-asynchron/22158872#22158872
  versionKey: false
})

const AssemblyDepartmentModel = mongoose.model('assembly_department', AssemblyDepartmentSchema)
export default AssemblyDepartmentModel
