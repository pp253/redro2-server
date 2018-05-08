import _ from 'lodash'
import Store from '@/lib/Store'
import ServerrModel from './model'

export const STORE_CONTENT = {
  state: {
    name: 'UnknownNodeName',
    components: []
  },
  getters: {},
  mutations: {
    SET_NAME: (state, payload) => {
      state.name = payload.name
    },
    SET_COMPONENT_ID: (state, payload) => {
      let c = state.components.find(component => component.type === payload.type)
      c.id = payload.id
    }
  },
  actions: {
    setComponentsId: (context, payload) => {
      for (let component of payload) {
        context.commit('SET_COMPONENT_ID', {
          type: component.type,
          id: component.getId()
        })
      }
      return Promise.resolve()
    }
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
  return st.load(ServerrModel, content)
}
