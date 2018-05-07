import Store from '@/lib/Store'
import IOModel from './model'

export const STORE_CONTENT = {
  state: {
    journal: [],
    availableImporters: [],
    availableImportGoods: [],
    hasImportLimit: false,
    rejectNotAvailableImpoters: true,
    rejectNotAvailableGoods: true
  },
  getters: {},
  mutations: {
    ADD_INPUT: (state, inputJournalItem) => {
      if (!state.journal) {
        state.journal = []
      }
      state.journal.push(inputJournalItem)
    },
    SET_HAS_IMPORT_LIMIT: (state, payload) => {
      state.hasImportLimit = payload.hasImportLimit
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
  let content = Object.assign({}, STORE_CONTENT, {state: state})
  return st.load(IOModel, content)
}
