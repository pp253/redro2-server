import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { ENGINE_EVENTS } from '@/Engine'

export default class Inventory extends EventEmitter {
  constructor () {
    super()
    this.type = 'Inventory'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw new Error('Inventory:load() `node` should be instance of Node.')
      }
      if (this._loaded) {
        throw new Error('Inventory:load() Node has been loaded before.')
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
          this.node.engine.on(ENGINE_EVENTS.GAME_OFFWORK, (engineEvent) => {
            this.countStorageCost(engineEvent)
          })
        }
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {IOJournalItem} ioJournalItem
   */
  import (ioJournalItem) {
    return new Promise((resolve, reject) => {
      let ioji = _.cloneDeep(ioJournalItem)

      for (let item of ioji.list) {
        item.left = item.unit
      }

      this.store.commit('ADD_STORAGES', ioji.list)
      .then((store) => {
        this.node.Account.add({
          debit: [{
            amount: ioji.price,
            classification: 'Inventory',
            counterObject: ioji.from
          }],
          credit: [{
            amount: ioji.price,
            classification: 'AccountsPayable',
            counterObject: ioji.from
          }],
          memo: 'Purchasing Inventory',
          time: ioji.time,
          gameTime: ioji.gameTime
        })
        .then(() => { resolve(this) })
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {IOJournalItem} ioJournalItem
   */
  export (ioJournalItem) {
    return new Promise((resolve, reject) => {
      let ioji = _.cloneDeep(ioJournalItem)
      let sumOfCostOfSales = 0

      // Check the storage unit
      for (let stocksItem of ioji.list) {
        let su = this.getStorageUnit(stocksItem.good)
        if (su < stocksItem.unit) {
          throw new RangeError('Inventory:export() Out of stocks.')
        }
        sumOfCostOfSales += this.getCostOfSales(stocksItem.good, stocksItem.unit)
      }

      this.store.commit('TAKE_STORAGES', ioji.list)
      .then((store) => {
        this.node.Account.add({
          debit: [{
            amount: sumOfCostOfSales,
            classification: 'CostOfSales',
            counterObject: ioji.from
          }],
          credit: [{
            amount: sumOfCostOfSales,
            classification: 'Inventory',
            counterObject: ioji.from
          }],
          memo: 'Selling Inventory',
          time: ioji.time,
          gameTime: ioji.gameTime
        })
        .then(() => { resolve(this) })
      })
      .catch(err => { reject(err) })
    })
  }

  countStorageCost (engineEvent) {
    if (!this.store.state.hasStorageCost || !this.node.Account) {
      return
    }
    let Account = this.node.Account
    let sumOfCost = 0
    for (let storageItem of this.store.state.storage) {
      let good = storageItem.good
      let unit = storageItem.unit
      let costPerBatch = this.store.state.storageCost.find(item => item.good === good).costPerBatch
      sumOfCost += Math.ceil(unit / this.store.state.batchSize) * costPerBatch
    }
    Account.add({
      debit: [{
        amount: sumOfCost,
        classification: 'CostOfWarehousing'
      }],
      credit: [{
        amount: sumOfCost,
        classification: 'Cash'
      }],
      memo: 'Storage Cost',
      time: engineEvent.time,
      gameTime: engineEvent.gameTime
    })
  }

  /**
   *
   * @param {String} good
   * @returns {StorageItem}
   */
  getStorage (good) {
    return this.store.state.storage.find(item => item.good === good)
  }

  /**
   *
   * @param {String} good
   * @returns {Number} unit
   */
  getStorageUnit (good) {
    let s = this.getStorage(good)
    if (s === undefined) {
      return 0
    }
    return s.unit
  }

  getCostOfSales (good, unit) {
    let su = this.getStorageUnit(good)
    if (su < unit) {
      throw new Error('Inventory:getCostOfSales() Out of stocks.')
    }

    let s = this.getStorage(good)
    let left = unit
    let costOfSales = 0

    for (let idx = s.stocks.findIndex(item => item.left > 0); idx >= 0 && idx < s.stocks.length; idx++) {
      let lit = s.stocks[idx]
      if (left > lit.left) {
        costOfSales += lit.left * lit.unitPrice
        left -= lit.left
      } else {
        costOfSales += left * lit.unitPrice
        left = 0
        break
      }
    }
    return costOfSales
  }

  getJournal (good) {
    let s = this.getStorage(good)
    if (!s) {
      return []
    }
    return _.cloneDeep(s.journal)
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
