/* eslint-env node, mocha */
import mongoose from 'mongoose'
import {assert, expect} from 'chai'
import Node from '@/Node'
import Inventory from '@/components/Inventory'

const DUMMY_ENGINE = {}

const NODE_OPTIONS = {
  name: 'SAMPLE_NODE',
  components: [
    {
      type: 'Account',
      enable: true
    },
    {
      type: 'IO',
      enable: true
    },
    {
      type: 'Inventory',
      enable: true
    }
  ]
}

const INVENTORY_OPTIONS = {
  name: 'SAMPLE_NODE',
  components: [
    {
      type: 'Account',
      enable: true
    },
    {
      type: 'IO',
      enable: true
    },
    {
      type: 'Inventory',
      enable: true
    }
  ]
}

describe('Inventory', function () {
  let node
  let inventory

  before(function (done) {
    mongoose.Promise = Promise
    mongoose.connect(`mongodb://localhost/redro2_test`, {useMongoClient: true})
    .then(() => {
      node = new Node()
      return node.load(DUMMY_ENGINE, NODE_OPTIONS)
    })
    .then(() => { done() })
  })

  after(function (done) {
    mongoose.disconnect()
    .then(account => { done() })
  })

  describe('#constructor()', function () {
    it('should be marked as type Inventory.', function (done) {
      inventory = new Inventory()
      expect(inventory.type).to.equal('Inventory')
      done()
    })
  })

  describe('#load()', function () {
    it('should load the options.', function (done) {
      inventory.load(node, INVENTORY_OPTIONS)
      .then(() => {
        done()
      })
    })
  })

  describe('#toObject()', function () {
    it('should return a object.', function (done) {
      let obj = inventory.toObject()
      assert.isObject(obj)
      done()
    })
  })
})
