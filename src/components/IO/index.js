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

      if (this.options.availableImportGoods) {
        for (let availableImportGood of this.options.availableImportGoods) {
          if (availableImportGood.left !== undefined) {
            continue
          }
          availableImportGood.left = availableImportGood.limit
        }
      }
      if (this.options.availableExportGoods) {
        for (let availableExportGood of this.options.availableExportGoods) {
          if (availableExportGood.left !== undefined) {
            continue
          }
          availableExportGood.left = availableExportGood.limit
        }
      }

      let state = _.cloneDeep(this.options)
      store(state)
      .then((store) => {
        this.store = store
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  import (ioJournalItem) {
    return new Promise((resolve, reject) => {
      let ij = _.cloneDeep(ioJournalItem)

      // Same good should not in more than 1 item
      let list = ij.list
      let uniqueMap = new Map()
      for (let ioJournalGoodItem of list) {
        let good = ioJournalGoodItem.good
        if (uniqueMap.has(good)) {
          throw new Error('IO:import() Same good should not in more than 1 item.')
        }
        uniqueMap.set(good, true)
      }

      // Available Goods check
      for (let ioJournalGoodItem of list) {
        let good = ioJournalGoodItem.good
        let unit = ioJournalGoodItem.unit
        if (!this.isImportGoodAvailable(good, unit)) {
          throw new Error('IO:import() Goods imported is not available.')
        }
      }

      for (let ioJournalGoodItem of list) {
        let good = ioJournalGoodItem.good
        let unit = ioJournalGoodItem.unit
        this.store.immediate('SUB_IMPORT_LEFT', {
          good: good,
          unit: unit
        })
      }

      if (!this.node.Inventory) {
        throw new Error('IO:import() Inventory is required.')
      }

      this.store.commit('ADD_IMPORT', ij)
      .then((store) => {
        if (ij.transportationStatus === TRANSPORTATION_STATUS.DELIVERING) {
          let gta = this.node.engine.gameTimeAdd(ij.gameTime, ij.transportationTime)

          this.node.engine.once(ENGINE_EVENTS.GAME_DAY_X_TIME_Y(gta.day, gta.time), (engineEvent) => {
            let importJournal = this.getImportJournal()
            let iji = importJournal[importJournal.length - 1]
            let id = iji._id.toHexString()

            this.store.commit('COMPLETE_IMPORT', {id: id})
            .then(() => {
              return this.node.Inventory.import({
                from: ij.from,
                to: ij.to,
                list: ij.list,
                price: ij.price,
                time: engineEvent.time,
                gameTime: engineEvent.gameTime
              })
            })
            .catch(err => {
              reject(err)
            })
          })

          resolve(this)
        } else {
          this.node.Inventory.import({
            from: ij.from,
            to: ij.to,
            list: _.cloneDeep(ij.list),
            price: ij.price,
            time: ij.time,
            gameTime: ij.gameTime
          })
          .then(() => { resolve(this) })
          .catch(err => { reject(err) })
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
      let ij = _.cloneDeep(ioJournalItem)

      // Available Goods check
      let list = ij.list
      for (let ioJournalGoodItem of list) {
        let good = ioJournalGoodItem.good
        let unit = ioJournalGoodItem.unit
        if (!this.isImportGoodAvailable(good, unit)) {
          throw new Error('IO:import() Goods imported is not available.')
        }
        this.store.immediate('SUB_EXPORT_LEFT', {
          good: good,
          unit: unit
        })
      }

      if (!this.node.Inventory) {
        throw new Error('IO:import() Inventory is required.')
      }

      this.node.Inventory.export(ij)
      .then(() => { return this.engine.getNode(ij.to).IO.import(ij) })
      .then(() => {
        return new Promise((resolve, reject) => {
          if (!this.node.Account) {
            resolve()
            return
          }

          let job = this.node.Account.add({
            debit: [{
              amount: ij.price,
              classification: 'AccountsReceivable',
              counterObject: ij.to
            }],
            credit: [{
              amount: ij.price,
              classification: 'Sales',
              counterObject: ij.to
            }],
            memo: 'Sales',
            time: ij.time,
            gameTime: ij.gameTime
          })

          if (ij.transportationCost > 0) {
            job.then(() => {
              return this.node.Account.add({
                debit: [{
                  amount: ij.transportationCost,
                  classification: 'CostOfTransportation',
                  counterObject: ij.to
                }],
                credit: [{
                  amount: ij.transportationCost,
                  classification: 'Cash',
                  counterObject: ij.to
                }],
                memo: 'Cost of Transportation',
                time: ij.time,
                gameTime: ij.gameTime
              })
            })
          }

          resolve(job)
        })
      })
      .then(() => {
        return this.store.commit('ADD_EXPORT', ij)
      })
      .then(() => {
        let exportJournal = this.getExportJournal()
        let iji = exportJournal[exportJournal.length - 1]
        if (iji.transportationStatus === TRANSPORTATION_STATUS.DELIVERING) {
          let gta = this.node.engine.gameTimeAdd(iji.gameTime, iji.transportationTime)
          this.node.engine.once(ENGINE_EVENTS.GAME_DAY_X_TIME_Y(gta.day, gta.time), () => {
            this.store.commit('COMPLETE_EXPORT', {id: iji._id.toHexString()})
          })
        }

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {String} good
   * @param {Number} [unit]
   * @returns {Boolean}
   */
  isImportGoodAvailable (good, unit = 0) {
    if (!this.store.state.rejectNotAvailableImportGoods) {
      return true
    }

    let it = this.store.state.availableImportGoods.find(item => item.good === good)
    if (it === undefined) {
      return false
    }
    if (this.store.state.hasImportLimit === false) {
      return true
    }
    let left = 'left' in it ? it.left : it.limit
    if (left < unit) {
      return false
    }
    return true
  }

  /**
   *
   * @param {String} good
   * @param {Number} [unit]
   * @returns {Boolean}
   */
  isExportGoodAvailable (good, unit = 0) {
    if (!this.store.state.rejectNotAvailableExportGoods) {
      return true
    }

    let it = this.store.state.availableExportGoods.find(item => item.good === good)
    if (it === undefined) {
      return false
    }
    if (this.store.state.hasExportLimit === true) {
      return true
    }
    let left = 'left' in it ? it.left : it.limit
    if (left < unit) {
      return false
    }
    return true
  }

  getImportJournal (good) {
    return this.store.state.importJournal
  }

  getExportJournal (good) {
    return this.store.state.exportJournal
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
