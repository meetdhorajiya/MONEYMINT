import { Client, Storage } from 'node-appwrite';

let storageInstance: Storage | null = null;
let clientInstance: Client | null = null;

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const bucketId = process.env.APPWRITE_BUCKET_ID;

export function getAppwriteClient(): Client {
  if (!endpoint || !projectId || !apiKey) {
    throw new Error('Appwrite environment variables are missing. Please set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY.');
  }

  if (!clientInstance) {
    clientInstance = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
  }

  return clientInstance;
}

export function getStorage(): Storage {
  if (!storageInstance) {
    storageInstance = new Storage(getAppwriteClient());
  }
  return storageInstance;
}

export function getAvatarBucketId(): string {
  if (!bucketId) {
    throw new Error('APPWRITE_BUCKET_ID is not set.');
  }
  return bucketId;
}

