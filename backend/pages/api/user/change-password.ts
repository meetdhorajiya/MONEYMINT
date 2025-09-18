// backend/pages/api/user/change-password.ts

import type { NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import withAuth, { NextApiRequestWithUser } from '../../../middleware/withAuth';

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'All fields are required and the new password must be at least 6 characters.' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password!);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect current password.' });
    }

    // This new block prevents using the same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as the current password.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
}

export default withAuth(handler);