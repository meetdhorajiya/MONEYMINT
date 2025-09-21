import type { NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import withAuth, { NextApiRequestWithUser } from '@/middleware/withAuth';

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  await dbConnect();
  const userId = req.userId;

  switch (req.method) {
    case 'GET':
      try {
        const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
        return res.status(200).json({ success: true, data: transactions });
      } catch {
        return res.status(500).json({ success: false, message: 'Server Error' });
      }

    case 'POST':
      try {
        const transactionData = { ...req.body, user: userId };
        const transaction = await Transaction.create(transactionData);
        return res.status(201).json({ success: true, data: transaction });
      } catch (error: unknown) {
        if (error instanceof Error) {
          return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(400).json({ success: false, message: 'Could not create transaction.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);