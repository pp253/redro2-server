import { EventEmitter } from 'events'
import _ from 'lodash'
import {BiddingMarketEvent, BIDDING_EVENTS, BIDDING_ITEM_STAGE, BIDDING_CHAIN, TRANSPORTATION_STATUS, USER_LEVEL} from '@/lib/schema'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'

/**
 * @typedef BiddingStageChange
 * @property {ObjectId} id
 * @property {ObjectId} operator
 * @property {Date} time
 * @property {GameTime} gameTime
 *
 */

export default class BiddingMarket extends EventEmitter {
  constructor () {
    super()
    this.type = 'BiddingMarket'
    this._loaded = false
    this.setMaxListeners(10000)
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

      let state = {
        upstreams: this.options.upstreams || [],
        downstreams: this.options.downstreams || [],
        biddings: this.options.biddings || [],
        breakoffPaneltyRatio: this.options.breakoffPaneltyRatio || 1.2,
        breakoffCompensationRatio: this.options.breakoffCompensationRatio || 0.5,
        transportationTime: this.options.transportationTime || 300,
        transportationStatus: this.options.transportationStatus || TRANSPORTATION_STATUS.DELIVERING
      }
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
   * @param {BiddingItem} biddingItem
   */
  release (biddingItem) {
    return new Promise((resolve, reject) => {
      // check sum of costs of goods is the same as price
      let sumOfCost = 0
      for (let stocksItem of biddingItem.goods) {
        sumOfCost += stocksItem.unit * stocksItem.unitPrice
      }
      biddingItem.price = sumOfCost

      // check the publisher is from the up or down stream
      if (this.isUpstreams(biddingItem.publisher)) {
        biddingItem.publishedFromChain = BIDDING_CHAIN.UPSTREAM
      } else if (this.isDownstreams(biddingItem.publisher)) {
        biddingItem.publishedFromChain = BIDDING_CHAIN.DOWNSTREAM
      } else {
        throw new Error('BiddingMarket:release() publisher should be either one of the upstreams or downstreams.')
      }

      this.store.commit('ADD_BIDDING', biddingItem)
      .then(() => {
        let bi = this.store.state.biddings[this.store.state.biddings.length - 1]
        this.emit(BIDDING_EVENTS.BIDDING_RELEASED, new BiddingMarketEvent({
          type: BIDDING_EVENTS.BIDDING_RELEASED,
          target: this,
          time: bi.time,
          gameTime: bi.gameTime,
          provider: this.node.getName(),
          item: bi,
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {BiddingStageChange} biddingStageChange
   */
  cancel (biddingStageChange) {
    return new Promise((resolve, reject) => {
      if (!biddingStageChange.id || !biddingStageChange.operator) {
        throw new Error('BiddingMarket:cancel() `id` and `operator` is required.')
      }

      let bi = this.getBiddingById(biddingStageChange.id)

      if (bi.stage !== BIDDING_ITEM_STAGE.BIDDING) {
        throw new Error('BiddingMarket:cancel() Bidding item could be canceled only when bidding.')
      }

      if (PRODUCTION && bi.publisher !== biddingStageChange.operator) {
        throw new Error('BiddingMarket:cancel() operator is not the `publisher`.')
      }

      this.store.commit('SET_BIDDING_STAGE', {
        id: biddingStageChange.id,
        stage: BIDDING_ITEM_STAGE.CANCELED
      })
      .then(() => {
        let bi = this.getBiddingById(biddingStageChange.id)

        this.emit(BIDDING_EVENTS.BIDDING_CANCELED, new BiddingMarketEvent({
          type: BIDDING_EVENTS.BIDDING_CANCELED,
          target: this,
          time: biddingStageChange.time || Date.now(),
          gameTime: biddingStageChange.gameTime || this.engine.getGameTime(),
          provider: this.node.getName(),
          item: bi,
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {BiddingStageChange} biddingStageChange
   */
  sign (biddingStageChange) {
    return new Promise((resolve, reject) => {
      if (!biddingStageChange.id || !biddingStageChange.operator) {
        throw new Error('BiddingMarket:sign() `id` and `operator` is required.')
      }

      let bi = this.getBiddingById(biddingStageChange.id)

      if (bi.stage !== BIDDING_ITEM_STAGE.BIDDING) {
        throw new Error('BiddingMarket:sign() Bidding item could be signed only when bidding.')
      }

      if (bi.publishedFromChain === BIDDING_CHAIN.UPSTREAM) {
        if (!this.isDownstreams(biddingStageChange.operator)) {
          throw new Error('BiddingMarket:sign() Signer should be one of downstreams.')
        }
      } else {
        if (!this.isUpstreams(biddingStageChange.operator)) {
          throw new Error('BiddingMarket:sign() Signer should be one of upstreams.')
        }
      }

      this.store.dispatch('setBiddingSign', {
        id: biddingStageChange.id,
        stage: BIDDING_ITEM_STAGE.SIGNED,
        signer: biddingStageChange.operator
      })
      .then(() => {
        let bi = this.getBiddingById(biddingStageChange.id)

        this.emit(BIDDING_EVENTS.BIDDING_SIGNED, new BiddingMarketEvent({
          type: BIDDING_EVENTS.BIDDING_SIGNED,
          target: this,
          time: bi.time,
          gameTime: bi.gameTime,
          provider: this.node.getName(),
          item: bi,
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {BiddingStageChange} BiddingStageChange
   */
  breakoff (BiddingStageChange) {
    return new Promise((resolve, reject) => {
      if (!BiddingStageChange.id || !BiddingStageChange.operator) {
        throw new Error('BiddingMarket:breakoff() `id` and `operator` is required.')
      }

      let bi = this.getBiddingById(BiddingStageChange.id)

      if (bi.stage !== BIDDING_ITEM_STAGE.SIGNED) {
        throw new Error('BiddingMarket:breakoff() Bidding item could be signed only when signed.')
      }

      let breakoffer
      let breakoffeder

      if (BiddingStageChange.operator === bi.publisher) {
        breakoffer = this.engine.getNode(bi.publisher)
        breakoffeder = this.engine.getNode(bi.signer)
      } else if (BiddingStageChange.operator === bi.signer) {
        breakoffer = this.engine.getNode(bi.signer)
        breakoffeder = this.engine.getNode(bi.publisher)
      } else {
        throw new Error('BiddingMarket:breakoff() operator should be either the publisher or signer.')
      }

      let breakoffPaneltyAmount = bi.price * this.store.state.breakoffPaneltyRatio
      let breakoffCompensationAmount = bi.price * this.store.state.breakoffCompensationRatio

      breakoffer.Account.add({
        debit: [{
          amount: breakoffPaneltyAmount,
          classification: 'CounterPartyDefault',
          counterObject: this.node.getName()
        }],
        credit: [{
          amount: breakoffPaneltyAmount,
          classification: 'AccountsPayable',
          counterObject: this.node.getName()
        }],
        memo: 'Breakoff Panelty',
        time: BiddingStageChange.time || Date.now(),
        gameTime: BiddingStageChange.gameTime || this.engine.getGameTime()
      })
      .then(() => {
        return breakoffeder.Account.add({
          debit: [{
            amount: breakoffCompensationAmount,
            classification: 'Cash',
            counterObject: this.node.getName()
          }],
          credit: [{
            amount: breakoffCompensationAmount,
            classification: 'IncomeFromCounterPartyDefault',
            counterObject: this.node.getName()
          }],
          memo: 'Breakoff Compensation',
          time: BiddingStageChange.time || Date.now(),
          gameTime: BiddingStageChange.gameTime || this.engine.getGameTime()
        })
      })
      .then(() => {
        return this.store.commit('SET_BIDDING_STAGE', {
          id: BiddingStageChange.id,
          stage: BIDDING_ITEM_STAGE.BREAKOFF
        })
      })
      .then(() => {
        let bi = this.getBiddingById(BiddingStageChange.id)

        this.emit(BIDDING_EVENTS.BIDDING_BREAKOFF, new BiddingMarketEvent({
          type: BIDDING_EVENTS.BIDDING_BREAKOFF,
          target: this,
          time: bi.time,
          gameTime: bi.gameTime,
          provider: this.node.getName(),
          item: bi,
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /**
   *
   * @param {BiddingStageChange} BiddingStageChange
   */
  deliver (BiddingStageChange) {
    return new Promise((resolve, reject) => {
      if (!BiddingStageChange.id) {
        throw new Error('BiddingMarket:deliver() `id` is required.')
      }

      let bi = this.getBiddingById(BiddingStageChange.id)

      if (bi.stage !== BIDDING_ITEM_STAGE.SIGNED) {
        throw new Error('BiddingMarket:deliver() Bidding item could be signed only when signed.')
      }

      let upstream
      let downstream

      if (bi.publishedFromChain === BIDDING_CHAIN.UPSTREAM) {
        upstream = this.engine.getNode(bi.publisher)
        downstream = this.engine.getNode(bi.signer)
      } else {
        upstream = this.engine.getNode(bi.signer)
        downstream = this.engine.getNode(bi.publisher)
      }

      let ioJournalItem = {
        from: upstream.getName(),
        to: downstream.getName(),
        list: bi.goods,
        price: bi.price,
        transportationTime: this.store.state.transportationTime,
        transportationStatus: this.store.state.transportationStatus,
        memo: 'Purchasing from Bidding Market',
        time: BiddingStageChange.time || Date.now(),
        gameTime: BiddingStageChange.gameTime || this.engine.getGameTime()
      }

      upstream.IO.export(ioJournalItem)
      .then(() => {
        return this.store.commit('SET_BIDDING_STAGE', {
          id: BiddingStageChange.id,
          stage: BIDDING_ITEM_STAGE.COMPLETED
        })
      })
      .then(() => {
        let bi = this.getBiddingById(BiddingStageChange.id)

        this.emit(BIDDING_EVENTS.BIDDING_COMPLETED, new BiddingMarketEvent({
          type: BIDDING_EVENTS.BIDDING_COMPLETED,
          target: this,
          time: bi.time,
          gameTime: bi.gameTime,
          provider: this.node.getName(),
          item: bi,
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  getBiddings () {
    return this.store.state.biddings
  }

  getBiddingById (id) {
    return this.store.state.biddings.find(bidding => bidding._id.equals(id))
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
        return ['BiddingMarket.*']

      case USER_LEVEL.STAFF:
        return [
          'BiddingMarket.release',
          'BiddingMarket.cancel',
          'BiddingMarket.sign',
          'BiddingMarket.breakoff',
          'BiddingMarket.deliver',
          'BiddingMarket.getBiddings',
          'BiddingMarket.getBiddingById',
          'BiddingMarket.isUpstreams',
          'BiddingMarket.isDownstreams'
        ]

      case USER_LEVEL.PLAYER:
      case USER_LEVEL.GUEST:
      default:
        return []
    }
  }

  getListening (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
      case USER_LEVEL.STAFF:
        return [
          BIDDING_EVENTS.BIDDING_RELEASED,
          BIDDING_EVENTS.BIDDING_CANCELED,
          BIDDING_EVENTS.BIDDING_SIGNED,
          BIDDING_EVENTS.BIDDING_BREAKOFF,
          BIDDING_EVENTS.BIDDING_COMPLETED
        ]

      default:
      case USER_LEVEL.PLAYER:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  toObject () {
    return this.store.toObject()
  }

  toMaskedObject () {}

  getId () {
    return this.store.state._id.toHexString()
  }
}
