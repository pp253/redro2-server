import Store from '@/lib/Store'
import InventoryModel from './model'

export const STORE_CONTENT = {
  state: {
    storage: [],
    storageCost: [],
    hasStorageCost: true
  },
  getters: {},
  mutations: {
    SET_STORAGE_COST: (state, storageCostItem) => {
      if (!state.storageCost) {
        state.storageCost = []
      }
      let it = state.storageCost.find((item) => item.good === storageCostItem.good)
      if (it === undefined) {
        state.storageCost.push(storageCostItem)
      } else {
        it.cost = storageCostItem.cost
      }
    },
    /**
     * 不做缺料檢查，使用前應自行檢查。
     */
    ADD_STORAGE: (state, storageGoodJournalItem) => {
      if (!state.storage) {
        state.storage = []
      }
      let good = storageGoodJournalItem.good
      let it = state.storage.find((item) => item.good === good)
      if (it === undefined) {
        state.storage.push({
          good: good,
          unit: 0,
          journal: []
        })
        it = state.storage[state.storage.length - 1]
      }
      it.unit += storageGoodJournalItem.unit
      it.journal.push(storageGoodJournalItem)
    },
    SET_HAS_STORAGE_COST: (state, payload) => {
      state.hasStorageCost = payload.hasStorageCost
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
  return st.load(InventoryModel, content)
}
