/* eslint-env node, mocha */
import mongoose from 'mongoose'
import {assert, expect} from 'chai'
import Account from '@/components/Account'

const DUMMY_NODE = {}

const ACCOUNT_OPTIONS = {}

const SAMPLE_JOURNAL_ITEM = {
  debit: [{
    amount: 100,
    classification: 'Cash'
  }],
  credit: [{
    amount: 100,
    classification: 'Sales'
  }],
  memo: 'SAMPLE_JOURNAL_ITEM',
  time: Date.now(),
  gameTime: {
    time: 0,
    day: 0,
    isWorking: false
  },
  unbalance: false
}

const CASH_ACTUAL_AMOUNT = 200

describe('Account', function () {
  let account

  before(function (done) {
    mongoose.Promise = Promise
    mongoose.connect(`mongodb://localhost/redro2_test`, {useMongoClient: true})
    .then(() => { done() })
  })

  after(function (done) {
    mongoose.disconnect()
    .then(account => { done() })
  })

  describe('#constructor()', function () {
    it('should be marked as type Account.', function (done) {
      account = new Account()
      expect(account.type).to.equal('Account')
      done()
    })
  })

  describe('#load()', function () {
    it('should load the options.', function (done) {
      account.load(DUMMY_NODE, ACCOUNT_OPTIONS)
      .then(() => {
        done()
      })
    })
  })

  describe('#add()', function () {
    it('should add account transaction appropriately.', function (done) {
      account.add(SAMPLE_JOURNAL_ITEM)
      .then(account => {
        return account.add(SAMPLE_JOURNAL_ITEM)
      })
      .then(account => { done() })
      .catch(err => { throw err })
    })
  })

  describe('#getBalance()', function () {
    it('should return a number.', function (done) {
      let balance = account.getBalance()
      assert.isNumber(balance)
      done()
    })

    it('should return 0 when ledger of classification was not found.', function (done) {
      let balance = account.getBalance('AccountsPayable')
      expect(balance).to.equal(0)
      done()
    })

    it('should show the correct balance.', function (done) {
      let balance = account.getBalance('Cash')
      expect(balance).to.equal(CASH_ACTUAL_AMOUNT)
      done()
    })
  })

  describe('#getJournal()', function () {
    it('should return an array.', function (done) {
      let journal = account.getJournal()
      assert.isArray(journal)
      done()
    })

    it('should show the correct journal.', function (done) {
      let journal = account.getJournal()
      expect(journal[0].memo).to.equal('SAMPLE_JOURNAL_ITEM')
      done()
    })
  })

  describe('#getLedger()', function () {
    it('should show the correct ledger.', function (done) {
      let ledger = account.getLedger('Cash')
      expect(ledger.items.length).to.equal(2)
      expect(ledger.items[0].classification).to.equal('Cash')
      done()
    })
  })

  describe('#isBankrupt()', function () {
    it('should return a boolean.', function (done) {
      let bankrupt = account.isBankrupt()
      assert.isBoolean(bankrupt)
      done()
    })
  })

  describe('#toObject()', function () {
    it('should return a object.', function (done) {
      let obj = account.toObject()
      assert.isObject(obj)
      done()
    })
  })
})
