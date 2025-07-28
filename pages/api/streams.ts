import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface StreamData {
  count: number;
  title: string;
  artist: string;
  lastPlayed: string;
}

interface StreamsRecord {
  [songId: string]: StreamData;
}

interface TopSong extends StreamData {
  id: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const streamsFile = path.join(process.cwd(), 'streams.json');
    
    let streams: StreamsRecord = {};
    try {
      const data = fs.readFileSync(streamsFile, 'utf8');
      streams = JSON.parse(data);
    } catch (e) {
      // File doesn't exist, return empty
    }

    // Calculate total streams
    const totalStreams = Object.values(streams).reduce((sum, song) => sum + song.count, 0);
    
    // Get top songs
    const topSongs: TopSong[] = Object.entries(streams)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json({
      totalStreams,
      totalSongs: Object.keys(streams).length,
      topSongs,
      allStreams: streams
    });
    
  } catch (error) {
    console.error('Streams fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
}