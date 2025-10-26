// backend/models/Customer.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  user: mongoose.Schema.Types.ObjectId;
}

const CustomerSchema: Schema<ICustomer> = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    trim: true,
  },
  // We removed the 'phone' field
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);