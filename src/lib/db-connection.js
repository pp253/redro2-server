import mongoose from 'mongoose'

// Connecting to MongoDB
mongoose.Promise = Promise
mongoose.connect(`mongodb://localhost/redro2`, {useMongoClient: true})
.then(() => { console.log(`Connecting to MongoDB.`) })
.catch(() => { console.error(`Failed to connect to MongoDB.`) })
