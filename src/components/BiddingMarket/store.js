import _ from 'lodash'
import Store from '@/lib/Store'
import BiddingMarketModel from './model'
import * as schema from '@/lib/schema'

export const STORE_CONTENT = {
  state: {
    mode: 'Provider',
    upstreams: [],
    downstreams: [],
    biddings: [],
    breakoffPaneltyRatio: 1.2,
    breakoffCompensationRatio: 0.5,
    transportationTime: 300,
    transportationStatus: schema.TRANSPORTATION_STATUS.DELIVERING
  },
  getters: {},
  mutations: {
    ADD_BIDDING (state, BiddingItem) {
      state.biddings.push(BiddingItem)
    },
    SET_BIDDING_STAGE (state, payload) {
      let it = state.biddings.find(bidding => bidding._id.equals(payload.id))
      it.stage = payload.stage
    },
    SET_BIDDING_SIGNER (state, payload) {
      let it = state.biddings.find(bidding => bidding._id.equals(payload.id))
      it.signer = payload.signer
    }
  },
  actions: {
    setBiddingSign (context, payload) {
      context.commit('SET_BIDDING_STAGE', payload)
      context.commit('SET_BIDDING_SIGNER', payload)
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
  return st.load(BiddingMarketModel, content)
}
