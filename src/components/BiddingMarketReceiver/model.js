import mongoose from 'mongoose'

export const BiddingMarketReceiverSchema = new mongoose.Schema({
  enableUpstream: {type: Boolean, default: false},
  upstreamProvider: String,
  enableDownstream: {type: Boolean, default: false},
  downstreamProvider: String
}, {
  // Fix a bug https://github.com/Automattic/mongoose/issues/5574
  usePushEach: true
})

const BiddingMarketReceiverModel = mongoose.model('bidding_market_receiver', BiddingMarketReceiverSchema)
export default BiddingMarketReceiverModel
