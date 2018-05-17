import path from 'path'
import https from 'https'
import http from 'http'
import fs from 'fs'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import expressValidator from 'express-validator'
import compression from 'compression'
import cors from 'cors'
import socket from 'socket.io'
// import memwatch from 'memwatch-next'
import '@/lib/db-connection'
import routes from '@/routes'
import { PRODUCTION } from '@/lib/utils'
import * as validator from '@/api/validator'

console.log(`ENV: ${PRODUCTION ? 'production' : 'development'}`)

const app = express()

// Security
app.use(helmet())

// Allow CORS
app.use(cors())

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
app.use(
  session({
    secret: 'redro2-zxcvbasdfg',
    resave: false,
    saveUninitialized: false
  })
)

// Static
app.use('/', express.static('public'))

// Route
routes(app)

export let io

if (PRODUCTION) {
  let httpsServer = https.createServer(
    {
      key: fs.readFileSync(path.join(__dirname, '/secret/private.key')),
      cert: fs.readFileSync(path.join(__dirname, '/secret/certificate.crt')),
      ca: fs.readFileSync(path.join(__dirname, '/secret/ca_bundle.crt'))
    },
    app
  )

  // Listening
  httpsServer.listen(443, () => {
    console.log('Start listening on PORT %d ...', 443)
  })

  io = socket(httpsServer)

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

  io = socket(httpServer)

  /*
  memwatch.on('leak', (e) => {
    console.log('LEAK', e)
  })
  */
}

io.on('connection', e => {
  console.log(`Socket:connection`)
})

console.log('Server initialized done')
