import validator from './validator'
import { ResponseSuccessJSON, ResponseErrorJSON, ResponseErrorMsg, reqCheck } from './response'
import Server from '@/Server'

export function getEnginesList (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req)
    .then(() => {
      resolve(
        ResponseSuccessJSON({
          list: Server.getEnginesList()
        })
      )
    })
    .catch(err => {
      reject(ResponseErrorJSON({ more: err }))
    })
  })
}

export function createEngine (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      options: validator.options
    })
    .then(() => {
      return Server.createEngine(req.body.options)
    })
    .then(() => {
      let list = Server.getEnginesList()
      resolve(
        ResponseSuccessJSON({
          engine: list[list.length - 1]
        })
      )
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON({ more: err }))
    })
  })
}
