import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  try {
    const Bucket = process.env.R2_BUCKET_NAME;
    let songs = [];
    let ContinuationToken = undefined;

    do {
      const command = new ListObjectsV2Command({ Bucket, ContinuationToken });
      const data = await s3Client.send(command);

      // Only include .mp3 files
      const mp3s = (data.Contents || [])
        .filter(obj => obj.Key.endsWith('.mp3'))
        .map(obj => ({
          key: obj.Key,
          url: `https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev/${encodeURIComponent(obj.Key)}`,
          size: obj.Size,
          lastModified: obj.LastModified,
        }));

      songs = songs.concat(mp3s);
      ContinuationToken = data.IsTruncated ? data.NextContinuationToken : undefined;
    } while (ContinuationToken);

    res.status(200).json({ songs });
  } catch (error) {
    console.error('Error listing R2 files:', error);
    res.status(500).json({ error: 'Failed to list songs from R2.' });
  }
} 