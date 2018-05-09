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
          this.node.engine.on(ENGINE_EVENTS.GAME_OFFWORK, (engineTime) => {
            if (!this.store.state.hasStorageCost || !this.node.Account) {
              return
            }
            let Account = this.node.Account
            let sumOfCost = 0
            for (let storageItem of this.store.state.storage) {
              let good = storageItem.good
              let unit = storageItem.unit
              let costPerUnit = this.store.state.storageCost.find(item => item.good === good).cost
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

  /**
   *
   * @param {IOJournalItem} ioJournalItem
   */
  import (ioJournalItem) {
    return new Promise((resolve, reject) => {
      let ioji = _.cloneDeep(ioJournalItem)
      let price = ioji.price
      this.store.commit('ADD_STORAGES', ioji.list)
      .then((store) => {
        if (this.node.Account) {
          this.node.Account.add({
            credit: [{
              amount: price,
              classification: 'Inventory',
              counterObject: ioji.from
            }],
            debit: [{
              amount: price,
              classification: 'AccountsPayable',
              counterObject: ioji.from
            }],
            memo: 'Purchasing Inventory',
            time: ioji.time,
            gameTime: ioji.gameTime
          })
          .then(() => { resolve(this) })
        } else {
          resolve(this)
        }
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
        if (this.node.Account) {
          this.node.Account.add({
            credit: [{
              amount: sumOfCostOfSales,
              classification: 'CostOfSales',
              counterObject: ioji.from
            }],
            debit: [{
              amount: sumOfCostOfSales,
              classification: 'Inventory',
              counterObject: ioji.from
            }],
            memo: 'Selling Inventory',
            time: ioji.time,
            gameTime: ioji.gameTime
          })
          .then(() => { resolve(this) })
        } else {
          resolve(this)
        }
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {String} good
   * @returns {StorageItem}
   */
  getStorage (good) {
    return this.store.storage.find(item => item.good === good)
  }

  /**
   *
   * @param {String} good
   * @returns {Number} unit
   */
  getStorageUnit (good) {
    let s = this.getStorage()
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

    let s = this.getStorage()
    let left = unit
    let costOfSales = 0
    for (let leftIdx = s.stocks.indexOf(item => item.left > 0); leftIdx < s.stocks.length; leftIdx++) {
      let lit = s.stocks[leftIdx]
      if (left - lit.left > 0) {
        left -= lit.left
        costOfSales += lit.left * lit.unitPrice
      } else {
        left = 0
        costOfSales += left * lit.unitPrice
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
    return this.store.state._id
  }
}
