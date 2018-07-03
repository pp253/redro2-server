import path from 'path'
import https from 'https'
import http from 'http'
import fs from 'fs'
import express from 'express'
import expresssession from 'express-session'
import ConnectMongo from 'connect-mongo'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import expressValidator from 'express-validator'
import compression from 'compression'
import cors from 'cors'
import sharedsession from 'express-socket.io-session'
import {EventEmitter} from 'events'
import mongoose from 'mongoose'
// import memwatch from 'memwatch-next'
import '@/lib/db-connection'
import routes from '@/routes'
import { PRODUCTION } from '@/lib/utils'
import * as validator from '@/api/validator'
import io from '@/lib/io'

EventEmitter.defaultMaxListeners = 1000000

console.log(`ENV: ${PRODUCTION ? 'production' : 'development'}`)

export const app = express()

// Security
app.use(helmet())

// Allow CORS
// https://div.io/topic/1825
app.use(cors({origin: 'http://localhost:8080', credentials: true})) // {credentials: '*'}

// Compression
app.use(compression({ credentials: true, origin: true }))

// Body parser and Validator
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(
  expressValidator({
    customValidators: {
      isObjectId: validator.isObjectId,
      isCode: validator.isCode
    }
  })
)

// Views
app.set('view engine', 'pug')
app.set('views', './views')

// Session
const MongoStore = ConnectMongo(expresssession)
const session = expresssession({
  secret: 'redro2-zxcvbasdfg',
  resave: true,
  saveUninitialized: true,
  rolling: true,
  proxy: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
})
app.use(session)

// Static
app.use('/', express.static('public'))

if (PRODUCTION) {
  let httpsServer = https.createServer(
    {
      key: fs.readFileSync(path.join(__dirname, '../secret/private.key')),
      cert: fs.readFileSync(path.join(__dirname, '../secret/certificate.crt')),
      ca: fs.readFileSync(path.join(__dirname, '../secret/ca_bundle.crt'))
    },
    app
  )

  // Listening
  httpsServer.listen(443, () => {
    console.log('Start listening on PORT %d ...', 443)
  })

  io.attach(httpsServer, {
    pingInterval: 10000,
    pingTimeout: 5000
  })
  io.use(sharedsession(session, {
    autoSave: true
  }))

  // Auto redirect from port 80 to 443
  http.createServer((req, res) => {
    res.writeHead(301, {
      Location: 'https://' + req.headers['host'] + req.url
    })
    res.end()
  }).listen(80)
} else {
  const httpServer = app.listen(80, () => {
    console.log('Start listening on PORT %d ...', 80)
  })

  io.attach(httpServer, {
    pingInterval: 10000,
    pingTimeout: 5000
  })
  io.use(sharedsession(session, {
    autoSave: true
  }))

  /*
  memwatch.on('leak', (e) => {
    console.log('LEAK', e)
  })
  */
}

// Route
routes(app)

console.log('Server initialized done')
