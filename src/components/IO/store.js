import Store from '@/lib/Store'
import IOModel from './model'

export const STORE_CONTENT = {
  state: {
    enableImport: true,
    importJournal: [],
    availableImporters: [],
    availableImportGoods: [],
    hasImportLimit: false,
    rejectNotAvailableImpoters: true,
    rejectNotAvailableImportGoods: true,

    enableExport: true,
    exportJournal: [],
    availableExporters: [],
    availableExportGoods: [],
    hasExportLimit: false,
    rejectNotAvailableExpoters: true,
    rejectNotAvailableExportGoods: true,

    transportationCost: 100,
    transportationUnitPerBatch: 4
  },
  getters: {},
  mutations: {
    ADD_IMPORT: (state, inputJournalItem) => {
      if (!state.journal) {
        state.journal = []
      }
      state.journal.push(inputJournalItem)
    },
    SET_HAS_IMPORT_LIMIT: (state, payload) => {
      state.hasImportLimit = payload.hasImportLimit
    },
    SET_HAS_EXPORT_LIMIT: (state, payload) => {
      state.hasExportLimit = payload.hasExportLimit
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
