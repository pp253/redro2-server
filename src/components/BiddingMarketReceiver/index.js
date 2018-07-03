import { EventEmitter } from 'events'
import _ from 'lodash'
import { BIDDING_EVENTS, USER_LEVEL } from '@/lib/schema'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { ResponseErrorMsg } from '@/api/response'

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
    this.setMaxListeners(10000)
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw ResponseErrorMsg.NodeNotAnInstanceOfNode()
      }
      if (this._loaded) {
        throw ResponseErrorMsg.BiddingMarketReceiver(node.getName())
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
              this.emit(eventName, biddingEvent)
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
              this.emit(eventName, biddingEvent)
            })
          }
        }

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  releaseToUpstream (biddingItem) {
    if (this.node.Account.isBankrupt()) {
      throw ResponseErrorMsg.BiddingMarketReceiverCannotReleasedWhenBankrupt(this.node.getName())
    }
    return this.upstreamProvider.BiddingMarket.release(biddingItem)
  }

  cancelToUpstream (biddingStageChange) {
    return this.upstreamProvider.BiddingMarket.cancel(biddingStageChange)
  }

  cancelAllToUpstream () {
    return new Promise((resolve, reject) => {
      let jobSeq = Promise.resolve()
      let biddings = this.getUpstreamBiddings()
      for (let bidding of biddings) {
        if (bidding.publisher !== this.node.getName()) {
          continue
        }
        jobSeq.then(() => {
          return this.cancelToUpstream({
            id: bidding._id,
            operator: this.node.getName()
          })
        })
      }
      jobSeq.then((biddingMarket) => { resolve(biddingMarket) })
      .catch(err => { reject(err) })
    })
  }

  signToUpstream (biddingStageChange) {
    if (this.node.Account.isBankrupt()) {
      throw ResponseErrorMsg.BiddingMarketReceiverCannotSignWhenBankrupt(this.node.getName())
    }
    return this.upstreamProvider.BiddingMarket.sign(biddingStageChange)
  }

  breakoffToUpstream (biddingStageChange) {
    return this.upstreamProvider.BiddingMarket.breakoff(biddingStageChange)
  }

  breakoffAllToUpstream () {
    return new Promise((resolve, reject) => {
      let jobSeq = Promise.resolve()
      let biddings = this.getUpstreamBiddings()
      for (let bidding of biddings) {
        if (bidding.publisher !== this.node.getName()) {
          continue
        }
        jobSeq.then(() => {
          return this.breakoffToUpstream({
            id: bidding._id,
            operator: this.node.getName()
          })
        })
      }
      jobSeq.then((biddingMarket) => { resolve(biddingMarket) })
      .catch(err => { reject(err) })
    })
  }

  deliverToUpstream (biddingStageChange) {
    return this.upstreamProvider.BiddingMarket.deliver(biddingStageChange)
  }

  releaseToDownstream (biddingItem) {
    if (this.node.Account.isBankrupt()) {
      throw ResponseErrorMsg.BiddingMarketReceiverCannotReleasedWhenBankrupt(this.node.getName())
    }
    return this.downstreamProvider.BiddingMarket.release(biddingItem)
  }

  cancelToDownstream (biddingStageChange) {
    return this.downstreamProvider.BiddingMarket.cancel(biddingStageChange)
  }

  cancelAllToDownstream () {
    return new Promise((resolve, reject) => {
      let jobSeq = Promise.resolve()
      let biddings = this.getDownstreamBiddings()
      for (let bidding of biddings) {
        if (bidding.publisher !== this.node.getName()) {
          continue
        }
        jobSeq.then(() => {
          return this.cancelToDownstream({
            id: bidding._id,
            operator: this.node.getName()
          })
        })
      }
      jobSeq.then((biddingMarket) => { resolve(biddingMarket) })
      .catch(err => { reject(err) })
    })
  }

  signToDownstream (biddingStageChange) {
    if (this.node.Account.isBankrupt()) {
      throw ResponseErrorMsg.BiddingMarketReceiverCannotSignWhenBankrupt(this.node.getName())
    }
    return this.downstreamProvider.BiddingMarket.sign(biddingStageChange)
  }

  breakoffToDownstream (biddingStageChange) {
    return this.downstreamProvider.BiddingMarket.breakoff(biddingStageChange)
  }

  breakoffAllToDownstream () {
    return new Promise((resolve, reject) => {
      let jobSeq = Promise.resolve()
      let biddings = this.getDownstreamBiddings()
      for (let bidding of biddings) {
        if (bidding.publisher !== this.node.getName()) {
          continue
        }
        jobSeq.then(() => {
          return this.breakoffToDownstream({
            id: bidding._id,
            operator: this.node.getName()
          })
        })
      }
      jobSeq.then((biddingMarket) => { resolve(biddingMarket) })
      .catch(err => { reject(err) })
    })
  }

  deliverToDownstream (biddingStageChange) {
    return this.downstreamProvider.BiddingMarket.deliver(biddingStageChange)
  }

  getUpstreamBiddings () {
    if (!this.store.state.enableUpstream) {
      throw ResponseErrorMsg.BiddingMarketReceiverUpstreamProviderIsDisabled(this.node.getName())
    }
    return this.upstreamProvider.BiddingMarket.getBiddings()
  }

  getUpstreamBiddingById (id) {
    if (!this.store.state.enableUpstream) {
      throw ResponseErrorMsg.BiddingMarketReceiverUpstreamProviderIsDisabled(this.node.getName())
    }
    return this.upstreamProvider.BiddingMarket.getBiddingById(id)
  }

  getDownstreamBiddings () {
    if (!this.store.state.enableDownstream) {
      throw ResponseErrorMsg.BiddingMarketReceiverDownstreamProviderIsDisabled(this.node.getName())
    }
    return this.downstreamProvider.BiddingMarket.getBiddings()
  }

  getDownstreamBiddingById (id) {
    if (!this.store.state.enableDownstream) {
      throw ResponseErrorMsg.BiddingMarketReceiverDownstreamProviderIsDisabled(this.node.getName())
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

  getActions (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
        return ['BiddingMarketReceiver.*']

      case USER_LEVEL.STAFF:
      case USER_LEVEL.PLAYER:
        return [
          'BiddingMarketReceiver.releaseToUpstream',
          'BiddingMarketReceiver.cancelToUpstream',
          'BiddingMarketReceiver.signToUpstream',
          'BiddingMarketReceiver.breakoffToUpstream',
          'BiddingMarketReceiver.deliverToUpstream',
          'BiddingMarketReceiver.releaseToDownstream',
          'BiddingMarketReceiver.cancelToDownstream',
          'BiddingMarketReceiver.signToDownstream',
          'BiddingMarketReceiver.breakoffToDownstream',
          'BiddingMarketReceiver.deliverToDownstream',
          'BiddingMarketReceiver.getUpstreamBiddings',
          'BiddingMarketReceiver.getUpstreamBiddingById',
          'BiddingMarketReceiver.getDownstreamBiddings',
          'BiddingMarketReceiver.getDownstreamBiddingById',
          'BiddingMarketReceiver.isUpstreams',
          'BiddingMarketReceiver.isDownstreams'
        ]

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  getListening (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
      case USER_LEVEL.STAFF:
      case USER_LEVEL.PLAYER:
        return [
          BIDDING_EVENTS.BIDDING_RELEASED,
          BIDDING_EVENTS.BIDDING_CANCELED,
          BIDDING_EVENTS.BIDDING_SIGNED,
          BIDDING_EVENTS.BIDDING_CANCELED,
          BIDDING_EVENTS.BIDDING_COMPLETED
        ]

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  toObject () {
    return this.store.toObject()
  }

  toMaskedObject () {
    let obj = {
      engineId: this.engine.getId(),
      nodeName: this.node.getName()
    }

    if (this.store.state.enableUpstream) {
      let upstreamObject = this.upstreamProvider.BiddingMarket.toObject()
      obj.upstream = {
        enable: this.store.state.enableUpstream,
        provider: this.upstreamProvider.getName(),
        name: this.upstreamProvider.getName(),
        biddings: this.getUpstreamBiddings(),
        breakoffPaneltyRatio: upstreamObject.breakoffPaneltyRatio,
        breakoffCompensationRatio: upstreamObject.breakoffCompensationRatio,
        transportationTime: upstreamObject.transportationTime,
        transportationStatus: upstreamObject.transportationStatus
      }
    } else {
      obj.upstream = {
        enable: false
      }
    }

    if (this.store.state.enableDownstream) {
      let downstreamObject = this.downstreamProvider.BiddingMarket.toObject()
      obj.downstream = {
        enable: this.store.state.enableDownstream,
        provider: this.downstreamProvider.getName(),
        name: this.downstreamProvider.getName(),
        biddings: this.getDownstreamBiddings(),
        breakoffPaneltyRatio: downstreamObject.breakoffPaneltyRatio,
        breakoffCompensationRatio: downstreamObject.breakoffCompensationRatio,
        transportationTime: downstreamObject.transportationTime,
        transportationStatus: downstreamObject.transportationStatus
      }
    } else {
      obj.downstream = {
        enable: false
      }
    }

    return obj
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
