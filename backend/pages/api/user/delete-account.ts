// backend/pages/api/user/delete-account.ts

import type { NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import Transaction from '../../../models/Transaction'; // Import Transaction model
import withAuth, { NextApiRequestWithUser } from '../../../middleware/withAuth';

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { currentPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword) {
      return res.status(400).json({ message: 'Password is required to delete account.' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password!);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // --- Cascade Delete: Remove all data associated with the user ---
    
    // 1. Delete all of the user's transactions
    await Transaction.deleteMany({ user: userId });

    // 2. Delete the user document itself
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: 'Account deleted successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
}

export default withAuth(handler);