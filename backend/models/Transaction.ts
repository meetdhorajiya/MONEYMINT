// backend/models/Transaction.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Schema.Types.ObjectId;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: Date;
  ledger: string; // <-- ADD THIS
}

const TransactionSchema: Schema<ITransaction> = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  ledger: { type: String, required: true }, // <-- ADD THIS
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);