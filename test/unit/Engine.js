/* eslint-env node, mocha */
import {assert, expect} from 'chai'
import * as schema from '@/lib/schema'
import Engine from '@/Engine'
import { timeout } from '@/lib/utils'

const DUMMY_SERVER = {}

const ENGINE_OPTIONS = {
  name: 'SAMPLE_ENGINE',
  nodes: [],
  stage: schema.ENGINE_STAGE.CONSTRUCTED,
  gameTime: {
    day: 0,
    time: 0,
    isWorking: false
  },
  gameDays: 2,
  dayLength: 4
}

describe('Engine', function () {
  let engine

  this.timeout(10 * 1000)

  describe('#constructor()', function () {
    it('should be marked as type Engine.', function (done) {
      engine = new Engine()
      expect(engine.type).to.equal('Engine')
      done()
    })
  })

  describe('#load()', function () {
    it('should load the options.', function (done) {
      engine.load(DUMMY_SERVER, ENGINE_OPTIONS)
      .then(() => {
        done()
      })
    })
  })

  describe('#nextStage()', function () {
    it('should set default stage to CONSTRUCTED.', function (done) {
      expect(engine.getStage()).to.equal(schema.ENGINE_STAGE.CONSTRUCTED)
      done()
    })

    it('the next stage is PREPARE.', function (done) {
      engine.nextStage()
      .then(() => {
        expect(engine.getStage()).to.equal(schema.ENGINE_STAGE.PREPARE)
        done()
      })
    })

    it('the next stage is READY.', function (done) {
      engine.nextStage()
      .then(() => {
        expect(engine.getStage()).to.equal(schema.ENGINE_STAGE.READY)
        done()
      })
    })

    it('the next stage is START.', function (done) {
      engine.nextStage()
      .then(() => {
        expect(engine.getStage()).to.equal(schema.ENGINE_STAGE.START)
        done()
      })
    })
  })

  describe('#nextDay()', function () {
    it('should set the time to d1+t0+true.', function (done) {
      expect(engine.getGameTime().day).to.equal(1)
      expect(engine.getGameTime().time).to.equal(0)
      expect(engine.getGameTime().isWorking).to.equal(true)
      done()
    })
  })

  describe('#startTicking and #_nextTick()', function () {
    it('after 1 sec, should set the time to d1+t1+true.', function (done) {
      timeout(1000)
      .then(() => {
        expect(engine.getGameTime().day).to.equal(1)
        expect(engine.getGameTime().time).to.equal(1)
        expect(engine.getGameTime().isWorking).to.equal(true)
        done()
      })
    })
  })

  describe('#_nextTickToOffWork()', function () {
    it('after 3 secs, should set the time to d1+t4+false.', function (done) {
      timeout(3000)
      .then(() => {
        expect(engine.getGameTime().day).to.equal(1)
        expect(engine.getGameTime().time).to.equal(4)
        expect(engine.getGameTime().isWorking).to.equal(false)
        done()
      })
    })
  })

  describe('#nextDay()', function () {
    it('should set the time to d2+t0+true.', function (done) {
      engine.nextDay()
      .then(() => {
        expect(engine.getGameTime().day).to.equal(2)
        expect(engine.getGameTime().time).to.equal(0)
        expect(engine.getGameTime().isWorking).to.equal(true)
        done()
      })
    })

    it('after 4 secs, should set the time to d2+t4+false.', function (done) {
      timeout(4000)
      .then(() => {
        expect(engine.getGameTime().day).to.equal(2)
        expect(engine.getGameTime().time).to.equal(4)
        expect(engine.getGameTime().isWorking).to.equal(false)
        done()
      })
    })

    it('should set the stage to FINAL', function (done) {
      expect(engine.getStage()).to.equal(schema.ENGINE_STAGE.FINAL)
      done()
    })

    it('the next stage is END.', function (done) {
      engine.nextStage()
      .then(() => {
        expect(engine.getStage()).to.equal(schema.ENGINE_STAGE.END)
        done()
      })
    })
  })

  describe('#toObject()', function () {
    it('should return an object.', function (done) {
      let obj = engine.toObject()
      assert.isObject(obj)
      done()
    })
  })

  describe('#getId()', function () {
    it('should return an object.', function (done) {
      let id = engine.getId()
      assert.isObject(id)
      done()
    })
  })
})
