import { S3Client, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getUserWithRole } from '../../../lib/getUserWithRole';

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function renameFile(oldKey, newKey) {
  const copyCommand = new CopyObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    CopySource: `${process.env.R2_BUCKET_NAME}/${encodeURIComponent(oldKey)}`,
    Key: newKey,
  });
  await s3Client.send(copyCommand);

  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: oldKey,
  });
  await s3Client.send(deleteCommand);
}

async function renameFolder(oldPrefix, newPrefix) {
  let isTruncated = true;
  let continuationToken = undefined;

  while (isTruncated) {
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: oldPrefix,
      ContinuationToken: continuationToken,
    });

    const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(listCommand);

    if (Contents && Contents.length > 0) {
      // Copy objects to new prefix
      for (const file of Contents) {
        const newKey = file.Key.replace(oldPrefix, newPrefix);
        const copyCommand = new CopyObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          CopySource: `${process.env.R2_BUCKET_NAME}/${encodeURIComponent(file.Key)}`,
          Key: newKey,
        });
        await s3Client.send(copyCommand);
      }

      // Delete old objects in bulk
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Delete: {
          Objects: Contents.map(file => ({ Key: file.Key })),
          Quiet: false,
        },
      });
      const deleteResult = await s3Client.send(deleteCommand);
      
      if (deleteResult.Errors && deleteResult.Errors.length > 0) {
          console.error('Error deleting some objects:', deleteResult.Errors);
          throw new Error('Failed to delete some of the old objects.');
      }
    }

    isTruncated = IsTruncated;
    continuationToken = NextContinuationToken;
  }
}

export default async function handler(req, res) {
  const { user, role } = await getUserWithRole(req);
  if (!user || (role !== 'admin' && role !== 'mod1')) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { oldKey, newKey } = req.body;

  if (!oldKey || !newKey) {
    return res.status(400).json({ error: 'oldKey and newKey are required.' });
  }
  
  if (oldKey === newKey) {
    return res.status(400).json({ error: 'Old and new names cannot be the same.' });
  }

  try {
    const isFolder = oldKey.endsWith('/');

    if (isFolder) {
        if (!newKey.endsWith('/')) {
            return res.status(400).json({ error: 'New folder name must end with a /.' });
        }
        await renameFolder(oldKey, newKey);
    } else {
        if (newKey.endsWith('/')) {
            return res.status(400).json({ error: 'New file name cannot end with a /.' });
        }
        await renameFile(oldKey, newKey);
    }

    res.status(200).json({ message: 'Object renamed successfully' });
  } catch (error) {
    console.error(`Error renaming from ${oldKey} to ${newKey}:`, error);
    res.status(500).json({ error: 'Failed to rename object' });
  }
} 