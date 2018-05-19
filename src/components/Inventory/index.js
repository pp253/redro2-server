import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { ENGINE_EVENTS } from '@/Engine'
import {INVENTORY_MODE, USER_LEVEL, INVENTORY_EVENTS, InventoryEvent} from '@/lib/schema'

export default class Inventory extends EventEmitter {
  constructor () {
    super()
    this.type = 'Inventory'
    this._loaded = false
    this.setMaxListeners(10000)
  }

  /**
   *
   * @param {Node} node
   * @param {Object} [options]
   * @returns {Promise}
   */
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

      let state = {
        storage: this.options.storage || [],
        storageCost: this.options.storageCost || [],
        hasStorageCost: this.options.hasStorageCost || true,
        batchSize: this.options.batchSize || 1,
        mode: this.options.mode || INVENTORY_MODE.PERPETUAL
      }
      store(state)
      .then((store) => {
        this.store = store
        resolve(this)

        /**
         * Computing Storage cost.
         */
        if (this.store.state.mode === INVENTORY_MODE.PERPETUAL && this.store.state.hasStorageCost) {
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
   * @returns {Promise}
   */
  import (ioJournalItem) {
    if (this.store.state.mode === INVENTORY_MODE.PERIODIC) {
      return Promise.resolve(this)
    }

    return new Promise((resolve, reject) => {
      let ioji = _.cloneDeep(ioJournalItem)

      for (let item of ioji.list) {
        if ('left' in item) {
          continue
        }
        item.left = item.unit
      }

      this.store.commit('ADD_STORAGES', ioji.list)
      .then((store) => {
        return this.node.Account.add({
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
      })
      .then(() => {
        this.emit(INVENTORY_EVENTS.INVENTORY_IMPOTY, new InventoryEvent({
          type: INVENTORY_EVENTS.INVENTORY_IMPOTY,
          gameTime: ioJournalItem.gameTime,
          target: this,
          ioJournalItem: ioJournalItem
        }))
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {IOJournalItem} ioJournalItem
   * @returns {Promise}
   */
  export (ioJournalItem) {
    if (this.store.state.mode === INVENTORY_MODE.PERIODIC) {
      return Promise.resolve(this)
    }

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
        return this.node.Account.add({
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
      })
      .then(() => {
        return this.node.Account.add({
          debit: [{
            amount: ioji.price,
            classification: 'AccountsReceivable',
            counterObject: ioji.to
          }],
          credit: [{
            amount: ioji.price,
            classification: 'Sales',
            counterObject: ioji.to
          }],
          memo: 'Sales',
          time: ioji.time,
          gameTime: ioji.gameTime
        })
      })
      .then(() => {
        this.emit(INVENTORY_EVENTS.INVENTORY_EXPORT, new InventoryEvent({
          type: INVENTORY_EVENTS.INVENTORY_EXPORT,
          gameTime: ioJournalItem.gameTime,
          target: this,
          ioJournalItem: ioJournalItem
        }))
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {Array<StocksItem>} stocksItemList
   * @returns {Promise}
   */
  regist (stocksItemList) {
    return new Promise((resolve, reject) => {
      this.store.commit('SET_STORAGES', stocksItemList)
      .then(() => {
        return this.countStorageCost({
          time: Date.now(),
          gameTime: this.engine.getGameTime()
        })
      })
      .then(() => {
        this.emit(INVENTORY_EVENTS.INVENTORY_REGIST, new InventoryEvent({
          type: INVENTORY_EVENTS.INVENTORY_REGIST,
          gameTime: this.engine.getGameTime(),
          target: this
        }))
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {EngineEvent} engineEvent
   * @returns {Promise}
   */
  countStorageCost (engineEvent) {
    if (!this.store.state.hasStorageCost || !this.node.Account) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      let Account = this.node.Account
      let sumOfCost = 0
      for (let storageItem of this.store.state.storage) {
        let good = storageItem.good
        let unit = storageItem.unit
        let costPerBatch = this.getStorageCost(good)
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
      .then(() => {
        this.emit(INVENTORY_EVENTS.INVENTORY_COUNT_STORAGE_COST, new InventoryEvent({
          type: INVENTORY_EVENTS.INVENTORY_COUNT_STORAGE_COST,
          gameTime: this.engine.getGameTime(),
          target: this,
          storageCost: sumOfCost
        }))
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {String} good
   * @returns {Number}
   */
  getStorageCost (good) {
    let it = this.store.state.storageCost.find(item => item.good === good)
    if (it === undefined) {
      return 0
    } else {
      return it.costPerBatch
    }
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

  getMode () {
    return this.store.state.mode
  }

  getStocks (good) {
    let s = this.getStorage(good)
    if (!s) {
      return []
    }
    return _.cloneDeep(s.stocks)
  }

  getActions (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
        return ['Inventory.*']

      case USER_LEVEL.STAFF:
        return [
          'Inventory.import',
          'Inventory.export',
          'Inventory.regist',
          'Inventory.getStorageCost',
          'Inventory.getStorage',
          'Inventory.getStorageUnit',
          'Inventory.getCostOfSales',
          'Inventory.getMode',
          'Inventory.getStocks'
        ]

      case USER_LEVEL.PLAYER:
        return [
          'Inventory.getStorageCost',
          'Inventory.getStorage',
          'Inventory.getStorageUnit',
          'Inventory.getCostOfSales',
          'Inventory.getMode',
          'Inventory.getStocks'
        ]

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  getListening (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
      case USER_LEVEL.STAFF:
      case USER_LEVEL.PLAYER:
        return [
          INVENTORY_EVENTS.INVENTORY_EXPORT,
          INVENTORY_EVENTS.INVENTORY_IMPOTY,
          INVENTORY_EVENTS.INVENTORY_REGIST,
          INVENTORY_EVENTS.INVENTORY_COUNT_STORAGE_COST
        ]

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
