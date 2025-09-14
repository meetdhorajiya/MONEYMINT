import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt from 'jsonwebtoken';

// Extend the NextApiRequest type to include our custom 'userId' property
export interface NextApiRequestWithUser extends NextApiRequest {
  userId?: string;
}

const withAuth = (handler: NextApiHandler) => {
  return async (req: NextApiRequestWithUser, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token is required.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      req.userId = decoded.userId; // Attach userId to the request object
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
};

export default withAuth;