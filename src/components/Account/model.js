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

export const AccountItemSchema = new mongoose.Schema({
  amount: {type: Number, default: 0},
  classification: {type: String, default: ''}
})

export const AccountTransactionSchema = new mongoose.Schema({
  debit: [AccountItemSchema],
  credit: [AccountItemSchema],
  memo: String,
  time: {type: Date, default: Date.now},
  gameTime: schema.GameTimeSchema,
  unbalance: {type: Boolean, default: false}
})

export const AccountLedgerItemSchema = new mongoose.Schema({
  amount: {type: Number, default: 0},
  classification: {type: String, default: ''},
  /**
   * side = `debit` | `credit`
   */
  side: {type: String, required: true},
  memo: String,
  time: {type: Date, default: Date.now},
  gameTime: schema.GameTimeSchema
})

export const AccountLedgerSchema = new mongoose.Schema({
  items: [AccountLedgerItemSchema],
  /**
   * Balance = Debit - Credit
   */
  balance: {
    type: Number,
    default: 0
  }
})

export const AccountSchema = new mongoose.Schema({
  journal: [AccountTransactionSchema],
  ledger: {
    /**
     * Assets
     */
    Cash: AccountLedgerSchema, // 現金
    RawMaterials: AccountLedgerSchema, // 原物料

    /**
     * Liability
     */
    // empty

    /**
     * OperatingIncome
     */
    Sales: AccountLedgerSchema, // 銷售收入

    /**
     * OperatingCosts
     */
    CostOfSales: AccountLedgerSchema, // 銷售成本=進料成本+運輸成本
    CostOfWarehousingSales: AccountLedgerSchema, // 倉儲成本

    /**
     * OperatingExpenses
     */
    SalaryAndWages: AccountLedgerSchema,

    /**
     * NonOperatingIncomeAndExpenses
     */
    NonOperatingIncome: AccountLedgerSchema,
    NonOperatingExpenses: AccountLedgerSchema,
    IncomeFromCounterPartyDefault: AccountLedgerSchema, // 違約金收入
    CounterPartyDefault: AccountLedgerSchema // 違約金支出
  }
},
// Fix a bug https://github.com/Automattic/mongoose/issues/5574
{usePushEach: true})

const AccountModel = mongoose.model('account', AccountSchema)
export default AccountModel
