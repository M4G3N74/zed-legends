import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import path from 'path';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  throw new Error('Missing one or more required environment variables: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME');
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (!res) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    // Parse query params
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 per page
    const search = req.query.search ? req.query.search.toLowerCase() : '';
    const sortBy = req.query.sortBy || 'artist';

    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      MaxKeys: 100, // Limit results to prevent timeouts
    });
    const { Contents } = await s3Client.send(command);

    // Find all image files in the bucket for album art
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    const imageFiles = (Contents || []).filter(object => imageExtensions.some(ext => object.Key.toLowerCase().endsWith(ext)));

    let songs = (Contents || [])
      .filter(object => /\.(mp3|wav|flac|ogg|m4a)$/i.test(object.Key))
      .map((object, index) => {
        const fileName = object.Key;
        const title = path.basename(fileName, path.extname(fileName));
        // Try to find a matching image file for album art
        const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        const matchingImage = imageFiles.find(img => {
          const imgBase = img.Key.substring(0, img.Key.lastIndexOf('.'));
          return imgBase === baseName;
        });
        const albumArt = matchingImage
          ? `https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev/${encodeURI(matchingImage.Key)}`
          : '/images/album-art.png';
        return {
          id: index,
          path: fileName,
          title: title,
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: 0,
          cover: '/images/album-art.png',
          albumArt,
          url: `https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev/${encodeURI(fileName)}`,
        };
      });

    // Filter by search
    if (search) {
      songs = songs.filter(song =>
        song.title.toLowerCase().includes(search) ||
        song.artist.toLowerCase().includes(search) ||
        song.album.toLowerCase().includes(search)
      );
    }

    // Sort
    songs.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return aVal.localeCompare(bVal);
    });

    const totalSongs = songs.length;
    const totalPages = Math.ceil(totalSongs / limit);
    const startIndex = (page - 1) * limit;
    const paginatedSongs = songs.slice(startIndex, startIndex + limit);

    res.status(200).json({
      songs: paginatedSongs,
      totalSongs,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching songs from R2:', error);
    res.status(500).json({ error: 'Failed to fetch songs from R2' });
  }
} 