/* eslint-env node, mocha */
import {assert, expect} from 'chai'
import Node from '@/Node'
import Inventory from '@/components/Inventory'

const DUMMY_ENGINE = {}

const NODE_OPTIONS = {
  name: 'SAMPLE_ENGINE',
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

}

describe('Inventory', function () {
  let node
  let inventory

  before(function (done) {
    node = new Node()
    node.load(DUMMY_ENGINE, NODE_OPTIONS)
    .then(() => { done() })
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
    it('should return an object.', function (done) {
      let obj = inventory.toObject()
      assert.isObject(obj)
      done()
    })
  })

  describe('#getId()', function () {
    it('should return an object.', function (done) {
      let id = inventory.getId()
      assert.isString(id)
      done()
    })
  })
})
