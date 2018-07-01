import mongoose from 'mongoose'

export const NodeComponentItemScheme = new mongoose.Schema(
  {
    type: {type: String, required: true},
    enable: { type: Boolean, default: false },
    options: mongoose.Schema.Types.Mixed,
    id: mongoose.Schema.Types.ObjectId
  },
  { _id: false }
)

export const NodeScheme = new mongoose.Schema({
  /**
   * name should be unique in an engine.
   */
  name: {type: String, default: 'UnknownNodeName'},
  components: [NodeComponentItemScheme],
  time: {type: Date, default: Date.now},
  id: mongoose.Schema.Types.ObjectId,
  workers: {type: Number, default: 10},
  wage: {type: Number, default: 100}
})

const NodeModel = mongoose.model('node', NodeScheme)
export default NodeModel
