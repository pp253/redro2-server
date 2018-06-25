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
      if (!node.MarketReceiver) {
        throw ResponseErrorMsg.MarketReceiverNotFoundInNode(nodeName)
      }
      resolve(ResponseSuccessJSON({
        marketreceiver: node.MarketReceiver.toMaskedObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}
