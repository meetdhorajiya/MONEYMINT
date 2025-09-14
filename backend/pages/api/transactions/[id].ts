import type { NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import withAuth, { NextApiRequestWithUser } from '@/middleware/withAuth';

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query; // Get the transaction ID from the URL (e.g., /api/transactions/123)
  const userId = req.userId;

  // --- Security Check ---
  // Before any operation, find the transaction and ensure it belongs to the authenticated user.
  // This is the most important step to prevent users from accessing each other's data.
  const transaction = await Transaction.findOne({ _id: id, user: userId });

  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaction not found or you do not have permission to access it.' });
  }
  
  // --- Handle Request Methods ---
  switch (req.method) {
    case 'GET':
      // The security check already fetched the transaction, so we just return it.
      return res.status(200).json({ success: true, data: transaction });

    case 'PUT':
      try {
        // Find the specific transaction by its ID and update it with the new data
        const updatedTransaction = await Transaction.findByIdAndUpdate(id, req.body, {
          new: true, // Return the updated document
          runValidators: true, // Run schema validation on the update
        });
        return res.status(200).json({ success: true, data: updatedTransaction });
      } catch (error: any) {
        return res.status(400).json({ success: false, message: 'Error updating transaction.', error: error.message });
      }

    case 'DELETE':
      try {
        // Delete the transaction that we've already verified belongs to the user
        await Transaction.deleteOne({ _id: id });
        return res.status(200).json({ success: true, message: 'Transaction deleted successfully.' });
      } catch (error) {
        return res.status(500).json({ success: false, message: 'Error deleting transaction.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);