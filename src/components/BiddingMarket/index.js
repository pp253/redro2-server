import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'

export const BIDDING_EVENTS = {
  BIDDING_RELEASED: 'bidding-released',
  BIDDING_CANCELED: 'bidding-canceled',
  BIDDING_SIGNED: 'bidding-signed',
  BIDDING_BREAKOFF: 'bidding-breakoff',
  BIDDING_DELIVERING: 'bidding-delivering'
}

export const BIDDING_ITEM_STAGE = {
  CONSTRUCTED: 'CONSTRUCTED',
  BIDDING: 'BIDDING',
  CANCELED: 'CANCELED',
  SIGNED: 'SIGNED',
  BREAKOFF: 'BREAKOFF',
  COMPLETED: 'COMPLETED'
}

export const BIDDING_CHAIN = {
  UPSTREAM: 'UPSTREAM',
  DOWNSTREAM: 'DOWNSTREAM'
}

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

        /**
         * Computing Storage cost.
         */
        if (this.store.state.hasStorageCost && this.node.Account) {
          this.node.engine.on('game-offwork', (engineTime) => {
            if (!this.store.state.hasStorageCost || !this.node.Account) {
              return
            }
            let Account = this.node.Account
            let sumOfCost = 0
            for (let storageItem of this.store.state.storage) {
              let good = storageItem.good
              let unit = storageItem.unit
              let costPerUnit = this.store.state.storageCost.find(item => item.good === good)
              sumOfCost += unit * costPerUnit
            }
            Account.add({
              credit: [{
                amount: sumOfCost,
                classification: 'CostOfWarehousing'
              }],
              debit: [{
                amount: sumOfCost,
                classification: 'Cash'
              }],
              memo: 'Storage Cost',
              time: engineTime.time,
              gameTime: engineTime.gameTime
            })
          })
        }
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

  _boardcast() {}

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id
  }
}
