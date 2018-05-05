import { EventEmitter } from 'events'
import mongoose from 'mongoose'
import Store from '@/lib/Store'
import Account from '@/components/Account'
import Delivers from '@/components/Delivers'
import Inventory from '@/components/Inventory'
import Orders from '@/components/Orders'

export const NodeEachComponentsScheme = new mongoose.Schema(
  {
    enable: { type: Boolean, default: true },
    options: mongoose.Schema.Types.Mixed,
    id: mongoose.Schema.Types.ObjectId
  },
  { _id: false }
)

export const NodeComponentsScheme = new mongoose.Schema(
  {
    Input: NodeEachComponentsScheme,
    Output: NodeEachComponentsScheme,
    Inventory: NodeEachComponentsScheme,
    BiddingMarketProvider: NodeEachComponentsScheme,
    BiddingMarketReceiver: NodeEachComponentsScheme
  },
  { _id: false }
)

export const NodeScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  components: NodeComponentsScheme
})

export const NodeStore = mongoose.model('NodeStore', NodeScheme)

let nodeId = 0

export function OrderPackage ({ fromNodeName, toNodeName, goodsList }) {
  return {
    fromNodeName: fromNodeName || '',
    toNodeName: toNodeName || '',
    goods: new Map(goodsList),
    inGameTime: 0
  }
}

/**
 * @param {object} packageContent `fromNodeid`, `toNodeid`, `goodsList`.
 */
export function DeliverPackage ({ fromNodeName, toNodeName, goodsList }) {
  return {
    fromNodeName: fromNodeName || '',
    toNodeName: toNodeName || '',
    goods: new Map(goodsList),
    inGameTime: 0
  }
}

export default class Node extends EventEmitter {
  constructor (engine, options) {
    super()
    this.context = {}
    this.actions = {}
    this.options = {
      orderable: true,
      assemblable: true,
      importer: new Map(),
      exporter: new Map(),
      importGoods: new Map(),
      exportGoods: new Map()
    }
    this.nodeId = options.nodeId || nodeId++
    this.nodeName = options.nodeName || 'UnknownNodeName'
  }

  releaseOrder (orderPackage) {
    let context = this.context

    return new Promise((resolve, reject) => {
      this.emit('on-release-order')
    })
  }

  receiveOrder (orderPackage) {
    return new Promise((resolve, reject) => {
      this.emit('on-receive-order')
    })
  }

  import (deliverPackage) {
    return new Promise((resolve, reject) => {
      this.emit('on-import')
    })
  }

  /**
   * Export goods to another node.
   * @param {DeliverPackage} deliverPackage
   */
  export (deliverPackage) {
    return new Promise((resolve, reject) => {
      if (
        deliverPackage.fromNodeName === this.nodeName &&
        this.options.exporter.has(deliverPackage.toNodeName) &&
        this.options.exportGoods
      ) {
        this.emit('on-export')
      }
    })
  }

  /**
   * 計算每日倉儲成本。
   */
  settleDailyAccount () {}

  /**
   * Dump all information to a object.
   */
  dump () {
    return {}
  }

  /**
   * Load from DB.
   */
  load () {
    return new Promise((resolve, reject) => {})
  }
}
