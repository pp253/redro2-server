import _ from 'lodash'
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
    ADD_STORAGES: (state, stocksItemList) => {
      if (!state.storage) {
        state.storage = []
      }
      for (let stocksItem of stocksItemList) {
        let good = stocksItem.good
        if (!stocksItem.left) {
          stocksItem.left = stocksItem.unit
        }
        let it = state.storage.find((item) => item.good === good)
        if (it === undefined) {
          state.storage.push({
            good: good,
            unit: 0,
            journal: []
          })
          it = state.storage[state.storage.length - 1]
        }
        it.unit += stocksItem.left
        it.stocks.push(stocksItem)
      }
    },
    /**
     * 不做缺料檢查，使用前應自行檢查。
     */
    TAKE_STORAGES: (state, stocksItemList) => {
      if (!state.storage) {
        state.storage = []
      }
      for (let stocksItem of stocksItemList) {
        let good = stocksItem.good
        let it = state.storage.find((item) => item.good === good)
        it.unit -= stocksItem.unit

        let left = stocksItem.unit
        for (let idx = it.stocks.findIndex(item => item.left > 0); idx >= 0 && idx < it.stocks.length; idx++) {
          let lit = it.stocks[idx]
          if (left > lit.left) {
            left -= lit.left
            lit.left = 0
          } else {
            lit.left -= left
            left = 0
            break
          }
        }
      }
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
  let content = _.defaultsDeep({}, {state: state}, STORE_CONTENT)
  return st.load(InventoryModel, content)
}
