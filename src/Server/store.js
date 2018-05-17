import _ from 'lodash'
import Store from '@/lib/Store'
import ServerModel from './model'

export const STORE_CONTENT = {
  state: {
    engines: [],
    users: []
  },
  getters: {},
  mutations: {
    ADD_ENGINE (state, engineOptions) {
      state.engines.push(engineOptions)
    },
    ADD_USER (state, user) {
      state.users.push(user)
    },
    CHANGE_USER_LEVEL (state, payload) {
      let user = state.users.find(user => user._id.equals(payload.userId))
      user.level = payload.level
    },
    ADD_USER_ROLE (state, permission) {
      let user = state.users.find(user => user._id.equals(permission.userId))
      user.permissions.push(permission)
    },
    CHANGE_USER_ROLE (state, payload) {
      let user = state.users.find(user => user._id.equals(payload.userId))
      let permission = user.permissions.find(permission => permission._id.equals(payload.engineId))
      permission.teamIndex = payload.teamIndex
      permission.role = payload.role
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
  return st.load(ServerModel, content)
}
