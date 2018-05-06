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
import mongoose from 'mongoose'
import socket from 'socket.io'
// import memwatch from 'memwatch-next'
import routes from '@/routes'
import { PRODUCTION } from '@/lib/utils'

console.log(`ENV: ${PRODUCTION ? 'production' : 'development'}`)

// Connecting to MongoDB
mongoose.connect(`mongodb://localhost/redro2`, {useMongoClient: true})

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
    customValidators: {}
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

  const io = socket(httpsServer)
  io.on('connection', e => {
    console.log(e)
  })

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

  const io = socket(httpServer)
  io.on('connection', e => {
    console.log(e)
  })

  /*
  memwatch.on('leak', (e) => {
    console.log('LEAK', e)
  })
  */
}

console.log('Server initialized done')
