/* eslint-env node, mocha */
import mongoose from 'mongoose'

before(function (done) {
  mongoose.Promise = Promise
  mongoose.connect(`mongodb://localhost/redro2_test`, {useMongoClient: true})
  .then(() => { done() })
})

after(function (done) {
  mongoose.disconnect()
  .then(account => { done() })
})
