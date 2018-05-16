import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { MARKET_EVENTS, BiddingMarketEvent, ENGINE_EVENTS } from '@/lib/schema'

export default class Market extends EventEmitter {
  constructor () {
    super()
    this.type = 'Market'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw new Error('Market:load() `node` should be instance of Node.')
      }
      if (this._loaded) {
        throw new Error('Market:load() Node has been loaded before.')
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
        throw new Error('Market:buy() Market seller must from the upstreams of market.')
      }

      // Check for the needed good
      for (let item of marketJournalItem.list) {
        let it = this.getNeededGood(item.good)
        if (it === undefined) {
          throw new Error('Market:buy() Seller can only sell the goods that market needed.')
        }
        if (item.unit > it.left) {
          throw new Error('Market:buy() The market has no more needs of the good.')
        }
        item.unitPrice = it.unitPrice

        // minus the left
        this.store.immediate('SUB_MARKET_NEEDS', {
          good: item.good,
          unit: item.unit
        })
      }

      // Check the goods price
      let price = 0
      for (let item of marketJournalItem.list) {
        item.unitPrice = this.getUnitPrice(item.good)
        price += item.unitPrice * item.unit
      }
      marketJournalItem.price = price

      this.store.save()
      .then(() => {
        return this.engine.getNode(marketJournalItem.from)
          .MarketReceiver.sell(marketJournalItem)
      })
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  getNeeds () {
    return this.store.state.marketNeeds
  }

  setNeeds (marketNeeds) {
    return this.store.commit('SET_MARKET_NEEDS', marketNeeds)
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
      return it.left
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
      this.store.dispatch('setMarketNeeds', marketNews.marketNeeds)
      .then(() => {
        this.emit(MARKET_EVENTS.MARKET_NEWS_PUBLISHED, new BiddingMarketEvent({
          type: MARKET_EVENTS.MARKET_NEWS_PUBLISHED,
          target: this,
          gameTime: engineEvent.gameTime,
          provider: this,
          news: this.getAvailableNews(),
          needs: this.getNeeds()
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

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
