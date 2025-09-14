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

    const { name, email, password } = req.body;

    // --- Input Validation ---
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // --- Check for Existing User ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email.' });
    }

    // --- Hash Password and Create User ---
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // --- Generate JWT Token ---
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // --- Send Success Response ---
    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });

  } catch (error) {
    console.error('Signup API Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}