import { EventEmitter } from 'events'
import _ from 'lodash'
import store from './store'
import Node from '@/Node'
import { PRODUCTION } from '@/lib/utils'
import { ACCOUNT_LEDGER_SIDE, USER_LEVEL, ACCOUNT_EVENTS, AccountEvent } from '@/lib/schema'
import { ResponseErrorMsg } from '@/api/response'

export default class Account extends EventEmitter {
  constructor () {
    super()
    this.type = 'Account'
    this._loaded = false
    this._bankrupt = false
    this.serial = 0
    this.setMaxListeners(10000)
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (PRODUCTION && !(node instanceof Node)) {
        throw ResponseErrorMsg.NodeNotAnInstanceOfNode()
      }
      if (this._loaded) {
        throw ResponseErrorMsg.AccountHasLoaded(node.getName())
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
          return acc + parseFloat(item.amount)
        }, 0) : 0
        let creditAmount = accountTransaction.credit ? accountTransaction.credit.reduce((acc, item) => {
          return acc + parseFloat(item.amount)
        }, 0) : 0

        if (debitAmount !== creditAmount) {
          throw ResponseErrorMsg.AccountNotBalance(this.node.getName(), accountTransaction.memo)
        }
      }

      if (!accountTransaction.time) {
        accountTransaction.time = Date.now()
      }
      accountTransaction.serial = this.serial++
      let serial = accountTransaction.serial

      this.store.dispatch('addTransaction', accountTransaction)
      .then(() => {
        let journal = this.getJournal()
        let transaction = journal.find(item => item.serial === serial)
        this.emit(ACCOUNT_EVENTS.ACCOUNT_ADD, new AccountEvent({
          isBankrupt: this.isBankrupt(),
          transaction: transaction,
          type: ACCOUNT_EVENTS.ACCOUNT_ADD,
          target: this,
          gameTime: transaction.gameTime,
          nodeName: this.node.getName(),
          engineId: this.engine.getId()
        }))

        if (options && options.noRepay === true) {
          return Promise.resolve()
        }
        return this.repay(transaction)
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
      let jobSeq = Promise.resolve()
      for (let counterObject in payableMap) {
        if (cashAmount <= 0) {
          break
        }
        let payableAmount = payableMap[counterObject]
        if (payableAmount <= 0) {
          continue
        }
        let repayAmount = payableAmount > cashAmount ? cashAmount : payableAmount
        cashAmount -= payableAmount

        jobSeq.then(this.engine.getNode(counterObject).Account.add({
          debit: [{
            amount: repayAmount,
            classification: 'Cash',
            counterObject: this.node.getName()
          }],
          credit: [{
            amount: repayAmount,
            classification: 'AccountsReceivable',
            counterObject: this.node.getName()
          }],
          memo: 'Pay the Accounts Payable.',
          time: accountTransaction.time,
          gameTime: accountTransaction.gameTime
        }, {noRepay: true}))
        jobSeq.then(this.node.Account.add({
          debit: [{
            amount: repayAmount,
            classification: 'AccountsPayable',
            counterObject: counterObject
          }],
          credit: [{
            amount: repayAmount,
            classification: 'Cash',
            counterObject: counterObject
          }],
          memo: 'Pay the Accounts Payable.',
          time: accountTransaction.time,
          gameTime: accountTransaction.gameTime
        }, {noRepay: true}))
      }

      jobSeq
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
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
    let bankrupt = this.getBalance('Cash') <= 0
    if (bankrupt !== this._bankrupt) {
      this.emit(ACCOUNT_EVENTS.ACCOUNT_BANKRUPT, new AccountEvent({
        isBankrupt: bankrupt,
        type: ACCOUNT_EVENTS.ACCOUNT_BANKRUPT,
        target: this,
        gameTime: this.engine.getGameTime(),
        nodeName: this.node.getName(),
        engineId: this.engine.getId()
      }))
      this._bankrupt = bankrupt

      if (bankrupt === true) {
        let jobSeq = Promise.resolve()
        if (this.node.BiddingMarketReceiver) {
          jobSeq.then(() => {
            return this.node.BiddingMarketReceiver.cancelAllToUpstream()
          }).then(() => {
            return this.node.BiddingMarketReceiver.cancelAllToDownstream()
          }).then(() => {
            return this.node.BiddingMarketReceiver.breakoffAllToUpstream()
          }).then(() => {
            return this.node.BiddingMarketReceiver.breakoffAllToDownstream()
          })
        }
      }
    }
    return bankrupt
  }

  getActions (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
        return ['Account.*']

      case USER_LEVEL.STAFF:
        return [
          'Account.add',
          'Account.repay',
          'Account.getBalance',
          'Account.getJournal',
          'Account.getLedger',
          'Account.isBankrupt'
        ]

      case USER_LEVEL.PLAYER:
        return [
          'Account.getBalance',
          'Account.getJournal',
          'Account.getLedger',
          'Account.isBankrupt'
        ]

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  getListening (level) {
    switch (level) {
      case USER_LEVEL.ADMIN:
      case USER_LEVEL.STAFF:
      case USER_LEVEL.PLAYER:
        return [
          ACCOUNT_EVENTS.ACCOUNT_ADD,
          ACCOUNT_EVENTS.ACCOUNT_BALANCE_CHANGE,
          ACCOUNT_EVENTS.ACCOUNT_BANKRUPT
        ]

      default:
      case USER_LEVEL.GUEST:
        return []
    }
  }

  toMaskedObject () {
    return {
      engineId: this.engine.getId(),
      nodeName: this.node.getName(),
      isBankrupt: this.isBankrupt(),
      journal: this.getJournal(),
      ledger: this.store.state.ledger.toObject(),
      initialCash: this.store.state.initialCash
    }
  }

  toObject () {
    return this.store.toObject()
  }

  getId () {
    return this.store.state._id.toHexString()
  }
}
