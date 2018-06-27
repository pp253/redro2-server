import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { USER_LEVEL, MARKET_EVENTS } from '@/lib/schema'

export default class MarketReceiver extends EventEmitter {
  constructor () {
    super()
    this.type = 'MarketReceiver'
    this._loaded = false
    this.setMaxListeners(10000)
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
        this.provider = this.engine.getNode(this.getProvider())

        for (let eventName of [
          MARKET_EVENTS.MARKET_NEEDS_CHANGE,
          MARKET_EVENTS.MARKET_NEWS_PUBLISHED
        ]) {
          this.provider.Market.on(eventName, (marketEvent) => {
            this.emit(eventName, marketEvent)
          })
        }

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  sell (marketJournalItem) {
    return new Promise((resolve, reject) => {
      this.node.IO.export({
        from: this.node.getName(),
        to: this.getProvider(),
        list: marketJournalItem.list,
        price: marketJournalItem.price,
        memo: marketJournalItem.memo,
        time: marketJournalItem.time,
        gameTime: marketJournalItem.gameTime
      })
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  isProvider (name) {
    return this.getProvider() === name
  }

  getProvider () {
    return this.store.state.provider
  }

  getActions (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
        return ['MarketReceiver.*']

      case USER_LEVEL.STAFF:
        return [
          'MarketReceiver.sell',
          'MarketReceiver.isProvider',
          'MarketReceiver.getProvider'
        ]

      case USER_LEVEL.PLAYER:
        return [
          'isProvider',
          'getProvider'
        ]

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  getListening (level) {
    switch (level) {
      default:
      case USER_LEVEL.ADMIN:
      case USER_LEVEL.STAFF:
      case USER_LEVEL.PLAYER:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  toObject () {
    return this.store.toObject()
  }

  toMaskedObject () {
    return {
      provider: this.store.provider,
      news: this.getProvider().getAvailableNews()
    }
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
