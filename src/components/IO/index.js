import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { ENGINE_EVENTS, TRANSPORTATION_STATUS, USER_LEVEL, IO_EVENTS, IOEvent } from '@/lib/schema'
import { ResponseErrorMsg } from '@/api/response'

export default class IO extends EventEmitter {
  constructor () {
    super()
    this.type = 'IO'
    this._loaded = false
    this.setMaxListeners(10000)
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw ResponseErrorMsg.NodeNotAnInstanceOfNode()
      }
      if (this._loaded) {
        throw ResponseErrorMsg.IOHasLoaded(node.getName())
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
      let ij = _.cloneDeep(ioJournalItem.toObject ? ioJournalItem.toObject() : ioJournalItem)

      // Same good should not in more than 1 item
      let list = ij.list
      let uniqueSet = new Set()
      for (let ioJournalGoodItem of list) {
        let good = ioJournalGoodItem.good
        if (uniqueSet.has(good)) {
          throw ResponseErrorMsg.IOUniqueGood(this.node.getName(), good)
        }
        uniqueSet.add(good)
      }

      // Available Goods check
      for (let ioJournalGoodItem of list) {
        let good = ioJournalGoodItem.good
        let unit = ioJournalGoodItem.unit
        if (!this.isImportGoodAvailable(good, unit)) {
          throw ResponseErrorMsg.IOImportNotAvailable(this.node.getName(), good, unit)
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
        throw ResponseErrorMsg.IOInventoryRequired(this.node.getName())
      }

      this.store.commit('ADD_IMPORT', ij)
      .then((store) => {
        return new Promise((resolve, reject) => {
          if (ij.transportationStatus === TRANSPORTATION_STATUS.DELIVERING) {
            let gta = this.engine.gameTimeAdd(ij.gameTime, ij.transportationTime)

            let importJournal = store.state.importJournal.toObject()
            let iji = importJournal[importJournal.length - 1]

            this.engine.once(ENGINE_EVENTS.GAME_DAY_X_TIME_Y(gta.day, gta.time), (engineEvent) => {
              this.store.commit('COMPLETE_IMPORT', {id: iji._id.toHexString()})
              .then(() => {
                return new Promise((resolve, reject) => {
                  this.node.Inventory.import({
                    from: iji.from,
                    to: iji.to,
                    list: iji.list,
                    price: iji.price,
                    time: engineEvent.time,
                    gameTime: engineEvent.gameTime
                  })
                  .then(() => { resolve() })
                  .catch(err => { reject(err) })
                })
              })
              .then(() => {
                this.emit(IO_EVENTS.IO_IMPORT_COMPLETE, new IOEvent({
                  type: IO_EVENTS.IO_IMPORT_COMPLETE,
                  gameTime: engineEvent.gameTime,
                  target: this,
                  ioJournalItem: iji,
                  nodeName: this.node.getName(),
                  engineId: this.engine.getId()
                }))
              })
              .catch(err => { reject(err) })
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
      })
      .then(() => {
        let importJournal = this.getImportJournal()
        let iji = importJournal[importJournal.length - 1].toObject()
        this.emit(IO_EVENTS.IO_IMPORT, new IOEvent({
          type: IO_EVENTS.IO_IMPORT,
          gameTime: ij.gameTime,
          target: this,
          ioJournalItem: iji,
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))
        resolve(this)
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
        if (!this.isExportGoodAvailable(good, unit)) {
          throw ResponseErrorMsg.IOExportNotAvailable(this.node.getName(), good, unit)
        }
        this.store.immediate('SUB_EXPORT_LEFT', {
          good: good,
          unit: unit
        })
      }

      // Count the Transportation Cost
      let trCost = 0
      for (let ioJournalGoodItem of list) {
        let unit = ioJournalGoodItem.unit
        trCost += Math.ceil(unit / this.store.state.batchSize) * this.store.state.transportationCost
      }
      ij.transportationCost = trCost

      if (!this.node.Inventory) {
        throw ResponseErrorMsg.IOInventoryRequired(this.node.getName())
      }

      this.node.Inventory.export(ij)
      .then(() => { return this.engine.getNode(ij.to).IO.import(ij) })
      .then(() => {
        if (!ij.transportationCost || ij.transportationCost <= 0) {
          return Promise.resolve()
        }

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
      .then(() => {
        return this.store.commit('ADD_EXPORT', ij)
      })
      .then((store) => {
        let exportJournal = store.state.exportJournal.toObject()
        let iji = exportJournal[exportJournal.length - 1]

        if (iji.transportationStatus === TRANSPORTATION_STATUS.DELIVERING) {
          let gta = this.engine.gameTimeAdd(iji.gameTime, iji.transportationTime)
          console.log(gta)
          this.engine.once(ENGINE_EVENTS.GAME_DAY_X_TIME_Y(gta.day, gta.time), (engineEvent) => {
            this.store.commit('COMPLETE_EXPORT', {id: iji._id.toHexString()})
            .then(() => {
              this.emit(IO_EVENTS.IO_EXPORT_COMPLETE, new IOEvent({
                type: IO_EVENTS.IO_EXPORT_COMPLETE,
                gameTime: engineEvent.gameTime,
                target: this,
                ioJournalItem: iji,
                nodeName: this.node.getName(),
                engineId: this.engine.getId()
              }))
            })
            .catch(err => { reject(err) })
          })
        }

        this.emit(IO_EVENTS.IO_EXPORT, new IOEvent({
          type: IO_EVENTS.IO_EXPORT,
          gameTime: iji.gameTime,
          target: this,
          ioJournalItem: iji,
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))

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
    if (this.store.state.hasExportLimit === false) {
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

  getActions (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
        return ['*']

      case USER_LEVEL.STAFF:
      case USER_LEVEL.PLAYER:
        return [
          'IO.import',
          'IO.export',
          'IO.isImportGoodAvailable',
          'IO.isExportGoodAvailable',
          'IO.getImportJournal',
          'IO.getExportJournal'
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
          IO_EVENTS.IO_IMPORT,
          IO_EVENTS.IO_EXPORT,
          IO_EVENTS.IO_IMPORT_COMPLETE,
          IO_EVENTS.IO_EXPORT_COMPLETE
        ]

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  toMaskedObject () {
    return {
      engineId: this.engine.getId(),
      nodeName: this.node.getName(),

      enableImport: this.store.state.enableImport,
      importJournal: this.store.state.importJournal.toObject(),
      availableImportGoods: this.store.state.availableImportGoods.toObject(),
      hasImportLimit: this.store.state.hasImportLimit,
      rejectNotAvailableImportGoods: this.store.state.rejectNotAvailableImportGoods,

      enableExport: this.store.state.enableExport,
      exportJournal: this.store.state.exportJournal.toObject(),
      availableExportGoods: this.store.state.availableExportGoods.toObject(),
      hasExportLimit: this.store.state.hasExportLimit,
      rejectNotAvailableExportGoods: this.store.state.rejectNotAvailableExportGoods,

      transportationCost: this.store.state.transportationCost,
      batchSize: this.store.state.batchSize
    }
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
