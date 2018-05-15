import _ from 'lodash'
import Store from '@/lib/Store'
import AccountModel from './model'
import { ACCOUNT_LEDGER_SIDE } from '@/lib/schema'

export const STORE_CONTENT = {
  state: {
    journal: [],
    ledger: [],
    initialCash: 0
  },
  getters: {},
  mutations: {
    /**
     * Add to Journal
     */
    ADD_JOURNAL_TRANSACTION: (state, transaction) => {
      if (!state.journal) {
        state.journal = []
      }
      state.journal.push(transaction)
    },
    ADD_LEDGER_ITEM: (state, item) => {
      if (typeof state.ledger !== 'object') {
        state.ledger = {}
      }
      let ledger = state.ledger.find(ledger => ledger.classification === item.classification)
      if (ledger === undefined) {
        state.ledger.push({
          classification: item.classification,
          items: [],
          balance: 0
        })
        ledger = state.ledger[state.ledger.length - 1]
      }

      ledger.items.push(item)
      ledger.balance += (item.side === ACCOUNT_LEDGER_SIDE.DEBIT ? item.amount : -item.amount)
    }
  },
  actions: {
    /**
     * 同時新增到日記簿及分類簿
     */
    addTransaction: (context, transaction) => {
      // Journal
      context.commit('ADD_JOURNAL_TRANSACTION', transaction)

      // Ledger
      for (let side of [ACCOUNT_LEDGER_SIDE.DEBIT, ACCOUNT_LEDGER_SIDE.CREDIT]) {
        for (let item of transaction[side] || []) {
          context.commit('ADD_LEDGER_ITEM', {
            amount: item.amount,
            classification: item.classification,
            side: side,
            counterObject: item.counterObject,
            memo: transaction.memo,
            time: transaction.time,
            gameTime: transaction.gameTime
          })
        }
      }
      return Promise.resolve()
    }
  }
}

/**
 * Load store.
 * @param {object} state
 * @returns {Promise<Store>} Store
 */
export default function store (state) {
  let st = new Store()
  let content = _.defaultsDeep({}, {state: state}, STORE_CONTENT)
  return st.load(AccountModel, content)
}
