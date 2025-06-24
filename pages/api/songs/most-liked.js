import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), 'data/user-interactions.json');

export default async function handler(req, res) {
  try {
    let interactions = [];
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      try {
        interactions = JSON.parse(raw);
      } catch (e) {
        interactions = [];
      }
    }

    // Filter for all 'like' interactions
    const likes = interactions.filter(i => i.interactionType === 'like');
    // Count likes per song (site-wide)
    const likeCounts = {};
    likes.forEach(i => {
      likeCounts[i.songId] = (likeCounts[i.songId] || 0) + 1;
    });
    // Sort songIds by like count descending and take top 10
    const mostLiked = Object.entries(likeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([songId]) => songId);

    res.status(200).json({ mostLiked });
  } catch (error) {
    console.error('Error fetching most liked songs:', error);
    res.status(500).json({ error: 'Failed to fetch most liked songs' });
  }
} 