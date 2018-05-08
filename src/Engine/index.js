import { EventEmitter } from 'events'
import _ from 'lodash'
import Node from '@/Node'

export const GAME_STAGE = {
  PREPARE: 'PREPARE',
  READY: 'READY',
  START: 'START',
  FINAL: 'FINAL',
  END: 'END'
}

export const GAMEENGINE_OPTIONS_DEFAULT = { dayLength: 5, gragh: [] }

export default class Engine extends EventEmitter {
  constructor (server, options) {
    super()
    if (!server) {
      console.error('Engine:constructor()', '`server` is required.')
      return
    }
    this.server = server
    this.options = Object.assign(options || {}, _.cloneDeep(GAMEENGINE_OPTIONS_DEFAULT))

    this.gragh = this.options.gragh
    this.nodes = new Map()

    this.gameStage = this.gameDay = 0
    this.gameTime = 0
    this.isWorking = false
    this.dayLength = this.options.dayLength || 3
    this.timeLength = this.options.timeLength || 180

    this._timer = { expectedTimeChange: 0, timerId: null }
  }

  constructGragh (gragh) {}

  load () {}

  dump () {
    return {
      gameStage: this.gameStage,
      gameDay: this.gameDay,
      gameTime: this.gameTime,
      isWorking: this.isWorking
    }
  }

  remove () {}

  nextStage () {
    console.log('currentStage:', this.gameStage)
    switch (this.gameStage) {
      case GAME_STAGE.PREPARE:
        this.gameStage = GAME_STAGE.READY
        break
      case GAME_STAGE.READY:
        this.gameStage = GAME_STAGE.START
        this.nextDay()
        break
      case GAME_STAGE.START:
        this.gameStage = GAME_STAGE.FINAL
        break
      case GAME_STAGE.FINAL:
        this.gameStage = GAME_STAGE.END
        break
      default:
        this.gameStage = GAME_STAGE.PREPARE
        break
    }
  }

  nextDay () {
    if (this.gameDay === this.dayLength) {
      console.warn('Engine:nextDay()', 'The game has reach its day length limit.')
      return
    }
    if (this.gameStage !== GAME_STAGE.START) {
      console.warn('Engine:nextDay()', 'nextDay() can only operate during `START` stage.')
      return
    }
    if (this.isWorking === true) {
      console.warn('Engine:nextDay()', 'nextDay() can only operate during off work.')
      return
    }

    this.gameDay += 1
    this.gameTime = 0
    this.isWorking = true
    this.emit('game-day-change', this.gameDay, this)
    this.emit('game-isworking-change', this.isWorking, this)
    this.emit('game-onwork', this.isWorking, this)

    this.startTicking()
  }

  startTicking () {
    this.emit('game-time-change', this.gameTime, this)

    setInterval(() => {
      this.emit('game-time-change')

      // setInterval recursively.
      setInterval(() => {
        this.emit('game-time-change')
      }, adjustedNextTickMS)
    }, adjustedNextTickMS)
  }

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
      gameTime = this.store.state.gameTime
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
}

let server = {}
let engine = new Engine(server)
