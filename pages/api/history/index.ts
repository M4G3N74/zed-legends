import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const userId = req.headers.authorization?.replace('Bearer ', '');

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('play_history')
          .select(`
            *,
            songs (*)
          `)
          .eq('user_id', userId)
          .order('played_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        res.status(200).json({ history: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      try {
        const { song_id, duration_played, completed } = req.body;
        const { data, error } = await supabase
          .from('play_history')
          .insert({ 
            user_id: userId, 
            song_id, 
            duration_played, 
            completed 
          })
          .select()
          .single();

        if (error) throw error;
        res.status(201).json({ history: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}