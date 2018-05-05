import mongoose from 'mongoose'

export const NodeDefaultEnableComponentsScheme = new mongoose.Schema(
  {
    enable: { type: Boolean, default: true },
    options: mongoose.Schema.Types.Mixed,
    id: mongoose.Schema.Types.ObjectId
  },
  { _id: false }
)

export const NodeDefaultDisableComponentsScheme = new mongoose.Schema(
  {
    enable: { type: Boolean, default: false },
    options: mongoose.Schema.Types.Mixed,
    id: mongoose.Schema.Types.ObjectId
  },
  { _id: false }
)

export const NodeComponentsScheme = new mongoose.Schema(
  {
    Input: NodeDefaultEnableComponentsScheme,
    Output: NodeDefaultEnableComponentsScheme,
    Inventory: NodeDefaultEnableComponentsScheme,
    Account: NodeDefaultEnableComponentsScheme,
    BiddingMarketProvider: NodeDefaultDisableComponentsScheme,
    BiddingMarketReceiver: NodeDefaultDisableComponentsScheme
  },
  { _id: false }
)

export const NodeScheme = new mongoose.Schema({
  name: {
    type: String,
    default: 'UnknownNodeName'
  },
  components: NodeComponentsScheme,
  time: {type: Date, default: Date.now}
})

const NodeModel = mongoose.model('node', NodeScheme)
export default NodeModel
