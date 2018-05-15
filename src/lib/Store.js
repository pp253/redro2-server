import EventEmitter from 'events'
import mongoose from 'mongoose'
import _ from 'lodash'

/**
 * let store = new Store()
 * store.load(Model, StoreContent)
 * if StoreContent.id exists, Store will load that from db.
 */
export default class Store extends EventEmitter {
  constructor () {
    super()
    this.state = {}
    this.mutations = {}
    this.actions = {}
    this.getters = {}
    this._loaded = false
  }

  /**
   *
   * store.load(Model, StoreContent)
   * if StoreContent.id exists, Store will load that from db.
   *
   * @param {Model} Model
   * @param {StoreContent} StoreContent
   * @returns {Promise<Store>} Store
   */
  load (Model, StoreContent) {
    return new Promise((resolve, reject) => {
      if (this._loaded === true) {
        throw new Error(`Store:load() Store has been loaded.`)
      }
      if (typeof Model !== 'function') {
        throw new TypeError(`Store:load() Model must be an mongoose.Model.`)
      }
      if (typeof StoreContent !== 'object') {
        throw new TypeError(`Store:load() StoreContent must be an object.`)
      }

      this.mutations = StoreContent.mutations
      this.actions = StoreContent.actions
      this.getters = StoreContent.getters ? this.convertGetters(StoreContent.getters) : this.getters

      if (StoreContent.id && mongoose.Types.ObjectId.isValid(StoreContent.id)) {
        // Load from DB instead of creating a new Store.
        Model.findById(StoreContent.id)
          .exec(state => {
            this.state = state
            this._loaded = true
            resolve(this)
          })
          .catch(err => {
            throw err
          })
      } else {
        // Creating a new Store.
        this.state = new Model(StoreContent.state)
        this.state
          .save()
          .then(state => {
            this.state = state
            this._loaded = true
            resolve(this)
          })
          .catch(err => {
            reject(err)
          })
      }
    })
  }

  /**
   * Commit a mutation.
   *
   * @param {string} mutation
   * @param {any} payload
   * @param {Map<string, any>} options
   *  `save` {Boolean} saves after commit. Defaults to `true`.
   * @returns {Store|Promise<Store>} the store after saving.
   */
  commit (mutation, payload, options) {
    if (typeof mutation !== 'string' || !(mutation in this.mutations)) {
      throw new Error(
          'Store:commit()' + `mutation ${mutation} is not found or not being a string.`
        )
    }
    options = Object.assign({}, { save: true }, options)

    let mutationFunction = this.mutations[mutation]
    mutationFunction(this.state, payload)

    if (options.save === false) {
      return this
    } else {
      return new Promise((resolve, reject) => {
        this.state
          .save()
          .then(state => {
            this.state = state
            resolve(this)
          })
          .catch(err => {
            reject(err)
          })
      })
    }
  }

  /**
   * The same as `commit` but as immidiately.
   */
  immediate (mutation, payload, options) {
    Object.assign({}, options, { save: false })
    return this.commit(mutation, payload, options)
  }

  /**
   * Dispatching an action.
   *
   * @param {string} action
   * @param {any} payload
   * @param {Map<string, any>} options
   * @returns {Promise<Store>} the store after saving.
   */
  dispatch (action, payload, options) {
    return new Promise((resolve, reject) => {
      if (typeof action !== 'string' || !(action in this.actions)) {
        throw new Error(`Store:dispatch() action ${action} is not found or not being a string.`)
      }
      let actionFunction = this.actions[action]
      actionFunction(
        {
          state: this.state,
          getters: this.getters,
          commit: (mutation, payload, options) => {
            options = Object.assign({}, { save: false }, options)
            return this.commit(mutation, payload, options)
          },
          dispatch: this.dispatch
        },
        payload,
        options
      )
        .then(() => {
          return this.state.save()
        })
        .then(state => {
          this.state = state
          resolve(this)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })
  }

  convertGetters (getters) {
    let map = {}
    for (let key in getters) {
      if (typeof getters[key] !== 'function') {
        throw new TypeError('Store:convertGetters() Getters must be functions.')
      }
      Object.defineProperty(map, key, { get: getters[key] })
    }
    return map
  }

  save () {
    return this.state.save()
  }

  toObject () {
    return _.cloneDeep(this.state.toObject())
  }
}
