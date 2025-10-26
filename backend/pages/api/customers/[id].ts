// backend/pages/api/customers/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import withAuth from '../../../middleware/withAuth';
import dbConnect from '../../../lib/dbConnect';
import Customer from '../../../models/Customer';
import Transaction from '../../../models/Transaction';
import mongoose from 'mongoose';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ... (setup code is unchanged)
  await dbConnect();
  const userId = (req as any).userId;
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ success: false, message: 'Invalid customer ID' });
  }
  const customerId = new mongoose.Types.ObjectId(id as string);

  const customer = await Customer.findOne({ _id: customerId, user: userId });
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  // --- (end of setup) ---

  switch (req.method) {
    case 'GET':
      // ... (This case is unchanged)
      try {
        return res.status(200).json({ success: true, data: customer });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server Error' });
      }

    case 'PUT':
      try {
        const { name } = req.body; // <-- Removed 'phone'
        if (!name) {
          return res.status(400).json({ success: false, message: 'Name is required' });
        }

        customer.name = name;
        // customer.phone = phone; // <-- Removed this line
        await customer.save();
        
        return res.status(200).json({ success: true, data: customer });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server Error' });
      }

    case 'DELETE':
      // ... (This case is unchanged)
      try {
        await customer.deleteOne();
        await Transaction.deleteMany({
          user: userId,
          customer: customerId,
        });
        return res.status(200).json({ success: true, message: 'Customer and all associated transactions deleted' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server Error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
}

export default withAuth(handler);