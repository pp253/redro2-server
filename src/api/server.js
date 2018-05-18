import validator from './validator'
import { ResponseSuccessJSON, ResponseErrorJSON, ResponseErrorMsg, reqCheck } from './response'
import Server from '@/Server'
import { USER_LEVEL } from '@/lib/schema'

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

export function addUser (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      name: validator.name,
      password: validator.password,
      role: validator.role
    })
    .then(() => {
      let name = req.body.name
      let password = req.body.password
      let role = req.body.role || USER_LEVEL.GUEST
      return Server.addUser({
        name: name,
        password: password,
        role: role
      })
    })
    .then(() => {
      let name = req.body.name
      let user = Server.getUserByName(name)
      Object.assign(req.session, {
        name: user.name,
        password: user.password,
        level: user.level,
        userId: user._id.toHexString()
      })

      resolve(
        ResponseSuccessJSON({
          user: user
        })
      )
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON({ more: err }))
    })
  })
}

export function userLogin (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      name: validator.name,
      password: validator.password
    })
    .then(() => {
      let name = req.body.name
      let password = req.body.password
      Server.userLogin(name, password)

      let user = Server.getUserByName(name)
      Object.assign(req.session, {
        name: user.name,
        password: user.password,
        level: user.level,
        userId: user._id.toHexString(),
        v: (req.session.v ? req.session.v : 0) + 1
      })
      resolve(
        ResponseSuccessJSON({
          user: Server.getUserByName(name)
        })
      )
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON({ more: err }))
    })
  })
}
