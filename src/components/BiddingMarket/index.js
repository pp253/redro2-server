import { EventEmitter } from 'events'
import _ from 'lodash'
import * as schema from '@/lib/schema'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'

export default class BiddingMarket extends EventEmitter {
  constructor () {
    super()
    this.type = 'BiddingMarket'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw new Error('BiddingMarket:load() `node` should be instance of Node.')
      }
      if (this._loaded) {
        throw new Error('BiddingMarket:load() Node has been loaded before.')
      }
      this._loaded = true

      this.node = node
      this.options = _.cloneDeep(options) || {}

      let state = {}
      store(state)
      .then((store) => {
        this.store = store
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  release () {

  }

  cancel () {}
  sign () {}
  breakoff () {}
  deliver () {}

  /**
   * Another name of `deliver()`.
   */
  complete () {}

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id
  }
}
