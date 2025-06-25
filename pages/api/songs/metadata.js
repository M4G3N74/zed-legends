import NodeID3 from 'node-id3';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (!res) return;
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { file: filePath, title, artist, album } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  try {
    // 1. Download the file from R2
    const getObjectParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filePath,
    };
    const { Body, ContentType } = await s3Client.send(new GetObjectCommand(getObjectParams));
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // 2. Update ID3 tags using node-id3
    const tags = {
      title: title,
      artist: artist,
      album: album,
    };
    
    const success = NodeID3.update(tags, fileBuffer);

    if (!success) {
      // If the update fails, we can still proceed but the tags won't be written.
      // Or we can return an error. Let's return an error for now.
      return res.status(500).json({ error: 'Failed to update ID3 tags' });
    }

    // 3. Upload the modified file back to R2
    const putObjectParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filePath,
      Body: success, // `success` here is the new buffer with updated tags
      ContentType: ContentType || 'audio/mpeg',
    };
    await s3Client.send(new PutObjectCommand(putObjectParams));

    res.status(200).json({ success: true, message: 'Metadata updated and written to file.' });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({ error: 'Failed to process metadata update.' });
  }
} 