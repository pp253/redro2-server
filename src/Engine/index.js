import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Server from '@/Server'
import Node from '@/Node'
import { timeout } from '@/lib/utils'
import {ENGINE_STAGE, EngineEvent} from '@/lib/schema'

export const ENGINE_EVENTS = {
  GAME_STAGE_CHANGE: 'game-stage-change',
  GAME_TIME_CHANGE: 'game-time-change',
  GAME_DAY_CHANGE: 'game-day-change',
  GAME_ISWORKING_CHANGE: 'game-isworking-change',
  GAME_ONWORK: 'game-onwork',
  GAME_OFFWORK: 'game-offwork',
  GAME_DAY_X_TIME_Y: (day, time) => `game-day-${day}-time-${time}`
}

export default class Engine extends EventEmitter {
  constructor (server, options) {
    super()
    this.type = 'Engine'
    this._loaded = false
    this._timer = {
      startTime: 0,
      timerId: null
    }
  }

  load (server, options) {
    return new Promise((resolve, reject) => {
      if (!(server instanceof Server)) {
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

        /**
         * LOAD THE NODES HERE!!!!!!!!
         */

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  constructGragh (gragh) {}

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
          return this.nextDay()
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
    this._timer.startTime = Date.now()

    this.emit(ENGINE_EVENTS.GAME_TIME_CHANGE,
      this._newEngineEvent(ENGINE_EVENTS.GAME_TIME_CHANGE))
    let eventName = ENGINE_EVENTS.GAME_DAY_X_TIME_Y(this.getGameTime().day, 0)
    this.emit(eventName, this._newEngineEvent(eventName))

    timeout(1000)
    .then(() => { this.nextTick() })

    return new Promise((resolve, reject) => {
      let now = Date.now()
      let adjustedNextTickMS = 1000

      this.emit('game-time-change', this.gameTime, this)

      setInterval(() => {
        this.emit('game-time-change')

      // setInterval recursively.
        setInterval(() => {
          this.emit('game-time-change')
        }, adjustedNextTickMS)
      }, adjustedNextTickMS)
    })
  }

  nextTick () {
    this.emit(ENGINE_EVENTS.GAME_TIME_CHANGE,
      this._newEngineEvent(ENGINE_EVENTS.GAME_TIME_CHANGE))
    let gameTime = this.getGameTime()
    let eventName = ENGINE_EVENTS.GAME_DAY_X_TIME_Y(gameTime.day, gameTime.time + 1)
    this.emit(eventName, this._newEngineEvent(eventName))

    this.store.commit('SET_GAME_TIME', {
      day: gameTime.day,
      time: gameTime.time,
      isWorking: true
    })

    let now = Date.now()
    let adjustedNextTickMS = 1000

    timeout(1000)
    .then(() => { this.nextTick() })
  }

  nextTickToOffWork () {}

  remove () {}
  pause () {}
  resume () {}

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

    if (day > gameDays) {
      return {
        day: day,
        time: (gameTime.time + diff) % dayLength,
        isWorking: true
      }
    } else {
      return {
        day: gameDays,
        time: dayLength,
        isWorking: false
      }
    }
  }

  getGameTime () {
    return this.store.state.gameTime
  }

  getStage () {
    return this.store.state.stage
  }

  toObject () {
    return this.store.toObject()
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
