import validator from './validator'
import {ResponseSuccessJSON, ResponseErrorJSON, ResponseErrorMsg, reqCheck} from './response'
import Server from '@/Server'

export function getTeams (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId
    })
    .then(() => {
      let engineId = req.body.engineId
      let engine = Server.getEngine(engineId)
      resolve(ResponseSuccessJSON({
        teams: engine.getTeams().toObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function getInfo (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId
    })
    .then(() => {
      let engineId = req.body.engineId
      let engine = Server.getEngine(engineId)
      resolve(ResponseSuccessJSON({
        teams: engine.getTeams().toObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}
