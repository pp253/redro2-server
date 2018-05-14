import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'

export default class MarketReceiver extends EventEmitter {
  constructor () {
    super()
    this.type = 'MarketReceiver'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw new Error('MarketReceiver:load() `node` should be instance of Node.')
      }
      if (this._loaded) {
        throw new Error('MarketReceiver:load() Node has been loaded before.')
      }
      this._loaded = true

      this.node = node
      this.engine = node.engine
      this.options = _.cloneDeep(options) || {}

      let state = _.cloneDeep(this.options)
      store(state)
      .then((store) => {
        this.store = store

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  sell (marketJournalItem) {
    return new Promise((resolve, reject) => {
      this.node.IO.export({
        from: marketJournalItem.from,
        to: this.getProvider(),
        list: marketJournalItem.list,
        price: marketJournalItem.price,
        memo: marketJournalItem.memo,
        time: marketJournalItem.time,
        gameTime: marketJournalItem.gameTime
      })
    })
  }

  isProvider (name) {
    return this.getProvider() === name
  }

  getProvider () {
    return this.store.state.provider
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
