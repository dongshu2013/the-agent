import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});

export async function uploadFile(
  buffer: Buffer,
  path: string
): Promise<string> {
  if (!buffer || !path) {
    throw new Error('Buffer and path are required');
  }

  try {
    // Upload file to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType: 'image/jpeg'
    });

    await r2Client.send(uploadCommand);

    // Get signed URL for the uploaded file
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path
    });

    const url = await getSignedUrl(r2Client, getCommand, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw error;
  }
}

export async function getR2ImageUrl(path: string): Promise<string> {
  if (!path) return '';

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path
    });

    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return '';
  }
}