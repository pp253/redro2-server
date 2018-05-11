import { EventEmitter } from 'events'
import _ from 'lodash'
import { BIDDING_EVENTS } from '@/lib/schema'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'

/**
 * @typedef BiddingStageChange
 * @property {ObjectId} id
 * @property {ObjectId} operator
 */

export default class BiddingMarketReceiver extends EventEmitter {
  constructor () {
    super()
    this.type = 'BiddingMarket'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw new Error('BiddingMarket:load() `node` should be instance of Node.')
      }
      if (this._loaded) {
        throw new Error('BiddingMarket:load() Node has been loaded before.')
      }
      this._loaded = true

      this.node = node
      this.engine = node.engine
      this.options = _.cloneDeep(options) || {}

      if (typeof this.options.upstreamProvider === 'string') {
        this.options.enableUpstream = true
      }
      if (typeof this.options.downstreamProvider === 'string') {
        this.options.enableDownstream = true
      }

      let state = _.cloneDeep(this.options)
      store(state)
      .then((store) => {
        this.store = store

        if (this.store.state.enableUpstream) {
          this.upstreamProvider = this.engine.getNode(this.store.state.upstreamProvider)

          for (let eventName of [
            BIDDING_EVENTS.BIDDING_RELEASED,
            BIDDING_EVENTS.BIDDING_CANCELED,
            BIDDING_EVENTS.BIDDING_SIGNED,
            BIDDING_EVENTS.BIDDING_CANCELED,
            BIDDING_EVENTS.BIDDING_COMPLETED
          ]) {
            this.upstreamProvider.on(eventName, (biddingEvent) => {
              this.node.emitMessage(biddingEvent)
            })
          }
        }
        if (this.store.state.enableDownstream) {
          this.downstreamProvider = this.engine.getNode(this.store.state.downstreamProvider)

          for (let eventName of [
            BIDDING_EVENTS.BIDDING_RELEASED,
            BIDDING_EVENTS.BIDDING_CANCELED,
            BIDDING_EVENTS.BIDDING_SIGNED,
            BIDDING_EVENTS.BIDDING_CANCELED,
            BIDDING_EVENTS.BIDDING_COMPLETED
          ]) {
            this.downstreamProvider.on(eventName, (biddingEvent) => {
              this.node.emitMessage(biddingEvent)
            })
          }
        }

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  releaseToUpstream (biddingItem) {
    return this.upstreamProvider.release(biddingItem)
  }

  cancelToUpstream (biddingStageChange) {
    return this.upstreamProvider.cancel(biddingStageChange)
  }

  signToUpstream (biddingStageChange) {
    return this.upstreamProvider.sign(biddingStageChange)
  }

  breakoffToUpstream (biddingStageChange) {
    return this.upstreamProvider.cancel(biddingStageChange)
  }

  deliverToUpstream (biddingStageChange) {
    return this.upstreamProvider.deliver(biddingStageChange)
  }

  releaseToDownstream (biddingItem) {
    return this.downstreamProvider.release(biddingItem)
  }

  cancelToDownstream (biddingStageChange) {
    return this.downstreamProvider.cancel(biddingStageChange)
  }

  signToDownstream (biddingStageChange) {
    return this.downstreamProvider.sign(biddingStageChange)
  }

  breakoffToDownstream (biddingStageChange) {
    return this.downstreamProvider.cancel(biddingStageChange)
  }

  deliverToDownstream (biddingStageChange) {
    return this.downstreamProvider.deliver(biddingStageChange)
  }

  getUpstreamBiddingById (id) {
    if (!this.store.state.enableUpstream) {
      throw new Error('BiddingMarketReceiver:getUpstreamBiddingById() Upstream provider is disabled.')
    }
    return this.engine.getNode(this.store.state.upstreamProvider).getBiddingById(id)
  }

  getDownstreamBiddingById (id) {
    if (!this.store.state.enableDownstream) {
      throw new Error('BiddingMarketReceiver:getDownstreamBiddingById() Downstream provider is disabled.')
    }
    return this.engine.getNode(this.store.state.downstreamProvider).getBiddingById(id)
  }

  isUpstreams (name) {
    let r = this.store.state.upstreams.find(counterName => counterName === name)
    return r !== undefined
  }

  isDownstreams (name) {
    let r = this.store.state.downstreams.find(counterName => counterName === name)
    return r !== undefined
  }

  toObject () {
    return this.store.toObject()
  }

  toMaskedObject () {}

  getId () {
    return this.store.state._id.toHexString()
  }
}
