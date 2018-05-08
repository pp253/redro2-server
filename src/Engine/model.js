import mongoose from 'mongoose'
import * as schema from '@/lib/schema'
import { NodeScheme } from '@/Node/model'

export const EngineSchema = new mongoose.Schema({
  nodes: [NodeScheme],
  stage: {type: String, default: schema.ENGINE_STAGE.CONSTRUCTED},
  gameTime: schema.GameTimeSchema,
  gameDays: {type: Number, default: 0},
  dayLength: {type: Number, default: 0}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const EngineModel = mongoose.model('engine', EngineSchema)
export default EngineModel
