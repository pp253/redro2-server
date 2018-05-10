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

  /**
   *
   * @param {BiddingItem} BiddingItem
   */
  release (BiddingItem) {
    return new Promise((resolve, reject) => {
      // check sum of costs of goods is the same as price
      if (BiddingItem) {

      }

      // check the publisher is from the up of down stream

      //

      this.store.commit('ADD_BIDDING', BiddingItem)
      .then(() => {
        this.emit(schema.BIDDING_EVENTS.BIDDING_RELEASED /* BiddingEvent */)

        resolve(this)
      })
    })
  }

  cancel (BiddingItem) {
    return new Promise((resolve, reject) => {
      // check sum of costs of goods is the same as price
      if (BiddingItem.id) {

      }
      if (BiddingItem.publisher) {

      }

      this.store.commit('SET_BIDDING_STAGE', {id: id, stage: schema.BIDDING_ITEM_STAGE.CANCELED})
      .then(() => {
        this.emit(schema.BIDDING_EVENTS.BIDDING_CANCELED /* BiddingEvent */)

        resolve(this)
      })
    })
  }

  cancelForce () {

  }
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

  toMaskedObject () {}

  getId () {
    return this.store.state._id
  }
}
