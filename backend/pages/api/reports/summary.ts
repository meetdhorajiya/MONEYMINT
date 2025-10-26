// backend/pages/api/reports/summary.ts

import { NextApiRequest, NextApiResponse } from 'next';
import withAuth from '../../../middleware/withAuth';
import dbConnect from '../../../lib/dbConnect';
import Transaction from '../../../models/Transaction'; 
import mongoose from 'mongoose';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ... (rest of the file is correct)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await dbConnect();

  const userId = (req as any).userId; 

  try {
    const summary = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: '$type', 
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const report = {
      totalIncome:
        summary.find((item) => item._id === 'income')?.totalAmount || 0,
      totalExpense:
        summary.find((item) => item._id === 'expense')?.totalAmount || 0,
    };

    return res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report summary:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default withAuth(handler);