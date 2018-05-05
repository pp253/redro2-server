import Store from '@/lib/Store'
import NodeModel from './model'

export const STORE_CONTENT = {
  state: {
    name: 'UnknownNodeName',
    components: {
      Input: { enable: true },
      Output: { enable: true },
      Account: { enable: true },
      Inventory: { enable: true }
    }
  },
  getters: {},
  mutations: {
    CHANGE_NAME: (state, payload) => {
      state.name = payload.name
    },
    CHANGE_COMPONENT_ID: (state, payload) => {
      if (!payload || !payload.componentName || !(payload.componentName in state.components)) {
        throw new Error(
          'Node.store Payload is not exist, or payload.componentName is not in the state.components'
        )
      }
      state.components[payload.componentName].id = payload.id
    }
  },
  actions: {
    changeComponentsId: (context, payload) => {
      for (let component of payload) {
        context.commit('CHANGE_COMPONENT_ID', {
          componentName: component.type,
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
  return st.load(NodeModel, content)
}
