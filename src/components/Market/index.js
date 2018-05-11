import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { ENGINE_EVENTS, TRANSPORTATION_STATUS } from '@/lib/schema'

export default class IO extends EventEmitter {
  constructor () {
    super()
    this.type = 'IO'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw new Error('IO:load() `node` should be instance of Node.')
      }
      if (this._loaded) {
        throw new Error('IO:load() Node has been loaded before.')
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

  buy (marketJournalItem) {
    return new Promise((resolve, reject) => {
      // Check from upstreams
      if (!this.isUpstreams(marketJournalItem.from)) {
        throw new Error('Market:buy() Market seller must from the upstreams of market.')
      }

      // Check for the needed good
      for (let item of marketJournalItem.list) {
        let it = this.getNeededGood(item.good)
        if (it === undefined) {
          throw new Error('Market:buy() Seller can only sell the goods that market needed.')
        }
        if (item.unit > it.left) {
          throw new Error('Market:buy() The market has no more needs of the good.')
        }
        item.unitPrice = it.unitPrice
        // TODO: minus the left
      }

      this.engine.getNode(marketJournalItem.from)
      .MarketReceiver.sell(marketJournalItem)
    })
  }

  getNeededGood (good) {
    return this.store.state.marketNeeds.find(needs => needs.good === good)
  }

  isNeededGood (good) {
    let it = this.getNeededGood(good)
    if (it === undefined) {
      return false
    } else {
      return true
    }
  }

  getLeftNeedsUnitOfGood (good) {
    let it = this.getNeededGood(good)
    if (it === undefined) {
      return 0
    } else {
      return it.left
    }
  }

  getUnitPrice (good) {
    let it = this.getNeededGood(good)
    if (it === undefined) {
      return 0
    } else {
      return it.unitPrice
    }
  }

  isUpstreams (name) {
    let it = this.store.state.upstreams.find(upstream => upstream === name)
    if (it === undefined) {
      return false
    } else {
      return true
    }
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
