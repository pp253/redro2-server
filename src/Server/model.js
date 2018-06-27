import mongoose from 'mongoose'
import { EngineSchema } from '@/Engine/model'
import { USER_LEVEL } from '@/lib/schema'

export const UserEngineRoleSchema = new mongoose.Schema({
  id: {type: mongoose.Schema.Types.ObjectId, required: true},
  role: {type: String, required: true}
}, {_id: false})

export const PermissionSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, required: true},
  engineId: {type: mongoose.Schema.Types.ObjectId, required: true},
  teamIndex: {type: Number, required: true},
  role: {type: String, required: true}
}, {_id: false})

export const UserLogSchema = new mongoose.Schema({
  /**
   * regist
   * level_change
   * login
   * logout
   * permissions_change
   * password_change
   */
  type: {type: String, required: true},
  message: {type: String},
  time: {type: Date, default: Date.now}
}, {_id: false})

export const UserSchema = new mongoose.Schema({
  name: {type: String, required: true},
  password: {type: String, required: true},
  level: {type: String, default: USER_LEVEL.GUEST, required: true},
  permissions: [PermissionSchema],
  log: [UserLogSchema]
})

export const ServerSchema = new mongoose.Schema({
  engines: [EngineSchema],
  users: [UserSchema]
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const ServerModel = mongoose.model('server', ServerSchema)
export default ServerModel
