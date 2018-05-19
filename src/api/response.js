export function ResponseJSON (obj) {
  return Object.assign({
    error: 0,
    time: Date.now()
  }, obj)
}

export function ResponseSuccessJSON (obj) {
  return Object.assign(ResponseJSON({
    success: 1
  }), obj)
}

export function ResponseErrorJSON (obj) {
  return Object.assign(ResponseJSON({
    error: 1,
    id: 0,
    msg: 'Unknown error.'
  }), obj)
}

export const ResponseErrorMsg = {
  // api/
  ApiModuleNotExist (moduleName) {
    return ResponseErrorJSON({
      id: 1,
      msg: `ModuleName='${moduleName}' is not exist.`
    })
  },
  ApiArgumentValidationError (errMsg) {
    return ResponseErrorJSON({
      id: 3,
      msg: `Arguments not match.`,
      more: errMsg
    })
  },
  EngineIdNotFound (engineId) {
    return ResponseErrorJSON({
      id: 10,
      msg: `Engine id not found.`,
      more: engineId
    })
  }
}

export function reqCheck (req, options) {
  return new Promise((resolve, reject) => {
    req.check(options)

    req.getValidationResult().then(err => {
      if (!err.isEmpty()) {
        reject(ResponseErrorMsg.ApiArgumentValidationError(err.mapped()))
        return
      }
      resolve()
    })
  })
}

export default {
  ResponseJSON,
  ResponseSuccessJSON,
  ResponseErrorJSON,
  ResponseErrorMsg,
  reqCheck
}
