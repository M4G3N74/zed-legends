import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const { id } = query;
  const userId = req.headers.authorization?.replace('Bearer ', '');

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (method) {
    case 'POST':
      try {
        const { song_id, position } = req.body;
        
        // Verify playlist ownership
        const { data: playlist } = await supabase
          .from('playlists')
          .select('id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (!playlist) {
          return res.status(404).json({ error: 'Playlist not found' });
        }

        const { data, error } = await supabase
          .from('playlist_songs')
          .insert({ playlist_id: id, song_id, position })
          .select()
          .single();

        if (error) throw error;
        res.status(201).json({ playlist_song: data });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { song_id } = req.body;
        
        const { error } = await supabase
          .from('playlist_songs')
          .delete()
          .eq('playlist_id', id)
          .eq('song_id', song_id);

        if (error) throw error;
        res.status(200).json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}