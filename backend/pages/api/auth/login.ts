import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure the request is a POST request
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await dbConnect();

    const { email, password } = req.body;

    // --- Input Validation ---
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // --- Find User by Email ---
    // Use .select('+password') to explicitly include the password, as it's excluded by default
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Use a generic error message to prevent email enumeration
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // --- Verify Password ---
    const isPasswordCorrect = await bcrypt.compare(password, user.password!);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // --- Generate JWT Token ---
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // --- Send Success Response ---
    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}