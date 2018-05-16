import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { ENGINE_EVENTS, TRANSPORTATION_STATUS, INVENTORY_MODE } from '@/lib/schema'

export default class AssemblyDepartment extends EventEmitter {
  constructor () {
    super()
    this.type = 'AssemblyDepartment'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw new Error('AssemblyDepartment:load() `node` should be instance of Node.')
      }
      if (this._loaded) {
        throw new Error('AssemblyDepartment:load() Node has been loaded before.')
      }
      this._loaded = true

      this.node = node
      this.engine = node.engine
      this.options = _.cloneDeep(options) || {}

      let state = _.cloneDeep(this.options)
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
   * @param {*} ioJournalItem
   * 要組裝的對象應填寫於`to`
   * 要合成的物品應填寫於`list`中
   * one time for one kind of good to assemble.
   */
  assemble (ioJournalItem) {
    return new Promise((resolve, reject) => {
      // Check is receiver or not
      let to = ioJournalItem.to
      if (!this.isReceiver(to)) {
        throw new Error(`AssemblyDepartment:assemble() ${to} is not one of the receivers.`)
      }

      // Check the inventory of receiver
      let inventory = this.engine.getNode(to).Inventory
      let sumOfCostOfSales = 0
      let componentsList = []
      let productsList = []
      for (let item of ioJournalItem.list) {
        let good = item.good
        let unit = item.unit
        if (!this.isAvailableForAssemble(to, good, unit)) {
          throw new Error(`AssemblyDepartment:assemble() ${to} is not available for assembling ${unit} of ${good}.`)
        }

        // Count the Sum of Cost
        for (let item of this.getComponentsList(good, unit)) {
          let it = componentsList.find(component => component.good === item.good)
          if (it === undefined) {
            componentsList.push({
              good: item.good,
              unit: 0
            })
            it = componentsList[componentsList.length - 1]
          }
          it.unit += item.unit
          sumOfCostOfSales += inventory.getCostOfSales(item.good, item.unit)
        }

        productsList.push({
          good: good,
          unit: unit,
          unitPrice: sumOfCostOfSales / unit // Average cost of one product
        })
      }

      let account = this.node.Account
      inventory.export({
        from: to,
        to: this.node.getName(),
        list: componentsList,
        price: sumOfCostOfSales,
        time: ioJournalItem.time,
        gameTime: ioJournalItem.gameTime
      })
      .then(() => {
        return account.add({
          debit: [{
            amount: sumOfCostOfSales,
            classification: 'Inventory',
            counterObject: to
          }],
          credit: [{
            amount: sumOfCostOfSales,
            classification: 'AccountsPayable',
            counterObject: to
          }],
          memo: 'Assemble',
          time: ioJournalItem.time,
          gameTime: ioJournalItem.gameTime
        })
      })
      .then(() => {
        return account.add({
          debit: [{
            amount: sumOfCostOfSales,
            classification: 'AccountsReceivable',
            counterObject: to
          }],
          credit: [{
            amount: sumOfCostOfSales,
            classification: 'Inventory',
            counterObject: to
          }],
          memo: 'Assemble',
          time: ioJournalItem.time,
          gameTime: ioJournalItem.gameTime
        })
      })
      .then(() => {
        return inventory.import({
          from: this.node.getName(),
          to: to,
          list: productsList,
          price: sumOfCostOfSales,
          time: ioJournalItem.time,
          gameTime: ioJournalItem.gameTime
        })
      })
      .then(() => {
        let counterAccount = this.engine.getNode(to).Account
        return counterAccount.add({
          debit: [{
            amount: sumOfCostOfSales,
            classification: 'Sales',
            counterObject: to
          }],
          credit: [{
            amount: sumOfCostOfSales,
            classification: 'CostOfSales',
            counterObject: to
          }],
          memo: 'Assemble',
          time: ioJournalItem.time,
          gameTime: ioJournalItem.gameTime
        })
      })
      .then(() => {
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  getAssemblableGoods (good) {
    return this.store.state.bom
  }

  getBOM (good) {
    let it = this.getAssemblableGoods().find(item => item.good === good)
    if (it === undefined) {
      throw new Error(`AssemblyDepartment:getBOM() No such good like ${good}`)
    }
    return it.components
  }

  isAvailableForAssemble (name, good, unit) {
    let node = this.engine.getNode(name)
    let inventory = node.Inventory
    if (inventory.getMode() === INVENTORY_MODE.PERIODIC) {
      return true
    }

    let bom = this.getBOM(good)
    for (let component of bom) {
      let hasUnit = inventory.getStorageUnit(component.good)
      let needUnit = component.unit * unit
      if (hasUnit < needUnit) {
        return false
      }
    }
    return true
  }

  getComponentsList (good, unit) {
    let bom = this.getBOM(good)
    let list = []
    for (let item of bom) {
      list.push({
        good: item.good,
        unit: item.unit * unit
      })
    }
    return list
  }

  isReceiver (name) {
    let r = this.store.state.receivers.find(receiver => receiver === name)
    return r !== undefined
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
