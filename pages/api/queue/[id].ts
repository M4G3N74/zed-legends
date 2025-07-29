import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const { id } = query;
  const userId = req.headers.authorization?.replace('Bearer ', '');

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (method) {
    case 'DELETE':
      try {
        const { error } = await supabase
          .from('user_queue')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
        res.status(200).json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { position } = req.body;
        const { data, error } = await supabase
          .from('user_queue')
          .update({ position })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        res.status(200).json({ queue_item: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}