/* eslint-env node, mocha */
import mongoose from 'mongoose'
import {assert, expect} from 'chai'
import Account from '@/components/Account'

describe('Account', function () {
  before(function (done) {
    mongoose.Promise = Promise
    mongoose.connect(`mongodb://localhost/redro2_test`, {useMongoClient: true})
    .then(() => { done() })
  })

  describe('#constructor()', function () {
    it('should be marked as type Account.', function (done) {
      let account = new Account()
      expect(account.type).to.equal('Account')
      done()
    })
  })

  describe('#add()', function () {
    it('should add account transaction appropriately.', function (done) {
      let account = new Account()
      account.load({}, {}).then(account => {
        return account.add({
          debit: [{
            amount: 100,
            classification: 'Cash'
          }],
          credit: [{
            amount: 100,
            classification: 'Sales'
          }],
          memo: 'TEST',
          time: Date.now(),
          gameTime: {
            time: 0,
            day: 0,
            isWorking: false
          },
          unbalance: false
        })
      })
      .then(account => {
        done()
      })
      .catch(err => {
        throw err
      })
    })
  })

  describe('#getBalance()', function () {
    it('should show the correct balance.')
  })

  describe('#getJournal()', function () {
    it('should show the correct journal.')
  })

  describe('#getLedger()', function () {
    it('should show the correct ledger.')
  })

  describe('#getObject()', function () {
    it('should return correct object.')
  })
})
