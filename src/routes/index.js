// import response from '../src/api/response'
// import validation from '../src/api/validator'
import Server from '@/Server'
import response from '@/api/response'
import * as server from '@/api/server'
import * as engine from '@/api/engine'
import * as account from '@/api/account'
import * as inventory from '@/api/inventory'
import * as io from '@/api/io'
import * as biddingmarketreceiver from '@/api/biddingmarketreceiver'
import { USER_LEVEL } from '@/lib/schema'

const apiRoute = {
  server: server,
  engine: engine,
  account: account,
  inventory: inventory,
  io: io,
  biddingmarketreceiver: biddingmarketreceiver
}

export default function initialize (app) {
  Server.load(app, {
    users: [
      {
        name: 'pp253',
        password: '123',
        level: USER_LEVEL.ADMIN,
        permissions: []
      }
    ]
  })
  .then(() => {
    app.all('*', (req, res, next) => {
      console.log(req.ip, req.originalUrl)
      next()
    })

    app.post('/api/:module/:method', (req, res, next) => {
      let moduleName = req.params.module
      let methodName = req.params.method
      if (moduleName in apiRoute && methodName in apiRoute[moduleName]) {
        apiRoute[moduleName][methodName](req, res, next)
      .then(result => { res.json(result) })
      .catch(err => { res.json(err) })
      } else {
        res.status(400).json(response.ResponseErrorMsg.ApiModuleNotExist(moduleName))
      }
    })

    app.get('/echo', function (req, res, next) {
      res.send('echo')
    })

    app.get('*', function (req, res, next) {
      res.status(404).send('404 NOT FOUND')
    })
  })
}
