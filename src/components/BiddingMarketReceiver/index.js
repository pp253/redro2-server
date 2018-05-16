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
    this.type = 'BiddingMarketReceiver'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw new Error('BiddingMarketReceiver:load() `node` should be instance of Node.')
      }
      if (this._loaded) {
        throw new Error('BiddingMarketReceiver:load() Node has been loaded before.')
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

        if (this.store.state.enableUpstream && this.store.state.upstreamProvider) {
          this.upstreamProvider = this.engine.getNode(this.store.state.upstreamProvider)

          for (let eventName of [
            BIDDING_EVENTS.BIDDING_RELEASED,
            BIDDING_EVENTS.BIDDING_CANCELED,
            BIDDING_EVENTS.BIDDING_SIGNED,
            BIDDING_EVENTS.BIDDING_CANCELED,
            BIDDING_EVENTS.BIDDING_COMPLETED
          ]) {
            this.upstreamProvider.BiddingMarket.on(eventName, (biddingEvent) => {
              this.node.emitMessage(biddingEvent)
            })
          }
        }
        if (this.store.state.enableDownstream && this.store.state.downstreamProvider) {
          this.downstreamProvider = this.engine.getNode(this.store.state.downstreamProvider)

          for (let eventName of [
            BIDDING_EVENTS.BIDDING_RELEASED,
            BIDDING_EVENTS.BIDDING_CANCELED,
            BIDDING_EVENTS.BIDDING_SIGNED,
            BIDDING_EVENTS.BIDDING_CANCELED,
            BIDDING_EVENTS.BIDDING_COMPLETED
          ]) {
            this.downstreamProvider.BiddingMarket.on(eventName, (biddingEvent) => {
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
    return this.upstreamProvider.BiddingMarket.release(biddingItem)
  }

  cancelToUpstream (biddingStageChange) {
    return this.upstreamProvider.BiddingMarket.cancel(biddingStageChange)
  }

  signToUpstream (biddingStageChange) {
    return this.upstreamProvider.BiddingMarket.sign(biddingStageChange)
  }

  breakoffToUpstream (biddingStageChange) {
    return this.upstreamProvider.BiddingMarket.breakoff(biddingStageChange)
  }

  deliverToUpstream (biddingStageChange) {
    return this.upstreamProvider.BiddingMarket.deliver(biddingStageChange)
  }

  releaseToDownstream (biddingItem) {
    return this.downstreamProvider.BiddingMarket.release(biddingItem)
  }

  cancelToDownstream (biddingStageChange) {
    return this.downstreamProvider.BiddingMarket.cancel(biddingStageChange)
  }

  signToDownstream (biddingStageChange) {
    return this.downstreamProvider.BiddingMarket.sign(biddingStageChange)
  }

  breakoffToDownstream (biddingStageChange) {
    return this.downstreamProvider.BiddingMarket.breakoff(biddingStageChange)
  }

  deliverToDownstream (biddingStageChange) {
    return this.downstreamProvider.BiddingMarket.deliver(biddingStageChange)
  }

  getUpstreamBiddings () {
    if (!this.store.state.enableUpstream) {
      throw new Error('BiddingMarketReceiver:getUpstreamBiddings() Upstream provider is disabled.')
    }
    return this.upstreamProvider.BiddingMarket.getBiddings()
  }

  getUpstreamBiddingById (id) {
    if (!this.store.state.enableUpstream) {
      throw new Error('BiddingMarketReceiver:getUpstreamBiddingById() Upstream provider is disabled.')
    }
    return this.upstreamProvider.BiddingMarket.getBiddingById(id)
  }

  getDownstreamBiddings () {
    if (!this.store.state.enableDownstream) {
      throw new Error('BiddingMarketReceiver:getDownstreamBiddings() Downstream provider is disabled.')
    }
    return this.downstreamProvider.BiddingMarket.getBiddings()
  }

  getDownstreamBiddingById (id) {
    if (!this.store.state.enableDownstream) {
      throw new Error('BiddingMarketReceiver:getDownstreamBiddingById() Downstream provider is disabled.')
    }
    return this.downstreamProvider.BiddingMarket.getBiddingById(id)
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
