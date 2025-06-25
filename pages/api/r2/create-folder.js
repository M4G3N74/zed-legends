import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize the S3 client for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { folderPath } = req.body;

  if (!folderPath || typeof folderPath !== 'string' || !folderPath.endsWith('/')) {
    return res.status(400).json({ error: 'Invalid folder path. It must be a string ending with a /.' });
  }

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: folderPath, // e.g., 'artists/new-artist/'
      Body: '', // Creating an empty object to represent the folder
    });

    await s3Client.send(command);

    res.status(201).json({ message: 'Folder created successfully' });
  } catch (error) {
    console.error('Error creating folder in R2:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
} 