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
      if (!node.InventoryRegister) {
        throw ResponseErrorMsg.InventoryRegisterNotFoundInNode(nodeName)
      }
      resolve(ResponseSuccessJSON({
        inventoryregister: node.InventoryRegister.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function regist (req, res, next) {
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
      if (!node.InventoryRegister) {
        throw ResponseErrorMsg.InventoryRegisterNotFoundInNode(nodeName)
      }
      let ioJournalItem = req.body.ioJournalItem
      return node.InventoryRegister.regist(ioJournalItem)
    })
    .then((inventoryregister) => {
      resolve(ResponseSuccessJSON({
        inventoryregister: inventoryregister.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}
