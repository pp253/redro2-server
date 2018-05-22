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
      if (!node.BiddingMarketReceiver) {
        throw ResponseErrorMsg.BiddingMarketReceiverNotFoundInNode(nodeName)
      }
      resolve(ResponseSuccessJSON({
        biddingmarketreceiver: node.BiddingMarketReceiver.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function releaseToUpstream (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      provider: validator.nodeName,
      biddingItem: validator.biddingItem
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.BiddingMarketReceiver) {
        throw ResponseErrorMsg.BiddingMarketReceiverNotFoundInNode(nodeName)
      }
      let biddingItem = req.body.biddingItem
      return node.BiddingMarketReceiver.releaseToUpstream(biddingItem)
    })
    .then((biddingMarketReceiver) => {
      resolve(ResponseSuccessJSON({
        biddingmarketreceiver: biddingMarketReceiver.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function signToUpstream (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      provider: validator.nodeName,
      biddingStageChange: validator.biddingStageChange
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.BiddingMarketReceiver) {
        throw ResponseErrorMsg.BiddingMarketReceiverNotFoundInNode(nodeName)
      }
      let biddingItem = req.body.biddingItem
      return node.BiddingMarketReceiver.releaseToUpstream(biddingItem)
    })
    .then((biddingMarketReceiver) => {
      resolve(ResponseSuccessJSON({
        biddingmarketreceiver: biddingMarketReceiver.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}
