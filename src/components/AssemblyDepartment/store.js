import _ from 'lodash'
import Store from '@/lib/Store'
import AssemblyDepartmentModel from './model'
import * as schema from '@/lib/schema'

export const STORE_CONTENT = {
  state: {
    receivers: [],
    bom: []
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
  return st.load(AssemblyDepartmentModel, content)
}
