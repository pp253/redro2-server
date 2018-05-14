import mongoose from 'mongoose'

export const MarketReceiverSchema = new mongoose.Schema({
  provider: {type: String, required: true}
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const MarketReceiverModel = mongoose.model('market_receiver', MarketReceiverSchema)
export default MarketReceiverModel
