import Engine from '@/Engine'
import { USER_LEVEL } from '@/lib/schema'
import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'

export class Server extends EventEmitter {
  constructor () {
    super()
    this.type = 'Server'
    this._loaded = false
    this.engines = new Map()
    this.rooms = new Map()
  }

  load (app, options) {
    return new Promise((resolve, reject) => {
      if (this._loaded) {
        throw new Error('Server:load() Engine has been loaded before.')
      }
      this._loaded = true

      this.app = app
      this.options = _.cloneDeep(options) || {}

      let state = this.options

      store(state)
      .then((store) => {
        this.store = store
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  createEngine (options) {
    return new Promise((resolve, reject) => {
      let engine = new Engine()
      engine.load(this, options)
      .then(() => {
        this.engines.set(engine.getId(), engine)
        options.id = engine.getId()
        return this.store.commit('ADD_ENGINE', options)
      })
      .then(() => {
        // TODO: listen on nodes and emit to socket rooms
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  getEngine (id) {
    if (!this.engines.has(id)) {
      throw new Error(`Server:getEngine() Engine id ${id} is not found.`)
    }
    return this.engines.get(id)
  }

  getEnginesList () {
    let list = []
    for (let engine of this.engines.values()) {
      let content = engine.toObject()
      list.push({
        name: content.name,
        describe: content.describe,
        stage: content.stage,
        id: content._id
      })
    }
    return list
  }

  addUser (user) {
    return new Promise((resolve, reject) => {
      if (this.getUserByName(user.name) !== undefined) {
        throw new Error(`Server:userCreate() User name '${user.name} has been used, try another name instead.`)
      }
      this.store.commit('ADD_USER', user)
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  changeUserLevel (userId, level) {
    return new Promise((resolve, reject) => {
      let user = this.getUser(userId)
      if (user === undefined) {
        throw new Error(`Server:changeUserLevel() User id '${userId}' is not found.`)
      }
      this.store.commit('CHANGE_USER_LEVEL', {userId: userId, level: level})
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  addUserRole (userId, engindId, teamIndex, role) {
    return new Promise((resolve, reject) => {
      let user = this.getUser(userId)
      if (user === undefined) {
        throw new Error(`Server:addUserRole() User id '${userId}' is not found.`)
      }
      let permission = user.permissions.find(permission => permission.engineId.equals(engindId))
      if (permission !== undefined) {
        throw new Error(`Server:addUserRole() Permission of engine id '${engindId}' was existed.`)
      }
      let level = user.level
      if (![USER_LEVEL.ADMIN, USER_LEVEL.STAFF].includes(level)) {
        if (teamIndex === 0) {
          throw new Error(`Server:addUserRole() User id '${userId}' has no permission to enroll the staff team.`)
        }
      }
      this.store.commit('ADD_USER_ROLE', {
        userId: userId,
        engindId: engindId,
        teamIndex: teamIndex,
        role: role
      })
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  changeUserRole (userId, engindId, teamIndex, role) {
    return new Promise((resolve, reject) => {
      let user = this.getUser(userId)
      if (user === undefined) {
        throw new Error(`Server:changeUserRole() User id '${userId}' is not found.`)
      }
      let permission = user.permissions.find(permission => permission.engineId.equals(engindId))
      if (permission === undefined) {
        throw new Error(`Server:changeUserRole() Permission of engine id '${engindId}' is not found.`)
      }
      this.store.commit('CHANGE_USER_ROLE', {
        userId: userId,
        engindId: engindId,
        teamIndex: teamIndex,
        role: role
      })
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  userLogin (name, password) {
    let user = this.getUserByName(name)
    if (user === undefined) {
      throw new Error(`Server:userLogin() User name '${name}' is not found.`)
    } else if (user.password !== password) {
      throw new Error(`Server:userLogin() User ${name} password is not correct.`)
    }
    return user
  }

  getUserByName (name) {
    return this.store.state.users.find(user => user.name === name)
  }

  getUser (userId) {
    return this.store.state.users.find(user => user._id.equals(userId))
  }

  getUserLevel (userId) {
    let user = this.getUser(userId)
    if (user === undefined) {
      return USER_LEVEL.GUEST
    }
    return user.level
  }

  checkPermission (userId, action) {
    let level = this.getUserLevel(userId)
    let permissions = this.getActions(level)
    if (typeof permissions === 'boolean') {
      return permissions
    } else if (!(action in permissions)) {
      return false
    } else {
      return permissions[action]
    }
  }

  getActions (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
        return ['*']

      case USER_LEVEL.STAFF:
        return [
          'userLogin',
          'addUserRole',
          'changeUserRole'
        ]

      case USER_LEVEL.PLAYER:
        return [
          'userLogin',
          'changeUserRole'
        ]

      default:
      case USER_LEVEL.GUEST:
        return [
          'userLogin'
        ]
    }
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}

export default new Server()
