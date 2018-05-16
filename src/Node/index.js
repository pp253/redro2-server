import { EventEmitter } from 'events'
import store from './store'
import Account from '@/components/Account'
import Inventory from '@/components/Inventory'
import IO from '@/components/IO'
import BiddingMarket from '@/components/BiddingMarket'
import BiddingMarketReceiver from '@/components/BiddingMarketReceiver'
import Market from '@/components/Market'
import MarketReceiver from '@/components/MarketReceiver'
import InventoryRegister from '@/components/InventoryRegister'
import AssemblyDepartment from '@/components/AssemblyDepartment'
import { timeout } from '@/lib/utils'

export const COMPONENTS = {
  Inventory: Inventory,
  IO: IO,
  Account: Account,
  BiddingMarket: BiddingMarket,
  BiddingMarketReceiver: BiddingMarketReceiver,
  Market: Market,
  MarketReceiver: MarketReceiver,
  InventoryRegister: InventoryRegister,
  AssemblyDepartment: AssemblyDepartment
}

export default class Node extends EventEmitter {
  constructor () {
    super()
    this.type = 'Node'
    this._loaded = false
  }

  load (engine, options) {
    return new Promise((resolve, reject) => {
      if (this._loaded) {
        throw new Error('Node:load() Node has been loaded before.')
      }
      this._loaded = true

      this.engine = engine
      this.options = options

      let initState = {
        name: options.name,
        components: options.components
      }

      store(initState)
        .then(store => {
          this.store = store

          for (let component of this.store.state.components) {
            if (component.enable === false) {
              continue
            }
            if (!(component.type in COMPONENTS)) {
              throw new Error(`Node:load() Component type ${component.type} is not found.`)
            }
            this[component.type] = new COMPONENTS[component.type]()
          }
          return timeout(100)
        })
        .then(() => {
          let jobSeq = []

          for (let component of this.store.state.components) {
            if (component.enable === false) {
              continue
            }
            let job = this[component.type].load(this, component.options)
            jobSeq.push(job)
          }
          return Promise.all(jobSeq)
        })
        .then(jobSeqResult => {
          return this.store.dispatch('setComponentsId', jobSeqResult)
        })
        .then(() => {
          resolve(this)
        })
        .catch(err => { reject(err) })
    })
  }

  /**
   * This will emit a `on-message` event.
   */
  emitMessage (event) {
    this.emit('on-message', event)
  }

  /**
   * @returns {Object}
   */
  toObject () {
    return this.store.toObject()
  }

  /**
   * @returns {String}
   */
  getName () {
    return this.store.state.name
  }

  /**
   * @returns {ObjectId}
   */
  getId () {
    return this.store.state._id.toHexString()
  }
}
