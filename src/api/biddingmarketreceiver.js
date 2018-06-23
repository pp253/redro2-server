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

export function cancelToUpstream (req, res, next) {
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
      if (!node.BiddingMarketReceiver) {
        throw ResponseErrorMsg.BiddingMarketReceiverNotFoundInNode(nodeName)
      }
      let biddingStageChange = req.body.biddingStageChange
      return node.BiddingMarketReceiver.cancelToUpstream(biddingStageChange)
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
      let biddingStageChange = req.body.biddingStageChange
      return node.BiddingMarketReceiver.releaseToUpstream(biddingStageChange)
    })
    .then((biddingMarketReceiver) => {
      resolve(ResponseSuccessJSON({
        biddingmarketreceiver: biddingMarketReceiver.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function breakoffToUpstream (req, res, next) {
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
      if (!node.BiddingMarketReceiver) {
        throw ResponseErrorMsg.BiddingMarketReceiverNotFoundInNode(nodeName)
      }
      let biddingStageChange = req.body.biddingStageChange
      return node.BiddingMarketReceiver.breakoffToUpstream(biddingStageChange)
    })
    .then((biddingMarketReceiver) => {
      resolve(ResponseSuccessJSON({
        biddingmarketreceiver: biddingMarketReceiver.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function releaseToDownstream (req, res, next) {
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
      if (!node.BiddingMarketReceiver) {
        throw ResponseErrorMsg.BiddingMarketReceiverNotFoundInNode(nodeName)
      }
      let biddingItem = req.body.biddingItem
      return node.BiddingMarketReceiver.releaseToDownstream(biddingItem)
    })
    .then((biddingMarketReceiver) => {
      resolve(ResponseSuccessJSON({
        biddingmarketreceiver: biddingMarketReceiver.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function cancelToDownstream (req, res, next) {
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
      if (!node.BiddingMarketReceiver) {
        throw ResponseErrorMsg.BiddingMarketReceiverNotFoundInNode(nodeName)
      }
      let biddingStageChange = req.body.biddingStageChange
      return node.BiddingMarketReceiver.cancelToDownstream(biddingStageChange)
    })
    .then((biddingMarketReceiver) => {
      resolve(ResponseSuccessJSON({
        biddingmarketreceiver: biddingMarketReceiver.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function signToDownstream (req, res, next) {
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
      if (!node.BiddingMarketReceiver) {
        throw ResponseErrorMsg.BiddingMarketReceiverNotFoundInNode(nodeName)
      }
      let biddingStageChange = req.body.biddingStageChange
      return node.BiddingMarketReceiver.signToDownstream(biddingStageChange)
    })
    .then((biddingMarketReceiver) => {
      resolve(ResponseSuccessJSON({
        biddingmarketreceiver: biddingMarketReceiver.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function breakoffToDownstream (req, res, next) {
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
      if (!node.BiddingMarketReceiver) {
        throw ResponseErrorMsg.BiddingMarketReceiverNotFoundInNode(nodeName)
      }
      let biddingStageChange = req.body.biddingStageChange
      return node.BiddingMarketReceiver.breakoffToDownstream(biddingStageChange)
    })
    .then((biddingMarketReceiver) => {
      resolve(ResponseSuccessJSON({
        biddingmarketreceiver: biddingMarketReceiver.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}
