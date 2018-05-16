import mongoose from 'mongoose'
import * as schema from '@/lib/schema'
import { NodeScheme } from '@/Node/model'

export const TeamSchema = new mongoose.Schema({
  index: {type: Number, required: true},
  name: {type: String},
  isStaff: {type: Boolean, default: false},
  roles: [{type: String}]
})

export const EngineSchema = new mongoose.Schema({
  name: {type: String, default: 'UnknownEngineName'},
  describe: {type: String, default: 'Just a Game!'},
  nodes: [NodeScheme],
  stage: {type: String, default: schema.ENGINE_STAGE.CONSTRUCTED},
  time: {type: Date, default: Date.now},
  gameTime: {
    type: schema.GameTimeSchema,
    default: {day: 0, time: 0, isWorking: false}
  },
  gameDays: {type: Number, default: 0},
  dayLength: {type: Number, default: 0},
  hasTeams: {type: Boolean, default: true},
  teams: [TeamSchema],
  id: {type: mongoose.Schema.Types.ObjectId}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const EngineModel = mongoose.model('engine', EngineSchema)
export default EngineModel
