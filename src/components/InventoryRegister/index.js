import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { USER_LEVEL } from '@/lib/schema'

/**
 * @typedef BiddingStageChange
 * @property {ObjectId} id
 * @property {ObjectId} operator
 */

export default class InventoryRegister extends EventEmitter {
  constructor () {
    super()
    this.type = 'InventoryRegister'
    this._loaded = false
    this.setMaxListeners(10000)
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw new Error('InventoryRegister:load() `node` should be instance of Node.')
      }
      if (this._loaded) {
        throw new Error('InventoryRegister:load() Node has been loaded before.')
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
   * @param {IOJournalItem} ioJournalItem
   * @returns {Promise}
   */
  regist (ioJournalItem) {
    return new Promise((resolve, reject) => {
      this.store.commit('ADD_JOURNAL', ioJournalItem)
      .then(() => {
        return this.engine.getNode(ioJournalItem.to).Inventory.regist(ioJournalItem.list)
      })
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  getReceivers () {
    return this.store.state.receivers
  }

  getActions (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
        return ['InventoryRegister.*']

      case USER_LEVEL.STAFF:
        return [
          'InventoryRegister.regist',
          'InventoryRegister.getReceivers'
        ]

      default:
      case USER_LEVEL.PLAYER:
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

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
