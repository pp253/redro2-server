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
      if (!node.BiddingMarket) {
        throw ResponseErrorMsg.BiddingMarketNotFoundInNode(nodeName)
      }
      resolve(ResponseSuccessJSON({
        biddingmarket: node.BiddingMarket.toObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function release (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      biddingItem: validator.biddingItem
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.BiddingMarket) {
        throw ResponseErrorMsg.BiddingMarketNotFoundInNode(nodeName)
      }
      let biddingItem = req.body.biddingItem
      return node.BiddingMarket.release(biddingItem)
    })
    .then((biddingMarket) => {
      resolve(ResponseSuccessJSON({
        biddingmarket: biddingMarket.toObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function cancel (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      biddingStageChange: validator.biddingStageChange
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.BiddingMarket) {
        throw ResponseErrorMsg.BiddingMarketNotFoundInNode(nodeName)
      }
      let biddingStageChange = req.body.biddingStageChange
      return node.BiddingMarket.cancel(biddingStageChange)
    })
    .then((biddingMarket) => {
      resolve(ResponseSuccessJSON({
        biddingmarket: biddingMarket.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function sign (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      biddingStageChange: validator.biddingStageChange
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.BiddingMarket) {
        throw ResponseErrorMsg.BiddingMarketNotFoundInNode(nodeName)
      }
      let biddingStageChange = req.body.biddingStageChange
      return node.BiddingMarket.sign(biddingStageChange)
    })
    .then((biddingMarket) => {
      resolve(ResponseSuccessJSON({
        biddingmarket: biddingMarket.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function breakoff (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      biddingStageChange: validator.biddingStageChange
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.BiddingMarket) {
        throw ResponseErrorMsg.BiddingMarketNotFoundInNode(nodeName)
      }
      let biddingStageChange = req.body.biddingStageChange
      return node.BiddingMarket.breakoff(biddingStageChange)
    })
    .then((biddingMarket) => {
      resolve(ResponseSuccessJSON({
        biddingmarket: biddingMarket.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function deliver (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      biddingStageChange: validator.biddingStageChange
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.BiddingMarket) {
        throw ResponseErrorMsg.BiddingMarketNotFoundInNode(nodeName)
      }
      let biddingStageChange = req.body.biddingStageChange
      return node.BiddingMarket.deliver(biddingStageChange)
    })
    .then((biddingMarket) => {
      resolve(ResponseSuccessJSON({
        biddingmarket: biddingMarket.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}
