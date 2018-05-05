// import response from '../src/api/response'
// import validation from '../src/api/validator'

/*
function apiMethodWrapper(apiFunc, apiArgus) {
  return (req, res, next) => {
    let checkObj = {}
    let argusArr = []
    for (let key of apiArgus) {
      checkObj[key] = validation[key]
      argusArr.push(req.body[key])
    }

    return new Promise((resolve, reject) => {
      req.check(checkObj)

      req.getValidationResult().then(err => {
        if (!err.isEmpty()) {
          reject(
            response.ResponseErrorMsg.ApiArgumentValidationError(err.mapped())
          )
          return
        }

        resolve(apiFunc(...argusArr))
      })
    })
  }
}
*/
export default function initialize(app) {
  app.all('*', (req, res, next) => {
    console.log(req.ip, req.originalUrl)
    next()
  })

  app.post('/api/:module/:method', (req, res, next) => {
    const apiRoute = {}

    let moduleName = req.params.module
    let methodName = req.params.method
    if (moduleName in apiRoute && methodName in apiRoute[moduleName]) {
      apiRoute[moduleName][methodName](req, res, next)
        .then(result => {
          res.json(result)
        })
        .catch(err => {
          res.json(err)
        })
    } else {
      res.status(400)
      // .json(response.ResponseErrorMsg.ApiModuleNotExist(moduleName))
    }
  })

  app.get('/echo', function(req, res, next) {
    res.send('echo')
  })

  app.get('*', function(req, res, next) {
    res.status(404).send('404 NOT FOUND')
  })
}
