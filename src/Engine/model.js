import mongoose from 'mongoose'
import * as schema from '@/lib/schema'
import { NodeScheme } from '@/Node/model'

export const EngineSchema = new mongoose.Schema({
  name: {type: String, default: 'UnknownEngineName'},
  nodes: [NodeScheme],
  stage: {type: String, default: schema.ENGINE_STAGE.CONSTRUCTED},
  time: {type: Date, default: Date.now},
  gameTime: {
    type: schema.GameTimeSchema,
    default: {day: 0, time: 0, isWorking: false}
  },
  gameDays: {type: Number, default: 0},
  dayLength: {type: Number, default: 0}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const EngineModel = mongoose.model('engine', EngineSchema)
export default EngineModel
