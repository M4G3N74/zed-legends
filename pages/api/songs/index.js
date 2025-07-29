import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { apiEndpoints } from '../../../lib/api';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

console.log('API /api/songs hit - using R2 direct listing');

export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
  
  // CORS headers (restrict in production)
  const allowedOrigins = [
    'http://localhost:3000',
    'https://zed-legends.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const page = Math.max(1, Math.min(parseInt(req.query.page, 10) || 1, 1000));
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 50, 100));
    const search = (req.query.search || '').toString().trim().substring(0, 100);
    const pageSize = Math.min(limit, 100);

    console.log(`Fetching songs from R2: page=${page}, limit=${limit}, search='${search}'`);

    // Get all songs from R2
    const Bucket = process.env.R2_BUCKET_NAME;
    let allSongs = [];
    let ContinuationToken = undefined;

    do {
      const command = new ListObjectsV2Command({ Bucket, ContinuationToken });
      const data = await s3Client.send(command);

      const mp3s = (data.Contents || [])
        .filter(obj => obj.Key.endsWith('.mp3') && !obj.Key.toLowerCase().includes('mixdown'))
        .map(obj => {
          const filename = obj.Key.split('/').pop().replace('.mp3', '');
          const parts = filename.split(' - ');
          return {
            id: obj.Key,
            title: parts[1] || filename,
            artist: parts[0] || 'Unknown Artist',
            album: 'Unknown Album',
            path: obj.Key,
            url: `https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev/${encodeURIComponent(obj.Key)}`,
            size: obj.Size,
            lastModified: obj.LastModified,
          };
        });

      allSongs = allSongs.concat(mp3s);
      ContinuationToken = data.IsTruncated ? data.NextContinuationToken : undefined;
    } while (ContinuationToken);

    // Filter by search if provided
    let filteredSongs = allSongs;
    if (search && search.trim().length > 0) {
      const searchLower = search.toLowerCase().trim();
      filteredSongs = allSongs.filter(song => 
        (song.title || '').toLowerCase().includes(searchLower) ||
        (song.artist || '').toLowerCase().includes(searchLower) ||
        (song.album || '').toLowerCase().includes(searchLower)
      );
    }

    // Sort songs
    const sortBy = req.query.sortBy || 'title';
    const [sortField, sortOrder] = sortBy.split(':');
    const isAscending = sortOrder !== '-1';
    
    filteredSongs.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'artist':
          aValue = a.artist || '';
          bValue = b.artist || '';
          break;
        case 'album':
          aValue = a.album || '';
          bValue = b.album || '';
          break;
        case 'title':
        default:
          aValue = a.title || '';
          bValue = b.title || '';
          break;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return isAscending ? comparison : -comparison;
    });

    // Paginate
    const from = (page - 1) * pageSize;
    const paginatedSongs = filteredSongs.slice(from, from + pageSize);

    console.log('Songs fetched from R2:', paginatedSongs.length);
    console.log('Total filtered count:', filteredSongs.length);

    res.status(200).json({
      songs: paginatedSongs,
      totalSongs: filteredSongs.length,
      page,
      pageSize,
      hasMore: from + pageSize < filteredSongs.length
    });

  } catch (error) {
    console.error('API /api/songs general error:', error);
    res.status(500).json({ error: 'Failed to fetch songs from the database.', details: error.message });
  }
}