import { EventEmitter } from 'events'
import store from './store'
import Account from '@/components/Account'
import Inventory from '@/components/Inventory'
import Input from '@/components/Input'

export default class Node extends EventEmitter {
  constructor () {
    super()
    this.type = 'Node'
    this._loaded = false
  }

  load (engine, options) {
    return new Promise((resolve, reject) => {
      if (this._loaded) {
        throw new Error('Node:load() Node has been loaded before.')
      }
      this._loaded = true

      this.engine = engine
      this.options = options

      let initState = {
        name: options.name,
        components: options.components
      }

      store(initState)
        .then(store => {
          this.store = store
          let jobSeq = []

          for (let componentName in this.store.state.components.toObject()) {
            if (!this.store.state.components[componentName] ||
            !this.store.state.components[componentName].enable) {
              continue
            }

            this[componentName] = new Account() // TODO
            let job = this[componentName].load(this, this.store.state.components[componentName].options)
            jobSeq.push(job)
          }

          return Promise.all(jobSeq)
        })
        .then(jobSeqResult => {
          return this.store.dispatch('changeComponentsId', jobSeqResult)
        })
        .then(() => {
          resolve(this)
        })
        .catch(err => { reject(err) })
    })
  }

  toObject () {
    return this.store.toObject()
  }
}
