import _ from 'lodash'
import Store from '@/lib/Store'
import ServerModel from './model'

export const STORE_CONTENT = {
  state: {
    engines: []
  },
  getters: {},
  mutations: {
    ADD_ENGINE: (state, engineOptions) => {
      state.engines.push(engineOptions)
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
  return st.load(ServerModel, content)
}
