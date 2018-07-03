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
  NodeNotAnInstanceOfNode () {
    return ResponseErrorJSON({
      id: 4,
      message: `'node' should be an instance of Node.`
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
  AccountHasLoaded (nodeName) {
    return ResponseErrorJSON({
      id: 21,
      message: `Account has been loaded before.`,
      more: nodeName
    })
  },
  AccountNotBalance (nodeName, memo) {
    return ResponseErrorJSON({
      id: 22,
      message: `Transaction ${memo} is not balance.`,
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
  InventoryHasLoaded (nodeName) {
    return ResponseErrorJSON({
      id: 31,
      message: `Inventory has been loaded before.`,
      more: nodeName
    })
  },
  InventoryOutOfStacks (nodeName, good, hasUnit, needUnit) {
    return ResponseErrorJSON({
      id: 32,
      message: `Inventory of ${good} has ${hasUnit} but need ${needUnit}, thus it is out of stocks.`,
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
  IOHasLoaded (nodeName) {
    return ResponseErrorJSON({
      id: 41,
      message: `IO has been loaded before.`,
      more: nodeName
    })
  },
  IOUniqueGood (nodeName, good) {
    return ResponseErrorJSON({
      id: 42,
      message: `Same good '${good}' should not in more than 1 item.`,
      more: nodeName
    })
  },
  IOImportNotAvailable (nodeName, good, unit) {
    return ResponseErrorJSON({
      id: 43,
      message: `Goods '${good}' (${unit}) imported is not available.`,
      more: nodeName
    })
  },
  IOInventoryRequired (nodeName) {
    return ResponseErrorJSON({
      id: 44,
      message: `Inventory is required.`,
      more: nodeName
    })
  },
  IOExportNotAvailable (nodeName, good, unit) {
    return ResponseErrorJSON({
      id: 45,
      message: `Goods '${good}' (${unit}) exported is not available.`,
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
  BiddingMarketReceiverHasLoaded (nodeName) {
    return ResponseErrorJSON({
      id: 51,
      message: `BiddingMarketReceiver has been loaded before.`,
      more: nodeName
    })
  },
  BiddingMarketReceiverUpstreamProviderIsDisabled (nodeName) {
    return ResponseErrorJSON({
      id: 52,
      message: `BiddingMarketReceiver's upstream provider is disabled.`,
      more: nodeName
    })
  },
  BiddingMarketReceiverDownstreamProviderIsDisabled (nodeName) {
    return ResponseErrorJSON({
      id: 53,
      message: `BiddingMarketReceiver's downstream provider is disabled.`,
      more: nodeName
    })
  },
  BiddingMarketReceiverCannotReleasedWhenBankrupt (nodeName) {
    return ResponseErrorJSON({
      id: 54,
      message: `You can't release biddings when you are bankrupt.`,
      more: nodeName
    })
  },
  BiddingMarketReceiverCannotSignWhenBankrupt (nodeName) {
    return ResponseErrorJSON({
      id: 55,
      message: `You can't sign biddings when you are bankrupt.`,
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
  BiddingMarketHasLoaded (nodeName) {
    return ResponseErrorJSON({
      id: 61,
      message: `BiddingMarketReceiver has been loaded before.`,
      more: nodeName
    })
  },
  BiddingMarketInvalidPublisher (nodeName) {
    return ResponseErrorJSON({
      id: 62,
      message: `BiddingMarket's publisher should be either one of the upstreams or downstreams.`,
      more: nodeName
    })
  },
  BiddingMarketInvalidIdOrOperator (nodeName) {
    return ResponseErrorJSON({
      id: 63,
      message: `'id' and 'operator' is required.`,
      more: nodeName
    })
  },
  BiddingMarketCanceledWrongStage (nodeName) {
    return ResponseErrorJSON({
      id: 64,
      message: `Bidding item could be canceled only when bidding.`,
      more: nodeName
    })
  },
  BiddingMarketOperatorNotPublisher (nodeName) {
    return ResponseErrorJSON({
      id: 65,
      message: `Operator is not publisher.`,
      more: nodeName
    })
  },
  BiddingMarketSignedWrongStage (nodeName) {
    return ResponseErrorJSON({
      id: 66,
      message: `Bidding item could be signed only when bidding.`,
      more: nodeName
    })
  },
  BiddingMarketSignerNotDownstream (nodeName) {
    return ResponseErrorJSON({
      id: 67,
      message: `Signer should be one of downstreams.`,
      more: nodeName
    })
  },
  BiddingMarketSignerNotUpstream (nodeName) {
    return ResponseErrorJSON({
      id: 68,
      message: `Signer should be one of upstream.`,
      more: nodeName
    })
  },
  BiddingMarketBreakoffWrongStage (nodeName) {
    return ResponseErrorJSON({
      id: 69,
      message: `Bidding item could be breakoff only when signed.`,
      more: nodeName
    })
  },
  BiddingMarketOperatorNotPublisherNorSigner (nodeName) {
    return ResponseErrorJSON({
      id: 70,
      message: `Bidding item operator should be either the publisher or signer.`,
      more: nodeName
    })
  },
  BiddingMarketOperatorInvalidId (nodeName) {
    return ResponseErrorJSON({
      id: 71,
      message: `'id' is required.`,
      more: nodeName
    })
  },
  BiddingMarketDeliveredWrongStage (nodeName) {
    return ResponseErrorJSON({
      id: 72,
      message: `Bidding item could be delivered only when signed.`,
      more: nodeName
    })
  },

  MarketReceiverNotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 75,
      message: `MarketReceiver not found in node.`,
      more: nodeName
    })
  },
  MarketReceiverHasLoaded (nodeName) {
    return ResponseErrorJSON({
      id: 76,
      message: `MarketReceiver has been loaded before.`,
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
  MarketHasLoaded (nodeName) {
    return ResponseErrorJSON({
      id: 81,
      message: `Market has been loaded before.`,
      more: nodeName
    })
  },
  MarketInvalidSeller (nodeName) {
    return ResponseErrorJSON({
      id: 82,
      message: `Market seller must from the upstreams of market.`,
      more: nodeName
    })
  },
  MarketInvalidSellingGoods (nodeName) {
    return ResponseErrorJSON({
      id: 83,
      message: `Seller can only sell the goods that market needed.`,
      more: nodeName
    })
  },
  MarketSupplyMoreThanDemand (nodeName, good, demandAmount, supplyAmount) {
    return ResponseErrorJSON({
      id: 84,
      message: `The supply of good '${good}' is more than demands, market need ${demandAmount}, but the supply is ${supplyAmount}.`,
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
  AssemblyDepartmentHasLoaded (nodeName) {
    return ResponseErrorJSON({
      id: 91,
      message: `AssemblyDepartment has been loaded before.`,
      more: nodeName
    })
  },
  AssemblyDepartmentInvalidReceiver (nodeName, receiver) {
    return ResponseErrorJSON({
      id: 92,
      message: `${receiver} is not one of the receivers.`,
      more: nodeName
    })
  },
  AssemblyDepartmentNotAvailable (nodeName, receiver, good, unit) {
    return ResponseErrorJSON({
      id: 93,
      message: `${receiver} is not available for assembling ${unit} of ${good}.`,
      more: nodeName
    })
  },
  AssemblyDepartmentNoBOMForGood (nodeName, good) {
    return ResponseErrorJSON({
      id: 94,
      message: `No such BOOM for ${good}.`,
      more: nodeName
    })
  },

  InventoryRegisterNotFoundInNode (nodeName) {
    return ResponseErrorJSON({
      id: 100,
      message: `InventoryRegister not found in node.`,
      more: nodeName
    })
  },
  InventoryRegisterHasLoaded (nodeName) {
    return ResponseErrorJSON({
      id: 101,
      message: `InventoryRegister has been loaded before.`,
      more: nodeName
    })
  },

  UserNameNotFound (name) {
    return ResponseErrorJSON({
      id: 200,
      message: `User ${name} not found.`,
      more: name
    })
  },
  UserNameHasExisted (name) {
    return ResponseErrorJSON({
      id: 201,
      message: `User ${name} has existed.`,
      more: name
    })
  },
  UserMagiccodeNotFound (magiccode) {
    return ResponseErrorJSON({
      id: 202,
      message: `User Magiccode '${magiccode}' not found.`,
      more: magiccode
    })
  },
  UserHasNotLogin (name) {
    return ResponseErrorJSON({
      id: 203,
      message: `User '${name}' has not logged in.`,
      more: name
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
