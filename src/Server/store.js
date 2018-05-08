import Store from '@/lib/Store'
import ServerrModel from './model'

export const STORE_CONTENT = {
  state: {
    name: 'UnknownNodeName',
    components: []
  },
  getters: {},
  mutations: {
    CHANGE_NAME: (state, payload) => {
      state.name = payload.name
    },
    CHANGE_COMPONENT_ID: (state, payload) => {
      let c = state.components.find(component => component.type === payload.type)
      c.id = payload.id
    }
  },
  actions: {
    changeComponentsId: (context, payload) => {
      for (let component of payload) {
        context.commit('CHANGE_COMPONENT_ID', {
          type: component.type,
          id: component.store.state._id
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
  let content = Object.assign({}, STORE_CONTENT, {state: state})
  return st.load(ServerrModel, content)
}
