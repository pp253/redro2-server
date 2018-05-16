import _ from 'lodash'
import Store from '@/lib/Store'
import InventoryRegisterModel from './model'

export const STORE_CONTENT = {
  state: {
    receivers: [],
    journal: []
  },
  getters: {},
  mutations: {
    ADD_RECEIVER (state, payload) {
      state.receivers.push(payload.receiver)
    },
    ADD_JOURNAL (state, ioJournalItem) {
      state.journal.push(ioJournalItem)
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
  return st.load(InventoryRegisterModel, content)
}
