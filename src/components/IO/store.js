import _ from 'lodash'
import Store from '@/lib/Store'
import IOModel from './model'
import * as schema from '@/lib/schema'

export const STORE_CONTENT = {
  state: {
    enableImport: true,
    importJournal: [],
    availableImportGoods: [],
    hasImportLimit: false,
    rejectNotAvailableImportGoods: true,

    enableExport: true,
    exportJournal: [],
    availableExportGoods: [],
    hasExportLimit: false,
    rejectNotAvailableExportGoods: true,

    transportationCost: 100,
    batchSize: 4
  },
  getters: {},
  mutations: {
    ADD_IMPORT (state, ioJournalItem) {
      if (!state.importJournal) {
        state.importJournal = []
      }
      state.importJournal.push(ioJournalItem)
    },
    COMPLETE_IMPORT (state, payload) {
      let iji = state.importJournal.find(item => item._id.equals(payload.id))
      iji.transportationStatus = schema.TRANSPORTATION_STATUS.COMPLETED
    },
    ADD_EXPORT (state, ioJournalItem) {
      if (!state.exportJournal) {
        state.exportJournal = []
      }
      state.exportJournal.push(ioJournalItem)
    },
    COMPLETE_EXPORT (state, payload) {
      let iji = state.exportJournal.find(item => item._id.equals(payload.id))
      iji.transportationStatus = schema.TRANSPORTATION_STATUS.COMPLETED
    },
    SET_HAS_IMPORT_LIMIT (state, payload) {
      state.hasImportLimit = payload.hasImportLimit
    },
    SET_HAS_EXPORT_LIMIT (state, payload) {
      state.hasExportLimit = payload.hasExportLimit
    },
    SUB_IMPORT_LEFT (state, payload) {
      let it = state.availableImportGoods.find(good => good.good === payload.good)
      if (!('left' in it)) {
        it.left = it.limit
      }
      it.left -= payload.unit
    },
    SUB_EXPORT_LEFT (state, payload) {
      let it = state.availableExportGoods.find(good => good.good === payload.good)
      if (!('left' in it)) {
        it.left = it.limit
      }
      it.left -= payload.unit
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
  return st.load(IOModel, content)
}
