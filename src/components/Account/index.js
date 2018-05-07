import { EventEmitter } from 'events'
import _ from 'lodash'
import {Pack} from '@/lib/pack'
import store from './store'

export function AccountTransactionPack ({debitItems, creditItems, memo, unbalance}) {
  return Pack({
    debit: debitItems,
    credit: creditItems,
    memo: memo || '',
    unbalance: unbalance || false
  })
}

export default class Account extends EventEmitter {
  constructor () {
    super()
    this.type = 'Account'
    this._loaded = false
    /*
    this.load = this.load.bind(this)
    this.add = this.add.bind(this)
    this.getBalance = this.getBalance.bind(this)
    this.getJournal = this.getJournal.bind(this)
    this.getLedger = this.getLedger.bind(this)
    this.toObject = this.toObject.bind(this)
    */
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (this._loaded) {
        throw new Error('Account:load() Node has been loaded before.')
      }
      this._loaded = true

      this.node = node
      this.options = options

      let state = {}
      store(state)
      .then((store) => {
        this.store = store
        resolve(this)
      })
      .catch(err => { reject(err) })
    })
  }

  /*
    Account.add({
      credit: [{
        amount: 0,
        classification: 'Cash'
      }],
      debit: [{
        amount: 0,
        classification: 'Cash'
      }],
      memo: '',
      time: '',
      gameTime: ''
    })
  */
  add (accountTransaction) {
    return new Promise((resolve, reject) => {
      // check balance
      if (!('unbalance' in accountTransaction) || accountTransaction.unbalance === true) {
        let debitAmount = accountTransaction.debit.reduce((acc, item) => {
          return acc + item.amount
        }, 0)
        let creditAmount = accountTransaction.credit.reduce((acc, item) => {
          return acc + item.amount
        }, 0)

        if (debitAmount !== creditAmount) {
          throw new Error('Account:add() Transaction is not balance.')
        }
      }

      this.store.dispatch('addTransaction', accountTransaction)
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  getBalance (classification) {
    if (!(classification in this.store.ledger)) {
      return 0 // Not an error, 因為這只是詢問是否有這個科目的剩餘金額
    }

    return this.store.ledger[classification].balance
  }

  getJournal () {
    return _.cloneDeep(this.store.journal)
  }

  getLedger (classification) {
    return _.cloneDeep(this.store.ledger[classification])
  }

  toObject () {
    return this.store.toObject()
  }
}
