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
    console.log(`Attempting to download ${filePath} from R2...`);
    const getObjectParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filePath,
    };
    const { Body, ContentType } = await s3Client.send(new GetObjectCommand(getObjectParams));
    console.log('File downloaded successfully.');
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);
    console.log(`File buffered. Size: ${fileBuffer.length} bytes.`);

    // 2. Update ID3 tags using node-id3
    const tags = {
      title: title,
      artist: artist,
      album: album,
    };
    
    console.log('Attempting to update ID3 tags...');
    const updatedBuffer = NodeID3.update(tags, fileBuffer);

    if (!updatedBuffer) {
      console.error('NodeID3.update failed and returned false.');
      return res.status(500).json({ error: 'Failed to update ID3 tags' });
    }
    console.log(`ID3 tags updated. New buffer size: ${updatedBuffer.length} bytes.`);

    // 3. Upload the modified file back to R2
    console.log(`Attempting to upload updated file back to R2 at ${filePath}...`);
    const putObjectParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filePath,
      Body: updatedBuffer, // Use the new buffer with updated tags
      ContentType: ContentType || 'audio/mpeg',
    };
    await s3Client.send(new PutObjectCommand(putObjectParams));
    console.log('File uploaded successfully.');

    res.status(200).json({ success: true, message: 'Metadata updated and written to file.' });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({ error: 'Failed to process metadata update.' });
  }
} 