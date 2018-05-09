import mongoose from 'mongoose'
import * as schema from '@/lib/schema'

// 參考自 http://joanne9611.pixnet.net/blog/post/52967104
export const AccountsClassification = {
  Assets: 'Assets', // 資產
  Liability: 'Liability', // 負債
  OperatingIncome: 'Operating Income', // 營業收入
  OperatingCosts: 'Operating Costs', // 營業成本
  OperatingExpenses: 'Operating Expenses', // 營業費用
  NonOperatingIncomeAndExpenses: 'Non-Operating Income and Expenses' // 營業外收入及支出
}

/**
 * @typedef AccountItem
 * @property amount {Number}
 * @property classification {String}
 * @property counterObject {CounterObject}
 */
export const AccountItemSchema = new mongoose.Schema({
  amount: {type: Number, default: 0},
  classification: {type: String, default: ''},
  /**
   * 資產、負債科目應計交易對象，以便追蹤，尤其是負債或應付帳款時更應。
   */
  counterObject: schema.CounterObjectSchema
})

/**
 * @typedef AccountTransaction
 * @property debit {Array<AccountItem>}
 * @property credit {Array<AccountItem>}
 * @property memo {String}
 * @property time {Date}
 * @property gameTime {GameTime}
 * @property unbalance {Boolean}
 */
export const AccountTransactionSchema = new mongoose.Schema({
  debit: [AccountItemSchema],
  credit: [AccountItemSchema],
  memo: String,
  time: {type: Date, default: Date.now},
  gameTime: schema.GameTimeSchema,
  unbalance: {type: Boolean, default: false}
})

/**
 * @typedef AccountLedgerItem
 * @property amount {Number}
 * @property classification {String}
 * @property side {String}
 * @property memo {String}
 * @property time {Date}
 * @property gameTime {GameTime}
 */
export const AccountLedgerItemSchema = new mongoose.Schema({
  amount: {type: Number, default: 0},
  classification: {type: String, required: true},
  /**
   * side = `debit` | `credit`
   */
  side: {type: String, required: true},
  memo: String,
  time: {type: Date, default: Date.now},
  gameTime: schema.GameTimeSchema
})

/**
 * @typedef AccountLedger
 * @property classification {String}
 * @property items {Array<AccountLedgerItem>}
 * @property balance {Number}
 */
export const AccountLedgerSchema = new mongoose.Schema({
  classification: {type: String, required: true},
  items: [AccountLedgerItemSchema],
  /**
   * Balance = Debit - Credit
   */
  balance: {type: Number, default: 0}
})

/**
 * @typedef Account
 * @property journal {Array<AccountTransaction>}
 * @property ledger {Array<AccountLedger>}
 */
export const AccountSchema = new mongoose.Schema({
  journal: [AccountTransactionSchema],
  ledger: [AccountLedgerSchema]
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const AccountModel = mongoose.model('account', AccountSchema)
export default AccountModel
