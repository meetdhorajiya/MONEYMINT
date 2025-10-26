// backend/pages/api/customers/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import withAuth from '../../../middleware/withAuth';
import dbConnect from '../../../lib/dbConnect';
import Customer from '../../../models/Customer';
import mongoose from 'mongoose';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const userId = (req as any).userId;

  switch (req.method) {
    case 'GET':
      // ... (This case is unchanged)
      try {
        const customers = await Customer.find({ 
          user: new mongoose.Types.ObjectId(userId) 
        }).sort({ name: 1 });
        
        return res.status(200).json({ success: true, data: customers });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server Error' });
      }

    case 'POST':
      try {
        const { name } = req.body; // <-- Removed 'phone'

        if (!name) {
          return res.status(400).json({ success: false, message: 'Name is required.' });
        }

        const newCustomer = await Customer.create({
          name,
          // <-- Removed 'phone'
          user: new mongoose.Types.ObjectId(userId),
        });

        return res.status(201).json({ success: true, data: newCustomer });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server Error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
}

export default withAuth(handler);