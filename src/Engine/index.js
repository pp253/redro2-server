import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Server from '@/Server'
import Node from '@/Node'
import { timeout, PRODUCTION } from '@/lib/utils'
import { ENGINE_EVENTS, ENGINE_STAGE, EngineEvent } from '@/lib/schema'

export default class Engine extends EventEmitter {
  constructor (server, options) {
    super()
    this.type = 'Engine'
    this._loaded = false
    this._timer = {
      startTime: 0,
      timerId: null
    }

    /**
     * @type {Map<String, Node>}
     */
    this.nodes = new Map()
  }

  load (server, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(server instanceof Server)) {
        throw new Error('Engine:load() `server` should be instance of Server.')
      }
      if (this._loaded) {
        throw new Error('Engine:load() Engine has been loaded before.')
      }
      this._loaded = true

      this.server = server
      this.options = _.cloneDeep(options) || {}

      let state = this.options

      store(state)
      .then((store) => {
        this.store = store

        let jobSeq = []
        for (let nodeOptions of this.store.state.nodes) {
          let newNode = new Node()
          let job = newNode.load(this, nodeOptions)
          this.nodes.set(nodeOptions.name, newNode)
          jobSeq.push(job)
        }
        return Promise.all(jobSeq)
      })
      .then(jobSeqResults => {
        return this.store.dispatch('setNodesId', jobSeqResults)
      })
      .then(() => {
        resolve(this)
      })
      .catch(err => {
        reject(err)
      })
    })
  }

  nextStage () {
    return new Promise((resolve, reject) => {
      let ns = ENGINE_STAGE.CONSTRUCTED
      switch (this.store.state.stage) {
        case ENGINE_STAGE.CONSTRUCTED:
          ns = ENGINE_STAGE.PREPARE
          break
        case ENGINE_STAGE.PREPARE:
          ns = ENGINE_STAGE.READY
          break
        case ENGINE_STAGE.READY:
          ns = ENGINE_STAGE.START
          break
        case ENGINE_STAGE.START:
          ns = ENGINE_STAGE.FINAL
          break
        case ENGINE_STAGE.FINAL:
          ns = ENGINE_STAGE.END
          break
        default:
          throw new Error('Engine:nextStage() Stage is unknown.')
      }

      this.store.commit('SET_STAGE', {stage: ns})
      .then(() => {
        this.emit(ENGINE_EVENTS.GAME_STAGE_CHANGE,
          this._newEngineEvent(ENGINE_EVENTS.GAME_STAGE_CHANGE))

        if (ns === ENGINE_STAGE.START) {
          this.nextDay().then(() => { resolve(this) })
        }

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  nextDay () {
    return new Promise((resolve, reject) => {
      if (this.getStage() !== ENGINE_STAGE.START) {
        throw new Error('Engine:nextDay() nextDay() can only operate during `START` stage.')
      }
      if (this.getGameTime().isWorking === true) {
        throw new Error('Engine:nextDay() nextDay() can only operate during off work.')
      }
      if (this.getGameTime().day === this.store.state.gameDays) {
        throw new Error('Engine:nextDay() The game has reach its day length limit.')
      }

      this.store.commit('SET_GAME_TIME', {
        day: this.getGameTime().day + 1,
        time: 0,
        isWorking: true
      })
      .then(() => {
        this.emit(ENGINE_EVENTS.GAME_DAY_CHANGE,
          this._newEngineEvent(ENGINE_EVENTS.GAME_DAY_CHANGE))
        this.emit(ENGINE_EVENTS.GAME_ISWORKING_CHANGE,
          this._newEngineEvent(ENGINE_EVENTS.GAME_ISWORKING_CHANGE))
        this.emit(ENGINE_EVENTS.GAME_ONWORK,
          this._newEngineEvent(ENGINE_EVENTS.GAME_ONWORK))

        this.startTicking()

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  startTicking () {
    this.emit(ENGINE_EVENTS.GAME_TIME_CHANGE,
      this._newEngineEvent(ENGINE_EVENTS.GAME_TIME_CHANGE))
    let eventName = ENGINE_EVENTS.GAME_DAY_X_TIME_Y(this.getGameTime().day, 0)
    this.emit(eventName, this._newEngineEvent(eventName))
    console.log('TickingStart!', `day:`, this.getGameTime().day)

    this._timer.startTime = Date.now()

    timeout(1000)
    .then(() => { this._nextTick() })
  }

  _nextTick () {
    this.emit(ENGINE_EVENTS.GAME_TIME_CHANGE,
      this._newEngineEvent(ENGINE_EVENTS.GAME_TIME_CHANGE))
    let gameTime = this.getGameTime()
    let nextTime = gameTime.time + 1
    let eventName = ENGINE_EVENTS.GAME_DAY_X_TIME_Y(gameTime.day, nextTime)
    this.emit(eventName, this._newEngineEvent(eventName))

    this.store.commit('SET_GAME_TIME', {
      day: gameTime.day,
      time: nextTime,
      isWorking: true
    })
    .then(() => {
      let now = Date.now()
      let adjustedNextTickMS = (this._timer.startTime + nextTime * 1000) - now
      console.log('Ticking!', `day:`, gameTime.day, `time:`, nextTime, `adjust:`, adjustedNextTickMS)
      if (nextTime === this.store.state.dayLength - 1) {
        timeout(adjustedNextTickMS > 0 ? adjustedNextTickMS : 0)
        .then(() => { this._nextTickToOffWork() })
      } else {
        timeout(adjustedNextTickMS > 0 ? adjustedNextTickMS : 0)
        .then(() => { this._nextTick() })
      }
    })
  }

  _nextTickToOffWork () {
    this.emit(ENGINE_EVENTS.GAME_TIME_CHANGE,
      this._newEngineEvent(ENGINE_EVENTS.GAME_TIME_CHANGE))
    this.emit(ENGINE_EVENTS.GAME_ISWORKING_CHANGE,
      this._newEngineEvent(ENGINE_EVENTS.GAME_ISWORKING_CHANGE))
    this.emit(ENGINE_EVENTS.GAME_OFFWORK,
      this._newEngineEvent(ENGINE_EVENTS.GAME_OFFWORK))
    let gameTime = this.getGameTime()
    let nextTime = gameTime.time + 1
    let eventName = ENGINE_EVENTS.GAME_DAY_X_TIME_Y(gameTime.day, nextTime)
    this.emit(eventName, this._newEngineEvent(eventName))
    console.log('TickingToOffWork!', `day:`, gameTime.day, `time:`, nextTime)

    this.store.commit('SET_GAME_TIME', {
      day: gameTime.day,
      time: nextTime,
      isWorking: false
    })
    .then(() => {
      if (gameTime.day === this.store.state.gameDays) {
        this.nextStage()
      }
    })
  }

  remove () {}
  pause () {}
  resume () {}

  getGameTime () {
    return this.store.state.gameTime
  }

  /**
   * gameTimeAdd(GameTime, diff)
   * gameTimeAdd(diff)
   *
   * @param {GameTime} gameTime
   * @param {Number} diff
   */
  gameTimeAdd (gameTime, diff = 0) {
    if (typeof gameTime === 'number') {
      diff = gameTime
      gameTime = this.getGameTime()
    }

    let gameDays = this.store.state.gameDays
    let dayLength = this.store.state.dayLength

    let day = gameTime.day + parseInt((gameTime.time + diff) / dayLength)
    let time = (gameTime.time + diff) % dayLength

    if (day > gameDays || time > dayLength) {
      return {
        day: gameDays,
        time: dayLength,
        isWorking: false
      }
    } else {
      return {
        day: day,
        time: time,
        isWorking: true
      }
    }
  }

  /**
   *
   * @param {GameTime} gameTime
   * @returns {Number} 1 is greater, 0 is equal, -1 is less than the current game time.
   */
  gameTimeCompare (gameTime) {
    let cgt = this.getGameTime()
    if (cgt.day < gameTime.day) {
      return 1
    } else if (cgt.day > gameTime.day) {
      return -1
    } else if (cgt.time < gameTime.time) {
      return 1
    } else if (cgt.time > gameTime.time) {
      return -1
    } else {
      return 0
    }
  }

  getStage () {
    return this.store.state.stage
  }

  /**
   * @param {String} name
   * @returns {Node}
   */
  getNode (name) {
    if (!this.nodes.has(name)) {
      throw new Error('Engine:getNode() node name is not found.')
    }
    return this.nodes.get(name)
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }

  _newEngineEvent (type) {
    return new EngineEvent({
      type: type,
      target: this,
      gameTime: _.cloneDeep(this.getGameTime()),
      stage: this.getStage()
    })
  }
}
