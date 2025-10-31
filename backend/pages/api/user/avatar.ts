import type { NextApiResponse } from 'next';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { InputFile } from 'node-appwrite/file';
import { Permission, Role } from 'node-appwrite';
import dbConnect from '@/lib/dbConnect';
import { getAvatarBucketId, getStorage } from '@/lib/appwrite';
import { computeAvatarUrl, serializeUser } from '@/lib/avatarUrl';
import withAuth, { NextApiRequestWithUser } from '@/middleware/withAuth';
import User from '@/models/User';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb',
    },
  },
};

function parseBase64Image(data: string) {
  const matches = data.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid image payload. Expecting a base64 data URL string.');
  }

  const mime = matches[1];
  const payload = matches[2];
  if (!mime.startsWith('image/')) {
    throw new Error('Only image uploads are supported.');
  }

  const buffer = Buffer.from(payload, 'base64');
  if (buffer.length === 0) {
    throw new Error('Empty image payload received.');
  }

  const extension = mime.split('/')[1] ?? 'png';
  return { buffer, mimeType: mime, extension };
}

function resolveErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

async function handleGet(req: NextApiRequestWithUser, res: NextApiResponse) {
  await dbConnect();
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const streamQuery = Array.isArray(req.query.stream) ? req.query.stream[0] : req.query.stream;
  const shouldStream = Boolean(streamQuery && ['1', 'true', 'yes'].includes(streamQuery.toLowerCase()));

  if (shouldStream) {
    if (!user.avatarId) {
      return res.status(404).json({ message: 'No avatar uploaded.' });
    }

    const bucketId = getAvatarBucketId();
    const storage = getStorage();

    try {
      const [fileBuffer, fileMeta] = await Promise.all([
        storage.getFileView(bucketId, user.avatarId),
        storage.getFile(bucketId, user.avatarId),
      ]);

      const buffer = Buffer.from(fileBuffer);
      res.setHeader('Content-Type', fileMeta.mimeType ?? 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Length', String(buffer.length));
      return res.status(200).send(buffer);
    } catch (error: unknown) {
      console.error('Failed to stream avatar from Appwrite:', error);
      return res.status(500).json({ message: resolveErrorMessage(error, 'Failed to load avatar.') });
    }
  }

  return res.status(200).json({
    success: true,
    avatarUrl: computeAvatarUrl(user),
  });
}

async function handleDelete(req: NextApiRequestWithUser, res: NextApiResponse) {
  await dbConnect();
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const bucketId = getAvatarBucketId();
  const storage = getStorage();

  if (user.avatarId) {
    try {
      await storage.deleteFile(bucketId, user.avatarId);
    } catch (error: unknown) {
      console.error('Failed to delete avatar from Appwrite:', error);
    }
  }

  user.avatarId = null;
  user.avatarUrl = null;
  user.avatarUpdatedAt = null;
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Avatar removed successfully.',
    user: serializeUser(user),
  });
}

async function handlePost(req: NextApiRequestWithUser, res: NextApiResponse) {
  const { image } = req.body as { image?: string };

  if (!image) {
    return res.status(400).json({ message: 'Image data is required.' });
  }

  const { buffer, extension } = parseBase64Image(image);

  await dbConnect();
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const bucketId = getAvatarBucketId();
  const storage = getStorage();
  const userId = String(user._id);

  if (user.avatarId) {
    try {
      await storage.deleteFile(bucketId, user.avatarId);
    } catch (error: unknown) {
      console.warn('Unable to delete previous avatar from Appwrite.', error);
    }
  }

  const fileId = randomUUID();
  const fileName = `avatar-${user._id}.${extension}`;

  const createdFile = await storage.createFile(
    bucketId,
    fileId,
    InputFile.fromBuffer(buffer, fileName),
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  );

  user.avatarId = createdFile.$id;
  user.avatarUpdatedAt = new Date();
  user.avatarUrl = computeAvatarUrl(user);
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Avatar updated successfully.',
    user: serializeUser(user),
  });
}

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    try {
      return await handlePost(req, res);
    } catch (error: unknown) {
      console.error('Avatar upload failed', error);
      return res.status(500).json({ message: resolveErrorMessage(error, 'Failed to upload avatar.') });
    }
  }

  if (req.method === 'DELETE') {
    try {
      return await handleDelete(req, res);
    } catch (error: unknown) {
      console.error('Avatar delete failed', error);
      return res.status(500).json({ message: resolveErrorMessage(error, 'Failed to remove avatar.') });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}

export default withAuth(handler);
