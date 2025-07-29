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
    case 'GET':
      try {
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
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        res.status(200).json({ playlist: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { name, description, is_public } = req.body;
        const { data, error } = await supabase
          .from('playlists')
          .update({ name, description, is_public, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        res.status(200).json({ playlist: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { error } = await supabase
          .from('playlists')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
        res.status(200).json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}