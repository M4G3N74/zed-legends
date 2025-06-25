import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    // Fetch all likes from Supabase
    const { data: likes, error } = await supabase
      .from('song_likes')
      .select('song_id');
    if (error) throw error;

    // Count likes per song
    const likeCounts = {};
    likes.forEach(i => {
      likeCounts[i.song_id] = (likeCounts[i.song_id] || 0) + 1;
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