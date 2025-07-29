import { NextApiRequest, NextApiResponse } from 'next';

let supabase: any = null;
try {
  const { supabase: sb } = require('../../../lib/supabase');
  supabase = sb;
} catch (error) {
  console.warn('Supabase not configured, using fallback');
}

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
    if (!supabase) {
      return res.status(200).json({
        stats: {
          totalPlays: 0,
          todayListeningTime: 0,
          topArtists: [],
          topSongs: []
        }
      });
    }
    
    // Total play count
    const { count: totalPlays } = await supabase
      .from('play_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Top artists
    const { data: topArtists } = await supabase
      .from('play_history')
      .select(`
        songs!inner(artist),
        count
      `)
      .eq('user_id', userId)
      .limit(10);

    // Top songs
    const { data: topSongs } = await supabase
      .from('play_history')
      .select(`
        song_id,
        songs!inner(*),
        count
      `)
      .eq('user_id', userId)
      .limit(10);

    // Listening time today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayStats } = await supabase
      .from('play_history')
      .select('duration_played')
      .eq('user_id', userId)
      .gte('played_at', today);

    const todayListeningTime = todayStats?.reduce((sum, play) => sum + (play.duration_played || 0), 0) || 0;

    res.status(200).json({
      stats: {
        totalPlays: totalPlays || 0,
        todayListeningTime,
        topArtists: topArtists || [],
        topSongs: topSongs || []
      }
    });
  } catch (error: any) {
    res.status(200).json({
      stats: {
        totalPlays: 0,
        todayListeningTime: 0,
        topArtists: [],
        topSongs: []
      }
    });
  }
}