import mongoose from 'mongoose'
import * as schema from '@/lib/schema'
import { NodeScheme } from '@/Node/model'

export const ObjectTypePermissionSchema = new mongoose.Schema({
  type: {type: String, required: true},
  listening: [{type: String}],
  actions: [{type: String}]
}, {_id: false})

export const RolePermissionSchema = new mongoose.Schema({
  role: {type: String, required: true},
  name: {type: String},
  describe: {type: String},
  objectTypes: [ObjectTypePermissionSchema]
}, {_id: false})

export const TeamPermissionSchema = new mongoose.Schema({
  index: {type: Number, required: true},
  name: {type: String, default: 'Unknown Team'},
  roles: [RolePermissionSchema]
}, {_id: false})

export const LevelPermissionSchema = new mongoose.Schema({
  level: {type: String, required: true},
  teams: [TeamPermissionSchema]
}, {_id: false})

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
  id: {type: mongoose.Schema.Types.ObjectId},
  permissions: [LevelPermissionSchema]
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const EngineModel = mongoose.model('engine', EngineSchema)
export default EngineModel
