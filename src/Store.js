import EventEmitter from 'events'
import { assertTSNamespaceExportDeclaration } from 'babel-types'

export default class Store extends EventEmitter {
  constructor(store) {
    if (!store) {
      console.error('Store:constructor()', '`store` is required.')
      return
    }

    this.id = store.id
    this.state = store.state
    this.mutations = store.mutations
    this.actions = store.actions
    this.getters = convertGetters(store.getters)
  }

  commit(mutation) {
    return new Promise((resolve, reject) => {
      if (!(mutation in this.mutations)) {
        reject(
          new Error('Store:commit()' + `mutation ${mutation} is not found.`)
        )
        return
      }
      this.mutations[mutation](this.state)
    })
  }

  dispatch(action) {
    return new Promise((resolve, reject) => {
      if (!(action in this.actions)) {
        reject(new Error('Store:dispatch()' + `action ${action} is not found.`))
        return
      }
      this.actions[action]({
        commit: this.commit,
        dispatch: this.dispatch,
        state: this.state,
        getters: this.getters
      })
    })
  }

  convertGetters(getters) {
    let map = {}
    for (let key in getters) {
      if (typeof getters[key] === 'function') {
        console.error('Store:convertGetters()', 'getters must be functions.')
        return
      }
      Object.defineProperty(map, key, { get: getters[key] })
    }
    return map
  }
}
