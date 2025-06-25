import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const prefix = req.query.prefix || '';

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/', // This is the key to treating the bucket like a file system
    });
    
    const { Contents, CommonPrefixes } = await s3Client.send(command);
    
    // Combine files and folders into a single response
    const files = Contents || [];
    const folders = (CommonPrefixes || []).map(p => ({ Key: p.Prefix, isFolder: true }));

    res.status(200).json([...folders, ...files]);
  } catch (error) {
    console.error('Error listing R2 files:', error);
    res.status(500).json({ error: 'Failed to list files from R2' });
  }
} 