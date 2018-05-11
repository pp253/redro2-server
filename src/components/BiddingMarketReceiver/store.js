import _ from 'lodash'
import Store from '@/lib/Store'
import BiddingMarketReceiverModel from './model'

export const STORE_CONTENT = {
  state: {
    enableUpstream: false,
    upstreamProvider: null,
    enableDownstream: false,
    downstreamProvider: null
  },
  getters: {},
  mutations: {
    SET_UPSTREAM_PROVIDER (state, payload) {
      state.enableUpstream = true
      state.upstreamProvider = payload.upstreamProvider
    },
    SET_DOWNSTREAM_PROVIDER (state, payload) {
      state.enableDownstream = true
      state.downstreamProvider = payload.downstreamProvider
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
  return st.load(BiddingMarketReceiverModel, content)
}
