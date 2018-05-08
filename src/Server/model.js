import mongoose from 'mongoose'
import * as schema from '@/lib/schema'
import { EngineSchema } from '@/Engine/model'

export const ServerSchema = new mongoose.Schema({
  engines: [EngineSchema]
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const ServerModel = mongoose.model('server', ServerSchema)
export default ServerModel
