import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function calculateFolderSize(prefix) {
  let totalSize = 0;
  let isTruncated = true;
  let continuationToken = undefined;

  while (isTruncated) {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);

    if (Contents) {
      totalSize += Contents.reduce((acc, file) => acc + file.Size, 0);
    }

    isTruncated = IsTruncated;
    continuationToken = NextContinuationToken;
  }

  return totalSize;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prefix } = req.query;

  if (!prefix) {
    return res.status(400).json({ error: 'Prefix is required' });
  }

  try {
    const totalSize = await calculateFolderSize(prefix);
    res.status(200).json({ prefix, totalSize });
  } catch (error) {
    console.error(`Error calculating size for prefix ${prefix}:`, error);
    res.status(500).json({ error: `Failed to calculate folder size for ${prefix}` });
  }
} 