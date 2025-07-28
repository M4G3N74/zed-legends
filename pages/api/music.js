// pages/api/music.js
import fs from 'fs';
import path from 'path';
import musicMetadata from 'music-metadata';

const MUSIC_DIR = process.env.MUSIC_DIR || '/home/purple/Music';

async function getMusicFiles() {
  const files = await fs.promises.readdir(MUSIC_DIR);
  const musicFiles = files.filter(file => file.endsWith('.mp3') || file.endsWith('.flac') || file.endsWith('.m4a'));
  
  const songs = await Promise.all(musicFiles.map(async (file) => {
    const filePath = path.join(MUSIC_DIR, file);
    try {
      const metadata = await musicMetadata.parseFile(filePath);
      return {
        title: metadata.common.title || 'Unknown Title',
        artist: metadata.common.artist || 'Unknown Artist',
        album: metadata.common.album || 'Unknown Album',
        duration: metadata.format.duration,
        path: `/api/music/stream?file=${encodeURIComponent(file)}`,
      };
    } catch (error) {
      console.error(`Error parsing metadata for ${file}:`, error);
      return null;
    }
  }));

  return songs.filter(song => song !== null);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const songs = await getMusicFiles();
      res.status(200).json(songs);
    } catch (error) {
      console.error('Error getting music files:', error);
      res.status(500).json({ error: 'Failed to get music files' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}