import _ from 'lodash'
import Store from '@/lib/Store'
import BiddingMarketModel from './model'

export const STORE_CONTENT = {
  state: {
    mode: 'Provider',
    upstreams: [],
    downstreams: [],
    provider: null,
    biddings: [],
    breakoffPaneltyRatio: 1.2,
    breakoffCompensationRatio: 0.5
  },
  getters: {},
  mutations: {
    ADD_BIDDING (state, BiddingItem) {
      state.biddings.push(BiddingItem)
    },
    SET_BIDDING_STAGE (state, payload) {
      let it = state.biddings.find(bidding => bidding._id === payload.id)
      it.stage = payload.stage
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
  return st.load(BiddingMarketModel, content)
}
