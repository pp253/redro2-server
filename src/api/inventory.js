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
      if (!node.Inventory) {
        throw ResponseErrorMsg.InventoryNotFoundInNode(nodeName)
      }
      resolve(ResponseSuccessJSON({
        inventory: node.Inventory.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function importInventory (req, res, next) {
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
      if (!node.Inventory) {
        throw ResponseErrorMsg.InventoryNotFoundInNode(nodeName)
      }
      let ioJournalItem = req.body.ioJournalItem
      return node.Inventory.import(ioJournalItem)
    })
    .then((inventory) => {
      console.log(inventory)
      resolve(ResponseSuccessJSON({
        inventory: inventory.toMaskedObject()
      }))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}

export function exportInventory (req, res, next) {
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
      if (!node.Inventory) {
        throw ResponseErrorMsg.InventoryNotFoundInNode(nodeName)
      }
      let ioJournalItem = req.body.ioJournalItem
      return node.Inventory.export(ioJournalItem)
    })
    .then((inventory) => {
      resolve(ResponseSuccessJSON({
        inventory: inventory.toMaskedObject()
      }))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}

export function regist (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId,
      nodeName: validator.nodeName,
      stocksItemList: validator.stocksItemList
    })
    .then(() => {
      let engineId = req.body.engineId
      let nodeName = req.body.nodeName
      let engine = Server.getEngine(engineId)
      let node = engine.getNode(nodeName)
      if (!node.Inventory) {
        throw ResponseErrorMsg.InventoryNotFoundInNode(nodeName)
      }
      let stocksItemList = req.body.stocksItemList
      return node.Inventory.regist(stocksItemList)
    })
    .then((inventory) => {
      resolve(ResponseSuccessJSON({
        inventory: inventory.toMaskedObject()
      }))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}
