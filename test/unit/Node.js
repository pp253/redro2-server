/* eslint-env node, mocha */
import {assert, expect} from 'chai'
import Node from '@/Node'

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

describe('Node', function () {
  let node

  describe('#constructor()', function () {
    it('should be marked as type Node.', function (done) {
      node = new Node()
      expect(node.type).to.equal('Node')
      done()
    })
  })

  describe('#load()', function () {
    it('should load the options.', function (done) {
      node.load(DUMMY_ENGINE, NODE_OPTIONS)
      .then(() => {
        done()
      })
    })
  })

  describe('#toObject()', function () {
    it('should return an object.', function (done) {
      let obj = node.toObject()
      assert.isObject(obj)
      done()
    })
  })
})
