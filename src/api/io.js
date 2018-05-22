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
      if (!node.IO) {
        throw ResponseErrorMsg.IONotFoundInNode(nodeName)
      }
      resolve(ResponseSuccessJSON({
        io: node.IO.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function importIO (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      ioJournalItem: validator.ioJournalItem
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.IO) {
        throw ResponseErrorMsg.IONotFoundInNode(nodeName)
      }
      let ioJournalItem = req.body.ioJournalItem
      return node.IO.import(ioJournalItem)
    })
    .then((io) => {
      resolve(ResponseSuccessJSON({
        io: io.toMaskedObject()
      }))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}

export function exportIO (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      ioJournalItem: validator.ioJournalItem
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.IO) {
        throw ResponseErrorMsg.IONotFoundInNode(nodeName)
      }
      let ioJournalItem = req.body.ioJournalItem
      return node.IO.export(ioJournalItem)
    })
    .then((io) => {
      resolve(ResponseSuccessJSON({
        io: io.toMaskedObject()
      }))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}
