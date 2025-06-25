import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fileKey } = req.body;

  if (!fileKey) {
    return res.status(400).json({ error: 'File key is required.' });
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
    });
    
    await s3Client.send(command);
    
    res.status(200).json({ success: true, message: `File '${fileKey}' deleted successfully.` });
  } catch (error) {
    console.error(`Error deleting file '${fileKey}' from R2:`, error);
    res.status(500).json({ error: `Failed to delete file '${fileKey}' from R2.` });
  }
} 