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
  }

  load (node, options) {
    return new Promise((resolve, reject) => {
      if (this._loaded) {
        throw new Error('Node:load() Node has been loaded before.')
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

  add (accountTransactionPack) {
    return new Promise((resolve, reject) => {
      // check balance
      if (!accountTransactionPack.unbalance || accountTransactionPack.unbalance === true) {
        let debitAmount = accountTransactionPack.debit.reduce((acc, item) => {
          return acc + item.amount
        }, 0)
        let creditAmount = accountTransactionPack.credit.reduce((acc, item) => {
          return acc + item.amount
        }, 0)

        if (debitAmount !== creditAmount) {
          throw new Error('Account:add() Transaction is not balance.')
        }
      }

      this.store.dispatch('addTransaction', accountTransactionPack)
      .then(() => { resolve(this) })
      .catch(err => { reject(err) })
    })
  }

  balance (classification) {
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
}
