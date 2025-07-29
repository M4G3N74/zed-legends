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
          return res.status(200).json({ favorites: [] });
        }
        
        const { data, error } = await supabase
          .from('favorites')
          .select(`
            id,
            song_id,
            created_at,
            songs (*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ favorites: data });
      } catch (error: any) {
        res.status(200).json({ favorites: [] });
      }
      break;

    case 'POST':
      try {
        if (!supabase) {
          return res.status(200).json({ favorite: { id: 'temp', song_id: req.body.song_id } });
        }
        
        const { song_id } = req.body;
        const { data, error } = await supabase
          .from('favorites')
          .insert({ user_id: userId, song_id })
          .select()
          .single();

        if (error) throw error;
        res.status(201).json({ favorite: data });
      } catch (error: any) {
        res.status(200).json({ favorite: { id: 'temp', song_id: req.body.song_id } });
      }
      break;

    case 'DELETE':
      try {
        if (!supabase) {
          return res.status(200).json({ success: true });
        }
        
        const { song_id } = req.body;
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('song_id', song_id);

        if (error) throw error;
        res.status(200).json({ success: true });
      } catch (error: any) {
        res.status(200).json({ success: true });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}