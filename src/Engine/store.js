import _ from 'lodash'
import Store from '@/lib/Store'
import EngineModel from './model'
import { ENGINE_STAGE } from '@/lib/schema'

export const STORE_CONTENT = {
  state: {
    name: 'UnknownEngineName',
    nodes: [],
    stage: ENGINE_STAGE.CONSTRUCTED,
    gameTime: {
      day: 0,
      time: 0,
      isWorking: false
    },
    gameDays: 3,
    dayLength: 120,
    permissions: []
  },
  getters: {},
  mutations: {
    ADD_NODE (state, node) {
      if (!state.nodes) {
        state.nodes = []
      }
      state.nodes.push(node)
    },
    SET_NODE_ID (state, payload) {
      state.nodes.find(node => node.name === payload.name).id = payload.id
    },
    SET_NODE_ID_BY_INDEX (state, payload) {
      state.nodes[payload.index].id = payload.id
    },
    SET_STAGE (state, payload) {
      state.stage = payload.stage
    },
    SET_GAME_TIME (state, payload) {
      state.gameTime.day = payload.day
      state.gameTime.time = payload.time
      state.gameTime.isWorking = payload.isWorking
    },
    SET_GAME_DAYS (state, payload) {
      state.gameDays = payload.gameDays
    },
    SET_DAY_LENGTH (state, payload) {
      state.dayLength = payload.dayLength
    }
  },
  actions: {
    setNodesId (context, payload) {
      let index = 0
      for (let node of payload) {
        context.commit('SET_NODE_ID_BY_INDEX', {
          index: index,
          id: node.getId()
        })
        index++
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
  return st.load(EngineModel, content)
}
