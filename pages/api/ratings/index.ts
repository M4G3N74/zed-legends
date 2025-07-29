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
          .from('song_ratings')
          .select(`
            *,
            songs (*)
          `)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ ratings: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      try {
        const { song_id, rating } = req.body;
        const { data, error } = await supabase
          .from('song_ratings')
          .upsert({ 
            user_id: userId, 
            song_id, 
            rating,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        res.status(201).json({ rating: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}