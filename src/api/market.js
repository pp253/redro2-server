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
      if (!node.Market) {
        throw ResponseErrorMsg.MarketNotFoundInNode(nodeName)
      }
      resolve(ResponseSuccessJSON({
        market: node.Market.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function buy (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      marketJournalItem: validator.marketJournalItem
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.Market) {
        throw ResponseErrorMsg.MarketNotFoundInNode(nodeName)
      }
      let marketJournalItem = req.body.marketJournalItem
      return node.Market.buy(marketJournalItem)
    })
    .then((market) => {
      resolve(ResponseSuccessJSON({
        market: market.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}
