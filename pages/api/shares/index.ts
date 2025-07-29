import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const userId = req.headers.authorization?.replace('Bearer ', '');

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (method) {
    case 'POST':
      try {
        const { item_type, item_id, expires_at } = req.body;
        const { data, error } = await supabase
          .from('shares')
          .insert({ 
            user_id: userId, 
            item_type, 
            item_id,
            expires_at
          })
          .select()
          .single();

        if (error) throw error;
        res.status(201).json({ share: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'GET':
      try {
        const { token } = req.query;
        if (token) {
          const { data, error } = await supabase
            .from('shares')
            .select('*')
            .eq('share_token', token)
            .single();

          if (error) throw error;
          res.status(200).json({ share: data });
        } else {
          const { data, error } = await supabase
            .from('shares')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          res.status(200).json({ shares: data });
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}