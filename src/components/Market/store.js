import _ from 'lodash'
import Store from '@/lib/Store'
import MarketModel from './model'

export const STORE_CONTENT = {
  state: {
    upstreams: [],
    marketNeeds: [],
    news: [],
    accumulateNeeds: false
  },
  getters: {},
  mutations: {
    ADD_NEWS (state, marketNews) {
      state.news.push(marketNews)
    },
    SET_MARKET_NEEDS (state, marketNeeds) {
      let it = state.marketNeeds.find(needs => needs.good === marketNeeds.good)
      if (it === undefined) {
        state.marketNeeds.push(marketNeeds)
      } else {
        if (state.accumulateNeeds === true) {
          it.needs += marketNeeds.needs
          it.left += marketNeeds.needs
          it.price = marketNeeds.price
        } else {
          it.needs = marketNeeds.needs
          it.left = marketNeeds.needs
          it.price = marketNeeds.price
        }
      }
    },
    SET_ACCUMULATE_NEEDS (state, payload) {
      state.accumulateNeeds = payload.accumulateNeeds
    }
  },
  actions: {
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
