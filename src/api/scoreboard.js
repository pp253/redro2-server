import validator from './validator'
import { ResponseSuccessJSON, ResponseErrorJSON, ResponseErrorMsg, reqCheck } from './response'
import Server from '@/Server'
import { USER_LEVEL } from '@/lib/schema'

export function getInfo (req, res, next) {
  return new Promise((resolve, reject) => {
    reqCheck(req, {
      engineId: validator.engineId
    })
    .then(() => {
      let engineId = req.body.engineId

      let engine = Server.getEngine(engineId)
      let engineMaskedObject = engine.toMaskedObject()
      let objectTypes = engine.getRole('STAFF', 0, 'Scoreboard').objectTypes

      let accounts = []
      let biddingMarkets = []

      for (let nodeObjectType of objectTypes) {
        let name = nodeObjectType.type
        if (name === 'Server' || name === 'Engine') {
          continue
        }
        let node = engine.getNode(name)
        if (node.Account) {
          accounts.push({
            name: name,
            cashBalance: node.Account.getBalance('Cash')
          })
        }
        if (node.BiddingMarket) {
          biddingMarkets.push({
            name: name,
            biddings: node.BiddingMarket.getBiddings()
          })
        }
      }

      resolve(ResponseSuccessJSON({
        scoreboard: {
          users: Server.getUsers(),

          engineId: engineId,
          name: engineMaskedObject.name,
          describe: engineMaskedObject.describe,
          nodes: engineMaskedObject.nodes,
          stage: engineMaskedObject.stage,
          time: engineMaskedObject.time,
          gameTime: engineMaskedObject.gameTime,
          gameDays: engineMaskedObject.gameDays,
          dayLength: engineMaskedObject.dayLength,
          playerTeams: engineMaskedObject.playerTeams,
          staffTeams: engineMaskedObject.staffTeams,

          accounts: accounts,
          biddingMarkets: biddingMarkets
        }
      }))
    })
    .catch(err => { reject(ResponseErrorJSON(err)) })
  })
}
