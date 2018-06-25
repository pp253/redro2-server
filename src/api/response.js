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

export function ResponseErrorJSON (err) {
  return Object.assign(ResponseJSON({
    error: 1,
    id: 0,
    message: 'Unknown error.',
    raw: err.message
  }), err)
}

export const ResponseErrorMsg = {
  // api/
  ApiModuleNotExist (moduleName) {
    return ResponseErrorJSON({
      id: 1,
      message: `ModuleName='${moduleName}' is not exist.`
    })
  },
  ApiArgumentValidationError (errMsg) {
    return ResponseErrorJSON({
      id: 3,
      message: `Arguments not match.`,
      more: errMsg
    })
  },
  EngineIdNotFound (engineId) {
    return ResponseErrorJSON({
      id: 10,
      message: `Engine id not found.`,
      more: engineId
    })
  },
  AccountNotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 20,
      message: `Account not found in node.`,
      more: nodeName
    })
  },
  InventoryNotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 30,
      message: `Inventory not found in node.`,
      more: nodeName
    })
  },
  IONotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 40,
      message: `IO not found in node.`,
      more: nodeName
    })
  },
  BiddingMarketReceiverNotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 50,
      message: `BiddingMarketReceiver not found in node.`,
      more: nodeName
    })
  },
  BiddingMarketNotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 60,
      message: `BiddingMarket not found in node.`,
      more: nodeName
    })
  },
  MarketReceiverNotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 70,
      message: `MarketReceiver not found in node.`,
      more: nodeName
    })
  },
  MarketNotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 80,
      message: `Market not found in node.`,
      more: nodeName
    })
  },
  AssemblyDepartmentNotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 90,
      message: `Market not found in node.`,
      more: nodeName
    })
  },
  InventoryRegisterNotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 100,
      message: `InventoryRegister not found in node.`,
      more: nodeName
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
