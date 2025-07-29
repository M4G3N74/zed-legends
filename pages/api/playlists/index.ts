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
          return res.status(200).json({ playlists: [] });
        }
        
        const { data, error } = await supabase
          .from('playlists')
          .select(`
            *,
            playlist_songs (
              id,
              position,
              songs (*)
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ playlists: data });
      } catch (error: any) {
        res.status(200).json({ playlists: [] });
      }
      break;

    case 'POST':
      try {
        if (!supabase) {
          return res.status(200).json({ playlist: { id: 'temp', name: req.body.name } });
        }
        
        const { name, description, is_public } = req.body;
        const { data, error } = await supabase
          .from('playlists')
          .insert({ user_id: userId, name, description, is_public })
          .select()
          .single();

        if (error) throw error;
        res.status(201).json({ playlist: data });
      } catch (error: any) {
        res.status(200).json({ playlist: { id: 'temp', name: req.body.name } });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}