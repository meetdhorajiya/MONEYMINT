import type { NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import withAuth, { NextApiRequestWithUser } from '@/middleware/withAuth';

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;
  const userId = req.userId;

  // Verify ownership
  const transaction = await Transaction.findOne({ _id: id, user: userId });
  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaction not found or you do not have permission to access it.' });
  }

  switch (req.method) {
    case 'GET':
      return res.status(200).json({ success: true, data: transaction });

    case 'PUT':
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        return res.status(200).json({ success: true, data: updatedTransaction });
      } catch (error: unknown) {
        if (error instanceof Error) {
          return res.status(400).json({ success: false, message: 'Error updating transaction.', error: error.message });
        }
        return res.status(400).json({ success: false, message: 'Error updating transaction.' });
      }

    case 'DELETE':
      try {
        await Transaction.deleteOne({ _id: id });
        return res.status(200).json({ success: true, message: 'Transaction deleted successfully.' });
      } catch {
        return res.status(500).json({ success: false, message: 'Error deleting transaction.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);