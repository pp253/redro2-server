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
import { USER_LEVEL, ENGINE_EVENTS, EngineEvent } from '@/lib/schema'

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
    this.setMaxListeners(10000)
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

          if (this.store.state.workers > 0) {
            this.engine.on(ENGINE_EVENTS.GAME_OFFWORK, (engineEvent) => {
              let totalWage = this.store.state.workers * this.store.state.wage
              this.node.Account.add({
                debit: [{
                  amount: totalWage,
                  classification: 'SalaryAndWages'
                }],
                credit: [{
                  amount: totalWage,
                  classification: 'Cash'
                }],
                memo: 'Workers Wage',
                time: engineEvent.gameTime,
                gameTime: engineEvent.time
              })
            })
          }

          for (let component of this.store.state.components) {
            if (component.enable === false) {
              continue
            }
            if (!(component.type in COMPONENTS)) {
              throw new Error(`Node:load() Component type ${component.type} is not found.`)
            }
            this[component.type] = new COMPONENTS[component.type]()

            // listen
            let listening = this[component.type].getListening(USER_LEVEL.ADMIN)
            for (let eventName of listening) {
              this[component.type].on(eventName, (event) => {
                this.emit(eventName, event)
              })
            }
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
   * @returns {String}
   */
  getName () {
    return this.store.state.name
  }

  getComponentsActions (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
        return ['*']

      case USER_LEVEL.STAFF:
      case USER_LEVEL.PLAYER:
        let actions = []
        for (let component of this.store.state.components) {
          if (component.enable === false) {
            continue
          }
          actions = actions.concat(this[component.type].getActions(level))
        }
        return actions

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  getComponentsListening (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
      case USER_LEVEL.STAFF:
      case USER_LEVEL.PLAYER:
        let listening = []
        for (let component of this.store.state.components) {
          if (component.enable === false) {
            continue
          }
          listening = listening.concat(this[component.type].getListening(level))
        }
        return listening

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  getActions (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
        return ['*']

      case USER_LEVEL.STAFF:
      case USER_LEVEL.PLAYER:
        return [
          'getName'
        ]

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  getListening (level) {
    switch (level) {
      default:
      case USER_LEVEL.ADMIN:
      case USER_LEVEL.STAFF:
      case USER_LEVEL.PLAYER:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  /**
   * @returns {Object}
   */
  toObject () {
    return this.store.toObject()
  }

  /**
   * @returns {ObjectId}
   */
  getId () {
    return this.store.state._id.toHexString()
  }
}
