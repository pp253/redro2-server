import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Engine from '@/Engine'

export default class Server extends EventEmitter {
  constructor () {
    super()
    this.type = 'Server'
    this._loaded = false
  }

  load (app, options) {
    return new Promise((resolve, reject) => {
      if (this._loaded) {
        throw new Error('Engine:load() Engine has been loaded before.')
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

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id
  }
}
