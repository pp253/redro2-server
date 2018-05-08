import Store from '@/lib/Store'
import EngineModel from './model'
import * as schema from '@/lib/schema'

export const STORE_CONTENT = {
  state: {
    nodes: [],
    stage: schema.ENGINE_STAGE.CONSTRUCTED,
    gameTime: {
      day: 0,
      time: 0,
      isWorking: false
    },
    gameDays: 3,
    dayLength: 120
  },
  getters: {},
  mutations: {
    ADD_NODE: (state, node) => {
      if (!state.nodes) {
        state.nodes = []
      }
      state.nodes.push(node)
    },
    SET_NODE_ID: (state, payload) => {
      state.nodes.find(node => node.name === payload.name).id = payload.id
    },
    SET_STAGE: (state, payload) => {
      state.stage = payload.stage
    },
    SET_GAME_TIME: (state, payload) => {
      state.gameTime.day = payload.day
      state.gameTime.time = payload.time
      state.gameTime.isWorking = payload.isWorking
    },
    SET_GAME_DAYS: (state, payload) => {
      state.gameDays = payload.gameDays
    },
    SET_DAY_LENGTH: (state, payload) => {
      state.dayLength = payload.dayLength
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
  return st.load(EngineModel, content)
}
