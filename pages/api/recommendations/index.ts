import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const userId = req.headers.authorization?.replace('Bearer ', '');

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { song_id } = req.query;

    if (song_id) {
      // Get recommendations based on a specific song
      const { data: currentSong } = await supabase
        .from('songs')
        .select('*')
        .eq('id', song_id)
        .single();

      if (!currentSong) {
        return res.status(404).json({ error: 'Song not found' });
      }

      // Find similar songs by same artist or genre
      const { data: recommendations } = await supabase
        .from('songs')
        .select('*')
        .or(`artist.eq.${currentSong.artist},genre.eq.${currentSong.genre}`)
        .neq('id', song_id)
        .limit(20);

      res.status(200).json({ recommendations: recommendations || [] });
    } else {
      // Get general recommendations based on user's listening history
      const { data: topArtists } = await supabase
        .from('play_history')
        .select(`
          songs!inner(artist)
        `)
        .eq('user_id', userId)
        .limit(5);

      const artists = topArtists?.map(p => p.songs.artist) || [];
      
      if (artists.length > 0) {
        const { data: recommendations } = await supabase
          .from('songs')
          .select('*')
          .in('artist', artists)
          .limit(20);

        res.status(200).json({ recommendations: recommendations || [] });
      } else {
        // Fallback to popular songs
        const { data: recommendations } = await supabase
          .from('songs')
          .select('*')
          .limit(20);

        res.status(200).json({ recommendations: recommendations || [] });
      }
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}