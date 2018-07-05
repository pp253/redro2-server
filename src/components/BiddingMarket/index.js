import { EventEmitter } from 'events'
import _ from 'lodash'
import {BiddingMarketEvent, BIDDING_EVENTS, BIDDING_ITEM_STAGE, BIDDING_CHAIN, TRANSPORTATION_STATUS, USER_LEVEL, ENGINE_EVENTS} from '@/lib/schema'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { ResponseErrorMsg } from '@/api/response'

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
        throw ResponseErrorMsg.NodeNotAnInstanceOfNode()
      }
      if (this._loaded) {
        throw ResponseErrorMsg.BiddingMarketHasLoaded(node.getName())
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
        transportationStatus: this.options.transportationStatus || TRANSPORTATION_STATUS.DELIVERING,
        defaultTimeLimit: this.options.defaultTimeLimit || 600
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
        stocksItem.unit = parseInt(stocksItem.unit)
        stocksItem.unitPrice = parseInt(stocksItem.unitPrice)
        sumOfCost += stocksItem.unit * stocksItem.unitPrice
      }
      biddingItem.price = sumOfCost

      // check the publisher is from the up or down stream
      if (this.isUpstreams(biddingItem.publisher)) {
        biddingItem.publishedFromChain = BIDDING_CHAIN.UPSTREAM
      } else if (this.isDownstreams(biddingItem.publisher)) {
        biddingItem.publishedFromChain = BIDDING_CHAIN.DOWNSTREAM
      } else {
        throw ResponseErrorMsg.BiddingMarketInvalidPublisher(this.node.getName())
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
        throw ResponseErrorMsg.BiddingMarketInvalidIdOrOperator(this.node.getName())
      }

      let bi = this.getBiddingById(biddingStageChange.id)

      if (bi.stage !== BIDDING_ITEM_STAGE.BIDDING) {
        throw ResponseErrorMsg.BiddingMarketCanceledWrongStage(this.node.getName())
      }

      if (PRODUCTION && bi.publisher !== biddingStageChange.operator) {
        throw ResponseErrorMsg.BiddingMarketOperatorNotPublisher(this.node.getName())
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
        throw ResponseErrorMsg.BiddingMarketInvalidIdOrOperator(this.node.getName())
      }

      let bi = this.getBiddingById(biddingStageChange.id)

      if (bi.stage !== BIDDING_ITEM_STAGE.BIDDING) {
        throw ResponseErrorMsg.BiddingMarketSignedWrongStage(this.node.getName())
      }

      if (bi.publishedFromChain === BIDDING_CHAIN.UPSTREAM) {
        if (!this.isDownstreams(biddingStageChange.operator)) {
          throw ResponseErrorMsg.BiddingMarketSignerNotDownstream(this.node.getName())
        }
      } else {
        if (!this.isUpstreams(biddingStageChange.operator)) {
          throw ResponseErrorMsg.BiddingMarketSignerNotUpstream(this.node.getName())
        }
      }

      this.store.commit('SET_BIDDING_SIGN', {
        id: biddingStageChange.id,
        stage: BIDDING_ITEM_STAGE.SIGNED,
        signer: biddingStageChange.operator,
        signedGameTime: this.engine.getGameTime()
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

        let bid = bi._id
        let signer = bi.signer
        let gta = this.engine.gameTimeAdd(bi.timeLimit)
        this.engine.on(ENGINE_EVENTS.GAME_DAY_X_TIME_Y(gta.day, gta.time), () => {
          let biddingItem = this.getBiddingById(bid)
          if (biddingItem.stage !== BIDDING_ITEM_STAGE.SIGNED) {
            return
          }
          this.breakoff({
            id: bid,
            operator: signer
          })
        })

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
        throw ResponseErrorMsg.BiddingMarketInvalidIdOrOperator(this.node.getName())
      }

      let bi = this.getBiddingById(BiddingStageChange.id)

      if (bi.stage !== BIDDING_ITEM_STAGE.SIGNED) {
        throw ResponseErrorMsg.BiddingMarketBreakoffWrongStage(this.node.getName())
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
        throw ResponseErrorMsg.BiddingMarketOperatorNotPublisherNorSigner(this.node.getName())
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
        return this.store.commit('SET_BIDDING_BREAKOFF', {
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
        throw ResponseErrorMsg.BiddingMarketOperatorInvalidId(this.node.getName())
      }

      let bi = this.getBiddingById(BiddingStageChange.id)

      if (bi.stage !== BIDDING_ITEM_STAGE.SIGNED) {
        throw ResponseErrorMsg.BiddingMarketDeliveredWrongStage(this.node.getName())
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
        memo: bi._id,
        time: BiddingStageChange.time || Date.now(),
        gameTime: BiddingStageChange.gameTime || this.engine.getGameTime()
      }

      upstream.IO.export(ioJournalItem)
      .then(() => {
        return this.store.commit('SET_BIDDING_DELIVER', {
          id: BiddingStageChange.id,
          stage: BIDDING_ITEM_STAGE.COMPLETED,
          deliveredGameTime: this.engine.getGameTime()
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

  toMaskedObject () {
    return this.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
