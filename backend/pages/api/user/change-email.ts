// backend/pages/api/user/change-email.ts

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
    const { newEmail, currentPassword } = req.body;
    const userId = req.userId;

    // 1. Validate input
    if (!newEmail || !currentPassword) {
      return res.status(400).json({ message: 'New email and current password are required.' });
    }

    // 2. Fetch the current user with their password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 3. Verify the current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password!);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // 4. Check if the new email is already in use
    if (newEmail.toLowerCase() === user.email) {
        return res.status(400).json({ message: 'New email cannot be the same as the current email.' });
    }
    const emailExists = await User.findOne({ email: newEmail.toLowerCase() });
    if (emailExists) {
      return res.status(409).json({ message: 'This email is already in use.' });
    }

    // 5. Update the email
    user.email = newEmail;
    await user.save();

    res.status(200).json({ success: true, message: 'Email updated successfully.', user: { name: user.name, email: user.email } });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
}

export default withAuth(handler);