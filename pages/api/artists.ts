import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all songs from R2
    const Bucket = process.env.R2_BUCKET_NAME;
    let allSongs: any[] = [];
    let ContinuationToken: string | undefined = undefined;

    do {
      const command: ListObjectsV2Command = new ListObjectsV2Command({ Bucket, ContinuationToken });
      const data = await s3Client.send(command);

      const mp3s = (data.Contents || [])
        .filter(obj => obj.Key && obj.Key.endsWith('.mp3') && !obj.Key.toLowerCase().includes('mixdown'))
        .map(obj => {
          const filename = obj.Key!.split('/').pop()!.replace('.mp3', '');
          const parts = filename.split(' - ');
          return {
            id: obj.Key!,
            title: parts[1] || filename,
            artist: parts[0] || 'Unknown Artist',
            path: obj.Key!,
          };
        });

      allSongs = allSongs.concat(mp3s);
      ContinuationToken = (data as any).IsTruncated ? (data as any).NextContinuationToken : undefined;
    } while (ContinuationToken);

    // Get streaming data
    let streams: Record<string, any> = {};
    try {
      const streamsFile = path.join(process.cwd(), 'streams.json');
      const data = fs.readFileSync(streamsFile, 'utf8');
      streams = JSON.parse(data);
    } catch (e) {
      // No streams file
    }

    // Group by artist and calculate stats
    const artistStats: Record<string, any> = {};
    
    allSongs.forEach(song => {
      const artist = song.artist;
      if (!artistStats[artist]) {
        artistStats[artist] = {
          name: artist,
          songCount: 0,
          totalStreams: 0,
          songs: []
        };
      }
      
      artistStats[artist].songCount++;
      artistStats[artist].songs.push(song);
      
      // Add stream count if available
      if (streams[song.id] && streams[song.id].count) {
        artistStats[artist].totalStreams += streams[song.id].count;
      }
    });

    // Convert to array and sort by song count
    const artists = Object.values(artistStats).sort((a: any, b: any) => b.songCount - a.songCount);

    res.status(200).json({ artists });

  } catch (error) {
    console.error('Artists API error:', error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
}