/* eslint-env node, mocha */
import {assert, expect} from 'chai'
import * as schema from '@/lib/schema'
import Engine from '@/Engine'
import { timeout } from '@/lib/utils'
import {SHORT_ENGINE_CONFIG, LONG_ENGINE_CONFIG} from '../engine.config'

const DUMMY_SERVER = {}

describe('Engine', function () {
  let engine

  this.timeout(1 * 1000)

  describe('#constructor()', function () {
    it('should be marked as type Engine.', function (done) {
      engine = new Engine()
      expect(engine.type).to.equal('Engine')
      done()
    })
  })

  describe('#load()', function () {
    it('should load the options.', function (done) {
      engine.load(DUMMY_SERVER, SHORT_ENGINE_CONFIG)
      .then(() => {
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
      assert.isString(id)
      done()
    })
  })
})

describe('Engine Time Sequence', function () {
  let engine

  this.timeout(10 * 1000)

  before(function (done) {
    engine = new Engine()
    engine.load(DUMMY_SERVER, SHORT_ENGINE_CONFIG)
    .then(() => {
      done()
    })
  })

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

  it('the GameTime of stage READY is d0+t0+false.', function (done) {
    expect(engine.getGameTime().day).to.equal(0)
    expect(engine.getGameTime().time).to.equal(0)
    expect(engine.getGameTime().isWorking).to.equal(false)
    done()
  })

  it('the next stage is START.', function (done) {
    engine.nextStage()
      .then(() => {
        expect(engine.getStage()).to.equal(schema.ENGINE_STAGE.START)
        done()
      })
  })

  it('should set the time to d1+t0+true.', function (done) {
    expect(engine.getGameTime().day).to.equal(1)
    expect(engine.getGameTime().time).to.equal(0)
    expect(engine.getGameTime().isWorking).to.equal(true)
    done()
  })

  it('should not be able to use nextDay() when working.', function (done) {
    engine.nextDay()
    .catch(() => { done() })
  })

  it('after 1 sec, should set the time to d1+t1+true.', function (done) {
    timeout(1000)
    .then(() => {
      expect(engine.getGameTime().day).to.equal(1)
      expect(engine.getGameTime().time).to.equal(1)
      expect(engine.getGameTime().isWorking).to.equal(true)
      done()
    })
  })

  it('after 3 secs, should set the time to d1+t5+true.', function (done) {
    timeout(3000)
    .then(() => {
      expect(engine.getGameTime().day).to.equal(1)
      expect(engine.getGameTime().time).to.equal(4)
      expect(engine.getGameTime().isWorking).to.equal(true)
      done()
    })
  })

  it('after 6 secs, should set the time to d1+t10+false.', function (done) {
    timeout(6000)
    .then(() => {
      expect(engine.getGameTime().day).to.equal(1)
      expect(engine.getGameTime().time).to.equal(10)
      expect(engine.getGameTime().isWorking).to.equal(false)
      done()
    })
  })

  it('should set the time to d2+t0+true.', function (done) {
    engine.nextDay()
    .then(() => {
      expect(engine.getGameTime().day).to.equal(2)
      expect(engine.getGameTime().time).to.equal(0)
      expect(engine.getGameTime().isWorking).to.equal(true)
      done()
    })
  })

  it('after 4 secs, should set the time to d2+t4+true.', function (done) {
    timeout(4000)
    .then(() => {
      expect(engine.getGameTime().day).to.equal(2)
      expect(engine.getGameTime().time).to.equal(4)
      expect(engine.getGameTime().isWorking).to.equal(true)
      done()
    })
  })

  it('after 6 secs, should set the time to d2+t10+false.', function (done) {
    timeout(6000)
    .then(() => {
      expect(engine.getGameTime().day).to.equal(2)
      expect(engine.getGameTime().time).to.equal(10)
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

describe('Engine Game Simulation Basic: Account, Inventory, IO', function () {
  let engine

  this.timeout(10 * 1000)

  before(function (done) {
    engine = new Engine()
    engine.load(DUMMY_SERVER, LONG_ENGINE_CONFIG)
    .then(() => { return engine.nextStage() }) // to prepare
    .then(() => { return engine.nextStage() }) // to ready
    .then(() => { return engine.nextStage() }) // to start
    .then(() => {
      done()
    })
  })

  describe('Account', function () {
    const NODE_NAME = 'AssemblyFactory#1'
    const COUNTER_NODE_NAME = 'ComponentsFactory#1'

    it('should add the initial cash.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let account = node.Account
      let journal = account.getJournal()
      expect(journal[0].memo).to.equal('Initial Cash')
      expect(journal[0].unbalance).to.equal(true)
      expect(journal[0].debit[0].classification).to.equal('Cash')
      expect(journal[0].debit[0].amount).to.equal(10000)
      expect(journal[0].debit[0].counterObject).to.equal('Engine')

      let ledger = account.getLedger('Cash')
      expect(ledger.balance).to.equal(10000)

      done()
    })

    it('should add the journal and ledger properly.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let account = node.Account
      account.add({
        debit: [{
          amount: 100,
          classification: 'Cash'
        }],
        credit: [{
          amount: 100,
          classification: 'Sales'
        }],
        memo: 'Sample journal item',
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        let journal = account.getJournal()
        expect(journal[1].memo).to.equal('Sample journal item')
        expect(journal[1].unbalance).to.equal(false)

        let ledgerCash = account.getLedger('Cash')
        expect(ledgerCash.balance).to.equal(10100)

        let ledgerSales = account.getLedger('Sales')
        expect(ledgerSales.balance).to.equal(-100)

        done()
      })
    })

    it('should repay the AccountsPayable to the counter object.', function (done) {
      let counter = engine.getNode(COUNTER_NODE_NAME)
      let node = engine.getNode(NODE_NAME)
      counter.Account.add({
        debit: [{
          amount: 100,
          classification: 'AccountsReceivable',
          counterObject: NODE_NAME
        }],
        credit: [{
          amount: 100,
          classification: 'Sales',
          counterObject: NODE_NAME
        }],
        memo: 'Sample AccountsReceivable Item',
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        let ledgerAccountsReceivable = counter.Account.getLedger('AccountsReceivable')
        expect(ledgerAccountsReceivable.balance).to.equal(100)

        let ledgerSales = counter.Account.getLedger('Sales')
        expect(ledgerSales.balance).to.equal(-100)

        return Promise.resolve()
      })
      .then(() => {
        return node.Account.add({
          debit: [{
            amount: 100,
            classification: 'Inventory',
            counterObject: COUNTER_NODE_NAME
          }],
          credit: [{
            amount: 100,
            classification: 'AccountsPayable',
            counterObject: COUNTER_NODE_NAME
          }],
          memo: 'Sample AccountsPayable Item',
          time: Date.now(),
          gameTime: engine.getGameTime()
        })
      })
      .then(() => {
        let ledgerAccountsReceivable = counter.Account.getLedger('AccountsReceivable')
        expect(ledgerAccountsReceivable.balance).to.equal(0)

        let ledgerSales = counter.Account.getLedger('Cash')
        expect(ledgerSales.balance).to.equal(10100)

        return Promise.resolve()
      })
      .then(() => {
        let ledgerCash = node.Account.getLedger('Cash')
        expect(ledgerCash.balance).to.equal(10000)

        let ledgerInventory = node.Account.getLedger('Inventory')
        expect(ledgerInventory.balance).to.equal(100)

        let ledgerAccountsPayable = node.Account.getLedger('AccountsPayable')
        expect(ledgerAccountsPayable.balance).to.equal(0)

        done()
      })
    })
  })

  describe('Inventory', function () {
    const NODE_NAME = 'AssemblyFactory#1'
    const COUNTER_NODE_NAME = 'ComponentsFactory#1'

    it('should available for importing.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let inventory = node.Inventory
      inventory.import({
        from: COUNTER_NODE_NAME,
        to: NODE_NAME,
        list: [
          {
            good: 'Body',
            unit: 10,
            unitPrice: 10
          },
          {
            good: 'Wheel',
            unit: 20,
            unitPrice: 20
          }
        ],
        price: 500,
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should show the correct storage unit.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let inventory = node.Inventory
      expect(inventory.getStorageUnit('Body')).to.equal(10)
      expect(inventory.getStorageUnit('Wheel')).to.equal(20)
      done()
    })

    it('should show the correct cost of sales.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let inventory = node.Inventory
      expect(inventory.getCostOfSales('Body', 10)).to.equal(10 * 10)
      expect(inventory.getCostOfSales('Wheel', 10)).to.equal(20 * 10)
      done()
    })

    it('should add to the account Inventory and Cash (AccountsPayable).', function (done) {
      let node = engine.getNode(NODE_NAME)

      let ledgerInventory = node.Account.getLedger('Inventory')
      expect(ledgerInventory.balance).to.equal(100 + 500)

      let ledgerCash = node.Account.getLedger('Cash')
      expect(ledgerCash.balance).to.equal(9500)

      done()
    })

    it('should available for exporting.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let inventory = node.Inventory
      inventory.export({
        from: NODE_NAME,
        to: COUNTER_NODE_NAME,
        list: [
          {
            good: 'Body',
            unit: 5,
            unitPrice: 10
          },
          {
            good: 'Wheel',
            unit: 10,
            unitPrice: 20
          }
        ],
        price: 250,
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should take the storage.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let inventory = node.Inventory
      expect(inventory.getStorageUnit('Body')).to.equal(5)
      expect(inventory.getStorageUnit('Wheel')).to.equal(10)
      done()
    })

    it('should add to the account CostOfSales and Inventory.', function (done) {
      let node = engine.getNode(NODE_NAME)

      let ledgerSales = node.Account.getLedger('CostOfSales')
      expect(ledgerSales.balance).to.equal(5 * 10 + 10 * 20)

      let ledgerCash = node.Account.getLedger('Inventory')
      expect(ledgerCash.balance).to.equal(600 - 250)

      done()
    })
  })

  describe('IO', function () {
    const NODE_NAME = 'AssemblyFactory#1'
    const COUNTER_NODE_NAME = 'ComponentsFactory#1'

    it('should available for importing (completed).', function (done) {
      let node = engine.getNode(NODE_NAME)
      let io = node.IO
      io.import({
        from: COUNTER_NODE_NAME,
        to: NODE_NAME,
        list: [
          {
            good: 'Body',
            unit: 10,
            unitPrice: 20
          },
          {
            good: 'Wheel',
            unit: 20,
            unitPrice: 40
          }
        ],
        transportationCost: 100,
        transportationTime: 0,
        transportationStatus: schema.TRANSPORTATION_STATUS.COMPLETED,
        price: 1000,
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should store them in the inventory.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let inventory = node.Inventory
      expect(inventory.getStorageUnit('Body')).to.equal(5 + 10)
      expect(inventory.getStorageUnit('Wheel')).to.equal(10 + 20)
      done()
    })

    it('should add to the account Inventory and Cash (AccountsPayable).', function (done) {
      let node = engine.getNode(NODE_NAME)

      let ledgerInventory = node.Account.getLedger('Inventory')
      expect(ledgerInventory.balance).to.equal(100 + 500 - 250 + 1000)

      let ledgerCash = node.Account.getLedger('Cash')
      expect(ledgerCash.balance).to.equal(9500 - 1000)

      done()
    })

    it('should available for importing (delivering).', function (done) {
      let node = engine.getNode(NODE_NAME)
      let io = node.IO
      io.import({
        from: COUNTER_NODE_NAME,
        to: NODE_NAME,
        list: [
          {
            good: 'Body',
            unit: 10,
            unitPrice: 20
          },
          {
            good: 'Wheel',
            unit: 20,
            unitPrice: 40
          }
        ],
        transportationCost: 100,
        transportationTime: 3,
        transportationStatus: schema.TRANSPORTATION_STATUS.DELIVERING,
        price: 1000,
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should not delivered the goods right away.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let inventory = node.Inventory
      expect(inventory.getStorageUnit('Body')).to.equal(5 + 10)
      expect(inventory.getStorageUnit('Wheel')).to.equal(10 + 20)
      done()
    })

    it('should delivered the goods after 3 secs.', function (done) {
      timeout(3000)
      .then(() => {
        let node = engine.getNode(NODE_NAME)
        let inventory = node.Inventory
        expect(inventory.getStorageUnit('Body')).to.equal(5 + 10 + 10)
        expect(inventory.getStorageUnit('Wheel')).to.equal(10 + 20 + 20)
        done()
      })
    })

    it('should add to the account Inventory and Cash (AccountsPayable).', function (done) {
      let node = engine.getNode(NODE_NAME)

      let ledgerInventory = node.Account.getLedger('Inventory')
      expect(ledgerInventory.balance).to.equal(100 + 500 - 250 + 1000 + 1000)

      let ledgerCash = node.Account.getLedger('Cash')
      expect(ledgerCash.balance).to.equal(9500 - 1000 - 1000)

      done()
    })

    it('should available for exporting (completed).', function (done) {
      let node = engine.getNode(COUNTER_NODE_NAME)
      let inventory = node.Inventory
      let io = node.IO

      inventory.import({
        from: NODE_NAME,
        to: COUNTER_NODE_NAME,
        list: [
          {
            good: 'Body',
            unit: 50,
            unitPrice: 10
          },
          {
            good: 'Wheel',
            unit: 50,
            unitPrice: 10
          }
        ],
        price: 1000,
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        return io.export({
          from: COUNTER_NODE_NAME,
          to: NODE_NAME,
          list: [
            {
              good: 'Body',
              unit: 20,
              unitPrice: 30
            },
            {
              good: 'Wheel',
              unit: 30,
              unitPrice: 50
            }
          ],
          transportationCost: 100,
          transportationTime: 0,
          transportationStatus: schema.TRANSPORTATION_STATUS.COMPLETED,
          price: 2100,
          time: Date.now(),
          gameTime: engine.getGameTime()
        })
      })
      .then(() => {
        done()
      })
    })

    it('should take them from the inventory.', function (done) {
      let node = engine.getNode(COUNTER_NODE_NAME)
      let inventory = node.Inventory
      //expect(inventory.getStorageUnit('Body')).to.equal(50 - 20)
      expect(inventory.getStorageUnit('Wheel')).to.equal(50 - 30)
      done()
    })

    it('should add to the account CostOfTransportation, and Cash (AccountsReceivable).', function (done) {
      let node = engine.getNode(COUNTER_NODE_NAME)

      let ledgerCostOfTransportation = node.Account.getLedger('CostOfTransportation')
      expect(ledgerCostOfTransportation.balance).to.equal(100)

      let ledgerCostOfSales = node.Account.getLedger('CostOfSales')
      expect(ledgerCostOfSales.balance).to.equal(500)

      let ledgerCash = node.Account.getLedger('Cash')
      expect(ledgerCash.balance).to.equal(13600)

      done()
    })
  })
})

describe('Engine Game Simulation Advanced: BiddingMarket, Market', function () {
  let engine

  this.timeout(10 * 1000)

  before(function (done) {
    engine = new Engine()
    engine.load(DUMMY_SERVER, LONG_ENGINE_CONFIG)
    .then(() => { return engine.nextStage() }) // to prepare
    .then(() => { return engine.nextStage() }) // to ready
    .then(() => { return engine.nextStage() }) // to start
    .then(() => {
      done()
    })
  })

  describe('ComponentsBiddingMarket', function () {
    const NODE_NAME = 'AssemblyFactory#2'
    const COUNTER_NODE_NAME = 'ComponentsFactory#2'
    const BIDDING_MARKET_NAME = 'ComponentsBiddingMarket'

    it('should be able to release to bidding market.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let bidding = node.BiddingMarketReceiver
      bidding.releaseToUpstream({
        goods: [
          {
            good: 'Wheel',
            unit: 10,
            unitPrice: 20
          },
          {
            good: 'Body',
            unit: 20,
            unitPrice: 25
          },
          {
            good: 'Engine',
            unit: 10,
            unitPrice: 10
          }
        ],
        publisher: NODE_NAME,
        price: 800,
        timeLimit: 10,
        memo: 'Sample Bidding Item from Downstream',
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should show in the biddings list.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let bidding = node.BiddingMarketReceiver
      let list = bidding.getUpstreamBiddings()
      expect(list[0].memo).to.equal('Sample Bidding Item from Downstream')
      expect(list[0].price).to.equal(800)
      expect(list[0].stage).to.equal(schema.BIDDING_ITEM_STAGE.BIDDING)
      done()
    })

    it('should be able to sign by a upstreamer.', function (done) {
      let counter = engine.getNode(COUNTER_NODE_NAME)
      let bidding = counter.BiddingMarketReceiver
      let id = bidding.getDownstreamBiddings()[0]._id.toHexString()
      bidding.signToDownstream({
        id: id,
        operator: COUNTER_NODE_NAME,
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should set to SIGNED stage and signer.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let bidding = node.BiddingMarketReceiver
      let list = bidding.getUpstreamBiddings()
      expect(list[0].memo).to.equal('Sample Bidding Item from Downstream')
      expect(list[0].price).to.equal(800)
      expect(list[0].stage).to.equal(schema.BIDDING_ITEM_STAGE.SIGNED)
      expect(list[0].signer).to.equal(COUNTER_NODE_NAME)
      done()
    })

    it('should be able to delivered.', function (done) {
      let biddingNode = engine.getNode(BIDDING_MARKET_NAME)
      let bidding = biddingNode.BiddingMarket
      let id = bidding.getBiddings()[0]._id.toHexString()
      bidding.deliver({
        id: id,
        operator: COUNTER_NODE_NAME,
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should set to COMPLETED stage.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let bidding = node.BiddingMarketReceiver
      let list = bidding.getUpstreamBiddings()
      expect(list[0].memo).to.equal('Sample Bidding Item from Downstream')
      expect(list[0].price).to.equal(800)
      expect(list[0].stage).to.equal(schema.BIDDING_ITEM_STAGE.COMPLETED)
      done()
    })

    it('should be delivered after 5 secs.', function (done) {
      timeout(5000)
      .then(() => {
        let node = engine.getNode(NODE_NAME)
        let inventory = node.Inventory
        expect(inventory.getStorageUnit('Wheel')).to.equal(10)
        expect(inventory.getStorageUnit('Body')).to.equal(20)
      })
      .then(() => {
        done()
      })
    })

    it('should be able to cancel after released.', function (done) {
      let counter = engine.getNode(COUNTER_NODE_NAME)
      let bidding = counter.BiddingMarketReceiver
      bidding.releaseToDownstream({
        goods: [
          {
            good: 'Wheel',
            unit: 10,
            unitPrice: 20
          },
          {
            good: 'Body',
            unit: 20,
            unitPrice: 30
          }
        ],
        publisher: COUNTER_NODE_NAME,
        price: 800,
        timeLimit: 10,
        memo: 'Sample Bidding Item from Upstream',
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        let id = bidding.getDownstreamBiddings()[1]._id.toHexString()
        return bidding.cancelToDownstream({
          id: id,
          operator: COUNTER_NODE_NAME
        })
      })
      .then(() => {
        done()
      })
    })

    it('should not be able sign the canceled biddings.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let bidding = node.BiddingMarketReceiver
      let id = bidding.getUpstreamBiddings()[1]._id.toHexString()
      bidding.signToUpstream({
        id: id,
        operator: NODE_NAME
      })
      .catch(() => {
        done()
      })
    })

    it('should be able to breakoff biddings.', function (done) {
      let counter = engine.getNode(COUNTER_NODE_NAME)
      let bidding = counter.BiddingMarketReceiver
      bidding.releaseToDownstream({
        goods: [
          {
            good: 'Wheel',
            unit: 10,
            unitPrice: 20
          },
          {
            good: 'Body',
            unit: 20,
            unitPrice: 30
          }
        ],
        publisher: COUNTER_NODE_NAME,
        price: 800,
        timeLimit: 10,
        memo: 'Sample Bidding Item from Upstream',
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        let node = engine.getNode(NODE_NAME)
        let bidding = node.BiddingMarketReceiver
        let id = bidding.getUpstreamBiddings()[2]._id.toHexString()
        bidding.signToUpstream({
          id: id,
          operator: NODE_NAME
        })
      })
      .then(() => {
        let id = bidding.getDownstreamBiddings()[2]._id.toHexString()
        return bidding.breakoffToDownstream({
          id: id,
          operator: COUNTER_NODE_NAME
        })
      })
      .then(() => {
        done()
      })
    })

    it('the breaker should pay the charge.', function (done) {
      let counter = engine.getNode(COUNTER_NODE_NAME)
      let account = counter.Account
      expect(account.getBalance('Cash')).to.equal(9840)
      done()
    })

    it('the counter breaker should take the compensation.', function (done) {
      let counter = engine.getNode(NODE_NAME)
      let account = counter.Account
      expect(account.getBalance('Cash')).to.equal(9600)
      done()
    })
  })

  describe('AssemblyDepartment', function () {
    const NODE_NAME = 'AssemblyFactory#2'
    const AD_NAME = 'AssemblyDepartment'

    it('should be able to assembly.', function (done) {
      let node = engine.getNode(AD_NAME)
      let ad = node.AssemblyDepartment
      ad.assemble({
        to: NODE_NAME,
        list: [
          {
            good: 'Car',
            unit: '2'
          }
        ],
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should not change the cash amount of AssemblyDepartment and counter object.', function (done) {
      expect(engine.getNode(AD_NAME).Account.getBalance('Cash')).to.equal(100000000)
      expect(engine.getNode(NODE_NAME).Account.getBalance('Cash')).to.equal(9600)
      done()
    })

    it('should move the product Car to counter object\' inventory.', function (done) {
      expect(engine.getNode(NODE_NAME).Inventory.getStorageUnit('Car')).to.equal(2)
      expect(engine.getNode(NODE_NAME).Inventory.getStorageUnit('Wheel')).to.equal(10 - 8)
      expect(engine.getNode(NODE_NAME).Inventory.getStorageUnit('Body')).to.equal(20 - 2)
      expect(engine.getNode(NODE_NAME).Inventory.getStorageUnit('Engine')).to.equal(10 - 2)
      done()
    })
  })

  describe('CarsBiddingMarket', function () {
    const NODE_NAME = 'AssemblyFactory#2'
    const COUNTER_NODE_NAME = 'Retailer#1'
    const BIDDING_MARKET_NAME = 'CarsBiddingMarket'

    it('should be able to released by upstream.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let bidding = node.BiddingMarketReceiver
      bidding.releaseToDownstream({
        goods: [
          {
            good: 'Car',
            unit: 2,
            unitPrice: 100
          }
        ],
        publisher: NODE_NAME,
        price: 200,
        timeLimit: 10,
        memo: 'Sample Bidding Item from AssemblyFactory#2',
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should be able to sign by a upstreamer.', function (done) {
      let counter = engine.getNode(COUNTER_NODE_NAME)
      let bidding = counter.BiddingMarketReceiver
      let id = bidding.getUpstreamBiddings()[0]._id.toHexString()
      bidding.signToUpstream({
        id: id,
        operator: COUNTER_NODE_NAME,
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('next day~~', function (done) {
      timeout(5000)
      .then(() => {
        // TODO: check the storage cost

        engine.nextDay()
        done()
      })
    })

    it('should be able to delivered.', function (done) {
      let biddingNode = engine.getNode(BIDDING_MARKET_NAME)
      let bidding = biddingNode.BiddingMarket
      let id = bidding.getBiddings()[0]._id.toHexString()
      bidding.deliver({
        id: id,
        operator: COUNTER_NODE_NAME,
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should not transfer the goods immediately.', function (done) {
      let counter = engine.getNode(COUNTER_NODE_NAME)
      let inventory = counter.Inventory
      expect(inventory.getStorageUnit('Car')).to.equal(0)
      done()
    })

    it('should transfer the goods to downstream after 5 secs.', function (done) {
      timeout(5000)
      .then(() => {
        let counter = engine.getNode(COUNTER_NODE_NAME)
        let inventory = counter.Inventory
        expect(inventory.getStorageUnit('Car')).to.equal(2)
        done()
      })
    })
  })

  describe('Market', function () {
    const NODE_NAME = 'Retailer#1'
    const MARKET_NAME = 'Market'

    it('should be able to buy goods.', function (done) {
      let node = engine.getNode(MARKET_NAME)
      let market = node.Market
      market.buy({
        from: NODE_NAME,
        list: [
          {
            good: 'Car',
            unit: 2
          }
        ],
        memo: String,
        time: Date.now(),
        gameTime: engine.getGameTime()
      })
      .then(() => {
        done()
      })
    })

    it('should take from the inventory.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let inventory = node.Inventory
      expect(inventory.getStorageUnit('Car')).to.equal(0)
      done()
    })

    it('should pay the seller.', function (done) {
      let node = engine.getNode(NODE_NAME)
      let account = node.Account
      expect(account.getBalance('Cash')).to.equal(10000)
      done()
    })
  })
})
