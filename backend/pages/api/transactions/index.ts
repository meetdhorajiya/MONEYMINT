import type { NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import withAuth, { NextApiRequestWithUser } from '@/middleware/withAuth';

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  await dbConnect();
  // The `userId` is attached to the request by the `withAuth` middleware
  const userId = req.userId;

  switch (req.method) {
    case 'GET':
      try {
        // Find all transactions that belong to this user, sort by most recent
        const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
        return res.status(200).json({ success: true, data: transactions });
      } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' });
      }

    case 'POST':
      try {
        // Combine the request body with the user's ID to ensure ownership
        const transactionData = { ...req.body, user: userId };
        const transaction = await Transaction.create(transactionData);
        return res.status(201).json({ success: true, data: transaction });
      } catch (error: any) {
        // Handle potential validation errors from Mongoose
        return res.status(400).json({ success: false, message: error.message || 'Could not create transaction.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Wrap the handler with the authentication middleware to protect the route
export default withAuth(handler);