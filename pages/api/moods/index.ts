import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const userId = req.headers.authorization?.replace('Bearer ', '');

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('moods')
          .select('*')
          .order('name');

        if (error) throw error;
        res.status(200).json({ moods: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      try {
        const { song_id, mood_id } = req.body;
        const { data, error } = await supabase
          .from('song_moods')
          .upsert({ user_id: userId, song_id, mood_id })
          .select()
          .single();

        if (error) throw error;
        res.status(201).json({ song_mood: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}