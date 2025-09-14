import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Schema.Types.ObjectId; // Reference to the User model
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount.'],
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Please specify the transaction type.'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category.'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default (mongoose.models.Transaction as Model<ITransaction>) || mongoose.model<ITransaction>('Transaction', TransactionSchema);