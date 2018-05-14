import _ from 'lodash'
import Store from '@/lib/Store'
import MarketReceiverModel from './model'

export const STORE_CONTENT = {
  state: {
    provider: ''
  },
  getters: {},
  mutations: {
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
  return st.load(MarketReceiverModel, content)
}
