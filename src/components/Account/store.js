import Store from '@/lib/Store'
import AccountModel from './model'

export const STORE_CONTENT = {
  state: {
    journal: []
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
      if (!(item.classification in state.ledger) || !state.ledger[item.classification]) {
        state.ledger[item.classification] = {
          items: [],
          balance: 0
        }
      }

      state.ledger[item.classification].items.push(item)
      state.ledger[item.classification].balance += (item.side === 'debit' ? item.amount : -item.amount)
    }
  },
  actions: {
    addTransaction: (context, transaction) => {
      // Journal
      context.commit('ADD_JOURNAL_TRANSACTION', transaction)

      // Ledger
      for (let side of ['debit', 'credit']) {
        for (let item of transaction[side]) {
          context.commit('ADD_LEDGER_ITEM', {
            amount: item.amount,
            classification: item.classification,
            side: side,
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
  let content = Object.assign({}, STORE_CONTENT, {state: state})
  return st.load(AccountModel, content)
}
