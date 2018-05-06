import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'

export default class Inventory extends EventEmitter {
  constructor () {
    super()
    this.type = 'Inventory'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (this._loaded) {
        throw new Error('Inventory:load() Node has been loaded before.')
      }
      this._loaded = true

      this.node = node
      this.options = options

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

  import (storageGoodJournalItem) {
    return new Promise((resolve, reject) => {
      let sg = _.cloneDeep(storageGoodJournalItem)
      this.store.commit('ADD_STORAGE', sg)
      .then((store) => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  export (storageGoodJournalItem) {
    return new Promise((resolve, reject) => {
      let sg = _.cloneDeep(storageGoodJournalItem)
      sg.unit = -sg.unit
      this.store.commit('ADD_STORAGE', sg)
      .then((store) => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  getStorage (good) {
    return this.store.storage.find(item => item.good === good)
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
