import validator from './validator'
import {ResponseSuccessJSON, ResponseErrorJSON, ResponseErrorMsg, reqCheck} from '@/api/response'
import Server from '@/Server'

export function getInfo (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.Account) {
        throw ResponseErrorMsg.AccountNotFoundInNode(nodeName)
      }
      resolve(ResponseSuccessJSON({
        account: node.Account.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function add (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      accountTransaction: validator.accountTransaction
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.Account) {
        throw ResponseErrorMsg.AccountNotFoundInNode(nodeName)
      }
      let accountTransaction = req.body.accountTransaction
      return node.Account.add(accountTransaction)
    })
    .then((account) => {
      resolve(ResponseSuccessJSON({
        account: account.toMaskedObject()
      }))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}
