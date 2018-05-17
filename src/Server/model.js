import mongoose from 'mongoose'
import { EngineSchema } from '@/Engine/model'
import { USER_LEVEL } from '@/lib/schema'

export const PlayerEngineRoleSchema = new mongoose.Schema({
  id: {type: mongoose.Schema.Types.ObjectId, required: true},
  role: {type: String, required: true}
}, {_id: false})

export const PermissionSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, required: true},
  engineId: {type: mongoose.Schema.Types.ObjectId, required: true},
  teamIndex: {type: Number, required: true},
  role: {type: String, required: true}
}, {_id: false})

export const PlayerSchema = new mongoose.Schema({
  name: {type: String, required: true},
  password: {type: String, required: true},
  level: {type: String, default: USER_LEVEL.GUEST, required: true},
  permissions: [PermissionSchema]
})

export const ServerSchema = new mongoose.Schema({
  engines: [EngineSchema],
  users: [PlayerSchema]
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const ServerModel = mongoose.model('server', ServerSchema)
export default ServerModel
