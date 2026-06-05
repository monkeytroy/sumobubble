import { S3 } from '@aws-sdk/client-s3';

/**
 * Get the s3 client to access objects
 * Could use DigitalOcean spaces, AWS S3 or other S3 compatable object storage.
 * @returns
 */
export const getS3Client = () => {
  const s3Client = new S3({
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    endpoint: process.env.SPACES_ENDPOINT,
    region: process.env.SPACES_REGION,
    credentials: {
      accessKeyId: process.env.SPACES_KEY || '',
      secretAccessKey: process.env.SPACES_SECRET || ''
    }
  });

  return s3Client;
};
