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

  switch (method) {
    case 'GET':
      try {
        if (!supabase) {
          return res.status(200).json({ recently_played: [] });
        }
        
        const { data, error } = await supabase
          .from('recently_played')
          .select(`
            *,
            songs (*)
          `)
          .eq('user_id', userId)
          .order('played_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        res.status(200).json({ recently_played: data });
      } catch (error: any) {
        res.status(200).json({ recently_played: [] });
      }
      break;

    case 'POST':
      try {
        if (!supabase) {
          return res.status(200).json({ recently_played: { id: 'temp', song_id: req.body.song_id } });
        }
        
        const { song_id } = req.body;
        const { data, error } = await supabase
          .from('recently_played')
          .upsert({ 
            user_id: userId, 
            song_id,
            played_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        res.status(201).json({ recently_played: data });
      } catch (error: any) {
        res.status(200).json({ recently_played: { id: 'temp', song_id: req.body.song_id } });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}