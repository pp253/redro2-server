import _ from 'lodash'
import Store from '@/lib/Store'
import MarketModel from './model'

export const STORE_CONTENT = {
  state: {
    upstreams: [],
    marketNeeds: [],
    news: [],
    accumulateNeeds: false,
    journal: []
  },
  getters: {},
  mutations: {
    ADD_NEWS (state, marketNews) {
      state.news.push(marketNews)
    },
    EDIT_NEWS (state, marketNews) {
      let news = state.news.find(news => news._id.equals(marketNews.id))
      news.title = marketNews.title || news.title
      news.content = marketNews.content || news.content
      news.releasedGameTime = marketNews.releasedGameTime || news.releasedGameTime
      news.marketNeeds = marketNews.marketNeeds || news.marketNeeds
    },
    SET_MARKET_NEEDS (state, marketNeeds) {
      let it = state.marketNeeds.find(needs => needs.good === marketNeeds.good)
      if (it === undefined) {
        state.marketNeeds.push(marketNeeds)
      } else {
        if (state.accumulateNeeds === true) {
          it.needs += marketNeeds.needs
          it.price = marketNeeds.price
        } else {
          it.needs = marketNeeds.needs
          it.price = marketNeeds.price
        }
      }
    },
    SET_BATCH_MARKET_NEEDS (state, marketNeedsList) {
      state.marketNeeds = marketNeedsList.slice()
    },
    SUB_MARKET_NEEDS (state, marketNeeds) {
      let it = state.marketNeeds.find(needs => needs.good === marketNeeds.good)
      it.unit = parseInt(it.unit - marketNeeds.unit)
    },
    SET_ACCUMULATE_NEEDS (state, payload) {
      state.accumulateNeeds = payload.accumulateNeeds
    },
    ADD_JOURNAL (state, marketJournalItem) {
      state.journal.push(marketJournalItem)
    }
  },
  actions: {
    setMarketNeeds (context, marketNeedsList) {
      return new Promise((resolve, reject) => {
        for (let needs of marketNeedsList) {
          context.commit('SET_MARKET_NEEDS', needs)
        }
        resolve()
      })
    }
  }
}

/**
 * Load store.
 * @param {object} state
 * @returns {Promise<Store>} Store
 */
export default function store (state) {
  let st = new Store()
  let content = _.defaultsDeep({}, {state: state}, STORE_CONTENT)
  return st.load(MarketModel, content)
}
