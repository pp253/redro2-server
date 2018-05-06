import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'

export default class Input extends EventEmitter {
  constructor () {
    super()
    this.type = 'Input'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (this._loaded) {
        throw new Error('Input:load() Node has been loaded before.')
      }
      this._loaded = true

      this.node = node
      this.options = _.cloneDeep(options)

      let state = this.options
      for (let availableImportGood of state.availableImportGoods) {
        if (availableImportGood.left !== undefined) {
          continue
        }
        availableImportGood.left = availableImportGood.limit
      }

      store(state)
      .then((store) => {
        this.store = store
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  import (inputJournalItem) {
    return new Promise((resolve, reject) => {
      let ij = _.cloneDeep(inputJournalItem)

      // Available Importers check
      if (this.store.state.rejectNotAvailableImpoters === true) {
        let fromId = ij.from
        if (this.store.state.availableImporters.find(item => item.id === fromId) === undefined) {
          throw new Error('Input:import() Importer is not available.')
        }
      }

      // Available Goods check
      if (this.store.state.rejectNotAvailableGoods === true) {
        let list = ij.list
        for (let inputJournalGoodItem of list) {
          let good = inputJournalGoodItem.good
          if (this.store.state.availableImportGoods.find(item => item.good === good) === undefined) {
            throw new Error('Input:import() Good imported is not available.')
          }
        }
      }

      // Limit check
      if (this.store.state.hasImportLimit === true) {
        let list = ij.list
        for (let inputJournalGoodItem of list) {
          let good = inputJournalGoodItem.good
          let unit = inputJournalGoodItem.unit
          let it = this.store.state.availableImportGoods.find(item => item.good === good)
          if (typeof it.left === 'undefined') {
            it.left = it.limit
          }
          if (it.left < unit) {
            throw new Error('Input:import() Good imported has reach the limitation.')
          }
          it.left -= unit
        }
      }

      if (this.node.Account) {
        // Accounting check
        let Account = this.node.Account
        let balanceOfCash = Account.getBalance('Cash')
        let sumOfCost = (ij.price ? ij.price : 0) + (ij.deliveringCost ? ij.deliveringCost : 0)
        if (balanceOfCash < sumOfCost) {
          throw new Error('Input:import() The price and delivering cost is unaffordable.')
        }

        // Add to account
        Account.add({
          credit: [{
            amount: sumOfCost,
            classification: 'CostOfSales'
          }],
          debit: [{
            amount: sumOfCost,
            classification: 'Cash'
          }],
          memo: 'Cost of Sales',
          time: ij.time,
          gameTime: ij.gameTime
        })
      }

      this.store.commit('ADD_INPUT', ij)
      .then((store) => {
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
