import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { ACCOUNT_LEDGER_SIDE } from '@/lib/schema'

export default class Account extends EventEmitter {
  constructor () {
    super()
    this.type = 'Account'
    this._loaded = false
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw new Error('Inventory:load() `node` should be instance of Node.')
      }
      if (this._loaded) {
        throw new Error('Account:load() Node has been loaded before.')
      }
      this._loaded = true

      this.node = node
      this.engine = node.engine
      this.options = _.cloneDeep(options) || {}

      let state = {
        journal: this.options.journal || [],
        ledger: this.options.ledger || [],
        initialCash: this.options.initialCash || 0
      }

      store(state)
      .then((store) => {
        this.store = store

        if (this.store.state.initialCash > 0) {
          this.add({
            debit: [{
              amount: this.store.state.initialCash,
              classification: 'Cash',
              counterObject: 'Engine'
            }],
            memo: 'Initial Cash',
            gameTime: {day: 0, time: 0, isWorking: false},
            unbalance: true
          })
        }

        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /*
    Account.add({
      debit: [{
        amount: 0,
        classification: 'Cash',
        counterObject: ''
      }],
      credit: [{
        amount: 0,
        classification: 'Cash',
        counterObject: ''
      }],
      memo: '',
      time: '',
      gameTime: ''
    })
  */
  /**
    *
    * @param {AccountTransaction} accountTransaction
    * @returns {Promise}
    */
  add (accountTransaction, options) {
    return new Promise((resolve, reject) => {
      // check balance
      if (!('unbalance' in accountTransaction) || accountTransaction.unbalance === false) {
        let debitAmount = accountTransaction.debit ? accountTransaction.debit.reduce((acc, item) => {
          return acc + item.amount
        }, 0) : 0
        let creditAmount = accountTransaction.credit ? accountTransaction.credit.reduce((acc, item) => {
          return acc + item.amount
        }, 0) : 0

        if (debitAmount !== creditAmount) {
          throw new Error('Account:add() Transaction is not balance.')
        }
      }

      this.store.dispatch('addTransaction', accountTransaction)
      .then(() => {
        if (options && options.noRepay === true) {
          return Promise.resolve()
        }
        return this.repay(accountTransaction)
      })
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  /**
   * @returns {Promise}
   */
  repay (accountTransaction) {
    if (this.getBalance('Cash') <= 0 || this.getBalance('AccountsPayable') >= 0) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      let payableMap = {}
      for (let ledgerItem of this.getLedger('AccountsPayable').items) {
        if (ledgerItem.counterObject === 'Engine') {
          continue
        }
        if (!(ledgerItem.counterObject in payableMap)) {
          payableMap[ledgerItem.counterObject] = 0
        }
        if (ledgerItem.side === ACCOUNT_LEDGER_SIDE.DEBIT) {
          payableMap[ledgerItem.counterObject] -= ledgerItem.amount
        } else if (ledgerItem.side === ACCOUNT_LEDGER_SIDE.CREDIT) {
          payableMap[ledgerItem.counterObject] += ledgerItem.amount
        }
      }

      let cashAmount = this.getBalance('Cash')
      let jobSeq = []
      for (let counterObject in payableMap) {
        let payableAmount = payableMap[counterObject]
        if (payableAmount <= 0) {
          continue
        }
        cashAmount -= payableAmount
        if (cashAmount <= 0) {
          break
        }

        jobSeq.push(this.engine.getNode(counterObject).Account.add({
          debit: [{
            amount: payableAmount,
            classification: 'Cash',
            counterObject: this.node.getName()
          }],
          credit: [{
            amount: payableAmount,
            classification: 'AccountsReceivable',
            counterObject: this.node.getName()
          }],
          memo: 'Pay the Accounts Payable.',
          time: accountTransaction.time,
          gameTime: accountTransaction.gameTime
        }, {noRepay: true}))
        jobSeq.push(this.node.Account.add({
          debit: [{
            amount: payableAmount,
            classification: 'AccountsPayable',
            counterObject: counterObject
          }],
          credit: [{
            amount: payableAmount,
            classification: 'Cash',
            counterObject: counterObject
          }],
          memo: 'Pay the Accounts Payable.',
          time: accountTransaction.time,
          gameTime: accountTransaction.gameTime
        }, {noRepay: true}))
      }

      Promise.all(jobSeq)
      .then(() => { resolve() })
    })
  }

  getBalance (classification) {
    let ledger = this.getLedger(classification)
    if (ledger === undefined) {
      return 0 // Not an error, 因為這只是詢問是否有這個科目的剩餘金額
    }
    return ledger.balance
  }

  getJournal () {
    return this.store.state.journal
  }

  getLedger (classification) {
    return this.store.state.ledger.find(ledger => ledger.classification === classification)
  }

  isBankrupt () {
    return (this.getBalance('Cash') + this.getBalance('AccountsReceivable') - this.getBalance('AccountsPayable')) > 0
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
