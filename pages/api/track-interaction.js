// Track User Interaction API endpoint
// This endpoint receives user interaction data (plays, skips, likes, dislikes)
// and stores it for use by the smart shuffle algorithm

import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, songId, interactionType, timestamp } = req.body;

    // Validate required fields
    if (!userId || !songId || !interactionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate interaction type
    const validInteractionTypes = ['play', 'skip', 'like', 'dislike'];
    if (!validInteractionTypes.includes(interactionType)) {
      return res.status(400).json({ error: 'Invalid interaction type' });
    }

    // Only store 'like' interactions in song_likes for now
    if (interactionType === 'like') {
      const { error } = await supabase.from('song_likes').insert([
        {
          song_id: songId,
          user_id: userId,
          created_at: timestamp || new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error('Supabase insert error:', error);
        return res.status(500).json({ error: 'Failed to save like interaction', details: error });
      }
    }

    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving interaction:', error);
    return res.status(500).json({ error: 'Failed to save interaction' });
  }
}
