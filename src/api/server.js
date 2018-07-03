import validator from './validator'
import { ResponseSuccessJSON, ResponseErrorJSON, ResponseErrorMsg, reqCheck } from './response'
import Server from '@/Server'
import { USER_LEVEL } from '@/lib/schema'

export function getInfo (req, res, next) {
  return new Promise((resolve, reject) => {
    resolve(ResponseSuccessJSON(Server.toMaskedObject()))
  })
}

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
      reject(ResponseErrorJSON(err))
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
      reject(ResponseErrorJSON(err))
    })
  })
}

export function checkUser (req, res, next) {
  return new Promise((resolve, reject) => {
    resolve(ResponseSuccessJSON({user: req.session && {
      name: req.session.name,
      password: req.session.password,
      level: req.session.level,
      userId: req.session.userId,
      _id: req.session.userId
    }}))
  })
}

/**
 * @deprecated
 */
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
      // TODO: BUG here
      let name = req.body.name
      let user = Server.getUserByName(name)
      Object.assign(req.session, {
        name: user.name,
        password: user.password,
        level: user.level,
        userId: user._id.toHexString()
      })

      resolve(ResponseSuccessJSON({user: user}))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}

export function userRegist (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      name: validator.name
    })
    .then(() => {
      let name = req.body.name
      return Server.userRegist(name)
    })
    .then(user => {
      resolve(ResponseSuccessJSON({user: user}))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}

export function addUserRole (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      userId: validator.userId,
      engineId: validator.engineId,
      teamIndex: validator.teamIndex,
      role: validator.role
    })
    .then(() => {
      let userId = req.body.userId
      let engineId = req.body.engineId
      let teamIndex = req.body.teamIndex
      let role = req.body.role

      if (req.session.userId !== userId || Server.getUser(userId) == null) {
        throw ResponseErrorMsg.UserHasNotLogin()
      }

      return Server.addUserRole(userId, engineId, teamIndex, role)
    })
    .then(user => {
      resolve(ResponseSuccessJSON({user: user}))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}

/**
 * @deprecated
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
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
        userId: user._id && user._id.toHexString(),
        v: (req.session.v ? req.session.v : 0) + 1
      })
      resolve(ResponseSuccessJSON({user: user}))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}

export function userLoginByMagicCode (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      magiccode: validator.password
    })
    .then(() => {
      let magiccode = req.body.magiccode
      let user = Server.userLoginByMagicCode(magiccode)
      Object.assign(req.session, {
        name: user.name,
        password: user.password,
        level: user.level,
        userId: user._id && user._id.toHexString(),
        v: (req.session.v ? req.session.v : 0) + 1
      })

      resolve(ResponseSuccessJSON({user: user}))
    })
    .catch(err => {
      console.error(err)
      reject(ResponseErrorJSON(err))
    })
  })
}

export function userLogout (req, res, next) {
  return new Promise((resolve, reject) => {
    req.session.destroy(err => {
      if (err) {
        reject(ResponseErrorJSON(err))
        return
      }
      resolve(ResponseSuccessJSON())
    })
  })
}
