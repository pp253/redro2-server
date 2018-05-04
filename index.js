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
// import memwatch from 'memwatch-next'
import routes from './routes'
import { PRODUCTION } from './src/lib/utils'

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
    customValidators: {}
  })
)

// Views
app.set('view engine', 'pug')
app.set('views', './views')

// Session
app.use(
  session({
    secret: 'nthu-select-course',
    resave: false,
    saveUninitialized: false
  })
)

// Setting
app.set('port', PRODUCTION ? 443 : 80)
app.set('title', 'NTHU SELECT COURSE')

// Static
app.use('/', express.static('public'))

// Route
routes(app)

if (PRODUCTION) {
  // Listening
  let httpsServer = https.createServer(
    {
      key: fs.readFileSync(path.join(__dirname, '/secret/private.key')),
      cert: fs.readFileSync(path.join(__dirname, '/secret/certificate.crt')),
      ca: fs.readFileSync(path.join(__dirname, '/secret/ca_bundle.crt'))
    },
    app
  )

  httpsServer.listen(app.get('port'), () => {
    console.log('Start to listen on PORT %d ...', app.get('port'))
  })

  // Auto redirect from port 80 to 443
  http
    .createServer((req, res) => {
      res.writeHead(301, {
        Location: 'https://' + req.headers['host'] + req.url
      })
      res.end()
    })
    .listen(80)
} else {
  app.listen(app.get('port'), () => {
    console.log('Start to listen on PORT %d ...', app.get('port'))
  })

  /*
  memwatch.on('leak', (e) => {
    console.log('LEAK', e)
  })
  */
}

console.log('Server initialized done')
