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
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        // Return default preferences if none exist
        const preferences = data || {
          theme: 'dark',
          volume: 1.0,
          shuffle_enabled: false,
          repeat_mode: 'none',
          crossfade_duration: 0,
          equalizer_preset: 'flat',
          auto_play: true
        };

        res.status(200).json({ preferences });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      try {
        const preferences = req.body;
        const { data, error } = await supabase
          .from('user_preferences')
          .upsert({ 
            user_id: userId, 
            ...preferences,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        res.status(200).json({ preferences: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}