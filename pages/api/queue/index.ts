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
          .from('user_queue')
          .select(`
            *,
            songs (*)
          `)
          .eq('user_id', userId)
          .order('position');

        if (error) throw error;
        res.status(200).json({ queue: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      try {
        const { song_id, position } = req.body;
        const { data, error } = await supabase
          .from('user_queue')
          .insert({ user_id: userId, song_id, position })
          .select()
          .single();

        if (error) throw error;
        res.status(201).json({ queue_item: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { error } = await supabase
          .from('user_queue')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
        res.status(200).json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}