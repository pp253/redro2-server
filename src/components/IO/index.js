import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'

export default class IO extends EventEmitter {
  constructor () {
    super()
    this.type = 'IO'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (this._loaded) {
        throw new Error('IO:load() Node has been loaded before.')
      }
      this._loaded = true

      this.node = node
      this.options = _.cloneDeep(options) || {}

      let state = this.options
      if (state.availableImportGoods) {
        for (let availableImportGood of state.availableImportGoods) {
          if (availableImportGood.left !== undefined) {
            continue
          }
          availableImportGood.left = availableImportGood.limit
        }
      }
      if (state.availableExportGoods) {
        for (let availableExportGood of state.availableExportGoods) {
          if (availableExportGood.left !== undefined) {
            continue
          }
          availableExportGood.left = availableExportGood.limit
        }
      }

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

      // Available Goods check
      if (this.store.state.rejectNotAvailableImportGoods === true) {
        let list = ij.list
        for (let ioJournalGoodItem of list) {
          let good = ioJournalGoodItem.good
          if (this.store.state.availableImportGoods.find(item => item.good === good) === undefined) {
            throw new Error('IO:import() Goods imported is not available.')
          }
        }
      }

      // Limit check
      if (this.store.state.hasImportLimit === true) {
        let list = ij.list
        for (let ioJournalGoodItem of list) {
          let good = ioJournalGoodItem.good
          let unit = ioJournalGoodItem.unit
          let it = this.store.state.availableImportGoods.find(item => item.good === good)
          if (typeof it.left === 'undefined') {
            it.left = it.limit
          }
          if (it.left < unit) {
            throw new Error('IO:import() Good imported has reach the limitation.')
          }
          it.left -= unit
        }
      }

      if (!this.node.Inventory) {
        throw new Error('IO:import() Inventory is required.')
      }

      this.store.commit('ADD_IMPORT', ij)
      .then(() => {
        return this.node.Inventory.import(ij)
      })
      .then((store) => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  export (ioJournalItem) {
    return new Promise((resolve, reject) => {
      let ij = _.cloneDeep(ioJournalItem)

      // Available Goods check
      if (this.store.state.rejectNotAvailableExportGoods === true) {
        for (let ioJournalGoodItem of ij.list) {
          let good = ioJournalGoodItem.good
          if (this.store.state.availableImportGoods.find(item => item.good === good) === undefined) {
            throw new Error('IO:import() Goods exported is not available.')
          }
        }
      }

      // Limit check
      if (this.store.state.hasImportLimit === true) {
        for (let inputJournalGoodItem of ij.list) {
          let good = inputJournalGoodItem.good
          let unit = inputJournalGoodItem.unit
          let it = this.store.state.availableImportGoods.find(item => item.good === good)
          if (typeof it.left === 'undefined') {
            it.left = it.limit
          }
          if (it.left < unit) {
            throw new Error('IO:import() Good exported has reach the limitation.')
          }
          it.left -= unit
        }
      }

      if (!this.node.Inventory) {
        throw new Error('IO:import() Inventory is required.')
      }

      this.node.Inventory.export(ij)
      .then(() => {
        return new Promise((resolve, reject) => {
          if (!this.node.Account) {
            return Promise.resolve()
          }

          let job = this.node.Account.add({
            credit: [{
              amount: ij.price,
              classification: 'AccountsReceivable',
              counterObject: ij.to
            }],
            debit: [{
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
              this.node.Account.add({
                credit: [{
                  amount: ij.transportationCost,
                  classification: 'CostOfTransportation',
                  counterObject: ij.to
                }],
                debit: [{
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

          job.catch(err => { reject(err) })

          return job
        })
      })
      .then(() => {
        return this.store.commit('ADD_EXPORT', ij)
      })
      .then(() => {
        let iji = this.store.exportJournal[this.store.exportJournal.length - 1]
        let gta = this.node.engine.gameTimeAdd(iji.gameTime, iji.transportationTime)
        this.node.engine.on(`game-day-${gta.day}-time-${gta.time}`, () => {
          this.store.commit('COMPLETE_EXPORT', {id: iji._id})
        })

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  getJournal (good) {
    let it = this.getStorage(good)
    if (!it) {
      return []
    }
    return _.cloneDeep(it.journal)
  }

  toObject () {
    return this.store.toObject()
  }
}
