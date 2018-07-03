import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { MARKET_EVENTS, BiddingMarketEvent, ENGINE_EVENTS, USER_LEVEL, MarketEvent } from '@/lib/schema'
import { ResponseErrorMsg } from '@/api/response'

export default class Market extends EventEmitter {
  constructor () {
    super()
    this.type = 'Market'
    this._loaded = false
    this.setMaxListeners(10000)
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw ResponseErrorMsg.NodeNotAnInstanceOfNode()
      }
      if (this._loaded) {
        throw ResponseErrorMsg.MarketHasLoaded(node.getName())
      }
      this._loaded = true

      this.node = node
      this.engine = node.engine
      this.options = _.cloneDeep(options) || {}

      let state = _.cloneDeep(this.options)
      store(state)
      .then((store) => {
        this.store = store

        for (let news of this.store.state.news) {
          this._registNews(news)
        }

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  buy (marketJournalItem) {
    return new Promise((resolve, reject) => {
      // Check from upstreams
      if (!this.isUpstreams(marketJournalItem.from)) {
        throw ResponseErrorMsg.MarketInvalidSeller(this.node.getName())
      }

      // Check for the needed good
      for (let item of marketJournalItem.list) {
        let it = this.getNeededGood(item.good)
        if (it === undefined) {
          throw ResponseErrorMsg.MarketInvalidSellingGoods(this.node.getName())
        }
        if (item.unit > it.unit) {
          throw ResponseErrorMsg.MarketSupplyMoreThanDemand(this.node.getName(), item.good, item.unit, item.unit)
        }
        item.unitPrice = it.unitPrice
      }

      // Check the goods price
      let price = 0
      for (let item of marketJournalItem.list) {
        item.unitPrice = this.getUnitPrice(item.good)
        price += item.unitPrice * item.unit
      }
      marketJournalItem.price = price

      marketJournalItem.time = marketJournalItem.time || Date.now()
      marketJournalItem.gameTime = marketJournalItem.gameTime || this.engine.getGameTime()

      this.store.save()
      .then(() => {
        return this.engine.getNode(marketJournalItem.from)
          .MarketReceiver.sell(marketJournalItem)
      })
      .then(() => {
        for (let item of marketJournalItem.list) {
          // minus the left
          this.store.immediate('SUB_MARKET_NEEDS', {
            good: item.good,
            unit: item.unit
          })
        }
        return this.store.save()
      })
      .then(() => {
        this.emit(MARKET_EVENTS.MARKET_NEEDS_CHANGE, new MarketEvent({
          type: MARKET_EVENTS.MARKET_NEEDS_CHANGE,
          gameTime: this.engine.getGameTime(),
          target: this,
          provider: this.node.getName(),
          needs: this.getNeeds(),
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  getNeeds () {
    return this.store.state.marketNeeds
  }

  setNeeds (marketNeeds) {
    return new Promise((resolve, reject) => {
      this.store.commit('SET_MARKET_NEEDS', marketNeeds)
      .then(() => {
        this.emit(MARKET_EVENTS.MARKET_NEEDS_CHANGE, new MarketEvent({
          type: MARKET_EVENTS.MARKET_NEEDS_CHANGE,
          gameTime: this.engine.getGameTime(),
          target: this,
          provider: this.node.getName(),
          needs: this.getNeeds(),
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  getNeededGood (good) {
    return this.store.state.marketNeeds.find(needs => needs.good === good)
  }

  isNeededGood (good) {
    let it = this.getNeededGood(good)
    if (it === undefined) {
      return false
    } else {
      return true
    }
  }

  getLeftNeedsUnitOfGood (good) {
    let it = this.getNeededGood(good)
    if (it === undefined) {
      return 0
    } else {
      return it.unit
    }
  }

  getUnitPrice (good) {
    let it = this.getNeededGood(good)
    if (it === undefined) {
      return 0
    } else {
      return it.unitPrice
    }
  }

  isUpstreams (name) {
    let it = this.store.state.upstreams.find(upstream => upstream === name)
    if (it === undefined) {
      return false
    } else {
      return true
    }
  }

  addNews (marketNews) {
    return new Promise((resolve, reject) => {
      this.store.commit('ADD_NEWS', marketNews)
      .then(() => {
        this._registNews(marketNews)
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  _registNews (marketNews) {
    let eventName = ENGINE_EVENTS.GAME_DAY_X_TIME_Y(marketNews.releasedGameTime.day, marketNews.releasedGameTime.time)
    this.engine.once(eventName, (engineEvent) => {
      // Set the needs
      this.store.commit('SET_BATCH_MARKET_NEEDS', marketNews.marketNeeds)
      .then(() => {
        this.emit(MARKET_EVENTS.MARKET_NEWS_PUBLISHED, new BiddingMarketEvent({
          type: MARKET_EVENTS.MARKET_NEWS_PUBLISHED,
          target: this,
          provider: this.node.getName(),
          gameTime: engineEvent.gameTime,
          news: this.getAvailableNews(),
          needs: this.getNeeds(),
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))
        this.emit(MARKET_EVENTS.MARKET_NEEDS_CHANGE, new MarketEvent({
          type: MARKET_EVENTS.MARKET_NEEDS_CHANGE,
          target: this,
          provider: this.node.getName(),
          gameTime: engineEvent.gameTime,
          news: this.getAvailableNews(),
          needs: this.getNeeds(),
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))
      })
    })
  }

  editNews (marketNews) {
    return this.store.commit('EDIT_NEWS', marketNews)
  }

  getAvailableNews () {
    let resultList = []
    let newsList = this.store.state.news
    for (let news of newsList) {
      if (this.engine.gameTimeCompare(news.releasedGameTime) === 1) {
        continue
      }
      resultList.push(news)
    }
    return resultList
  }

  getActions (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
        return ['MarketReceiver.*']

      case USER_LEVEL.STAFF:
        return [
          'Market.buy',
          'Market.getNeeds',
          'Market.setNeeds',
          'Market.getNeededGood',
          'Market.isNeededGood',
          'Market.getLeftNeedsUnitOfGood',
          'Market.getUnitPrice',
          'Market.isUpstreams',
          'Market.addNews',
          'Market.editNews',
          'Market.getAvailableNews'
        ]

      case USER_LEVEL.PLAYER:
        return [
          'Market.getNeeds',
          'Market.getNeededGood',
          'Market.isNeededGood',
          'Market.getLeftNeedsUnitOfGood',
          'Market.getUnitPrice',
          'Market.isUpstreams',
          'Market.getAvailableNews'
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
        return [
          MARKET_EVENTS.MARKET_NEEDS_CHANGE,
          MARKET_EVENTS.MARKET_NEWS_PUBLISHED
        ]

      case USER_LEVEL.PLAYER:
        return [
          MARKET_EVENTS.MARKET_NEWS_PUBLISHED
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
    return {
      engineId: this.engine.getId(),
      nodeName: this.node.getName(),

      upstreams: this.store.state.upstreams,
      news: this.store.state.news,
      needs: this.getNeeds()
    }
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
