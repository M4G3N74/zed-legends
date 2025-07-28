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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { songId, title, artist } = req.body;

  if (!songId) {
    return res.status(400).json({ error: 'Song ID required' });
  }

  try {
    const streamsFile = path.join(process.cwd(), 'streams.json');
    
    let streams: StreamsRecord = {};
    try {
      const data = fs.readFileSync(streamsFile, 'utf8');
      streams = JSON.parse(data);
    } catch (e) {
      // File doesn't exist, start fresh
    }

    // Increment stream count
    if (!streams[songId]) {
      streams[songId] = {
        count: 0,
        title: title || 'Unknown',
        artist: artist || 'Unknown',
        lastPlayed: new Date().toISOString()
      };
    }
    
    streams[songId].count += 1;
    streams[songId].lastPlayed = new Date().toISOString();
    
    // Save back to file
    fs.writeFileSync(streamsFile, JSON.stringify(streams, null, 2));
    
    res.status(200).json({ 
      success: true, 
      count: streams[songId].count 
    });
    
  } catch (error) {
    console.error('Stream tracking error:', error);
    res.status(500).json({ error: 'Failed to track stream' });
  }
}