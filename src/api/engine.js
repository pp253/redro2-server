import validator from './validator'
import {ResponseSuccessJSON, ResponseErrorJSON, reqCheck} from '@/api/response'
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
      resolve(ResponseSuccessJSON(engine.toMaskedObject()))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function nextStage (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId
    })
    .then(() => {
      let engineId = req.body.engineId
      let engine = Server.getEngine(engineId)
      return engine.nextStage()
    })
    .then(() => {
      let engineId = req.body.engineId
      let engine = Server.getEngine(engineId)
      resolve(ResponseSuccessJSON(engine.toMaskedObject()))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function nextDay (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId
    })
    .then(() => {
      let engineId = req.body.engineId
      let engine = Server.getEngine(engineId)
      return engine.nextDay()
    })
    .then((engine) => {
      resolve(ResponseSuccessJSON(engine.toMaskedObject()))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function hidden (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId
    })
    .then(() => {
      let engineId = req.body.engineId
      let engine = Server.getEngine(engineId)
      return engine.hidden()
    })
    .then((engine) => {
      resolve(ResponseSuccessJSON(engine.toMaskedObject()))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function unhidden (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId
    })
    .then(() => {
      let engineId = req.body.engineId
      let engine = Server.getEngine(engineId)
      return engine.unhidden()
    })
    .then((engine) => {
      resolve(ResponseSuccessJSON(engine.toMaskedObject()))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}

export function toResultObject (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId
    })
    .then(() => {
      let engineId = req.body.engineId
      let engine = Server.getEngine(engineId)
      resolve(ResponseSuccessJSON({
        result: engine.toResultObject()
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}
