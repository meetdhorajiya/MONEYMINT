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
    const { newName, currentPassword } = req.body;
    const userId = req.userId;

    if (!newName || !currentPassword) {
      return res.status(400).json({ message: 'New name and current password are required.' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password!);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // --- THIS IS THE NEW VALIDATION CHECK ---
    if (newName.trim().toLowerCase() === user.name.toLowerCase()) {
        return res.status(400).json({ message: 'New name cannot be the same as the current name.' });
    }
    // --- END OF CHECK ---

    user.name = newName.trim();
    await user.save();

    res.status(200).json({ success: true, message: 'Name updated successfully.', user: { name: user.name, email: user.email } });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
}

export default withAuth(handler);