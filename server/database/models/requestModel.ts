import { Document, model, Schema, Types } from 'mongoose'

interface RequestInterface extends Document {
  _id: Types.ObjectId

  // Properties
  quantity: number 
  clientName: String

  // References
  requestType: Types.ObjectId

  // Timestamps
  createdAt: Date
  updatedAt: Date

  // Timestamps for Statuses
  deletedAt: Date
  fulfilledAt: Date
}

const requestSchema = new Schema({
  // Properties
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  clientName: {
    type: String,
    required: true
  },

  // References
  requestType: {
    type: Types.ObjectId, ref: 'RequestType'
  },

  // Timestamps for Statuses
  deletedAt: {
    type: Date
  },
  fulfilledAt: {
    type: Date
  },

}, // Options
{
  timestamps: true
})

const Request = model<RequestInterface>('Request', requestSchema)

export { Request, RequestInterface }
