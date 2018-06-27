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
      if (!node.AssemblyDepartment) {
        throw ResponseErrorMsg.AssemblyDepartmentNotFoundInNode(nodeName)
      }
      resolve(ResponseSuccessJSON({
        assemblydepartment: node.AssemblyDepartment.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function assemble (req, res, next) {
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
      if (!node.AssemblyDepartment) {
        throw ResponseErrorMsg.AssemblyDepartmentNotFoundInNode(nodeName)
      }
      let ioJournalItem = req.body.ioJournalItem
      return node.AssemblyDepartment.assemble(ioJournalItem)
    })
    .then((assemblydepartment) => {
      resolve(ResponseSuccessJSON({
        assemblydepartment: assemblydepartment.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}
