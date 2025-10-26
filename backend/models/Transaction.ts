// backend/models/Transaction.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Schema.Types.ObjectId;
  amount: number;
  type: 'income' | 'expense';
  category: string; // This will now be for 'Food', 'Salary', etc.
  description?: string;
  date: Date;
  // This is the new field.
  // If null, it's a personal transaction.
  // If it has an ID, it's linked to a customer.
  customer?: mongoose.Schema.Types.ObjectId;
}

const TransactionSchema: Schema<ITransaction> = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  
  // --- THIS IS THE CORRECTED PART ---
  // We removed the 'ledger' field.
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer', // Links to the Customer model
    default: null, // Default to null (personal transaction)
  },
  // --- END OF CHANGE ---

}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);