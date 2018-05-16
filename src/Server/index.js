import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Engine from '@/Engine'

export class Server extends EventEmitter {
  constructor () {
    super()
    this.type = 'Server'
    this._loaded = false
    this.engines = new Map()
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
      .then(() => { resolve(this) })
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

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}

export default new Server()
