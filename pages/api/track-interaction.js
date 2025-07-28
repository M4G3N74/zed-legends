// API endpoint to track user interactions with songs
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client WITH SERVICE KEY to bypass RLS for diagnostics
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  
  try {
    const { userId, songId, interactionType, timestamp } = req.body;
    
    // Validate required fields
    if (!userId || !songId || !interactionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate interaction type
    if (!['play', 'skip', 'like'].includes(interactionType)) {
      return res.status(400).json({ error: 'Invalid interaction type' });
    }
    
    console.log(`Tracking ${interactionType} interaction for song ${songId} by user ${userId} using SERVICE KEY`);
    
    // Store interaction in Supabase
    const { data, error } = await supabase
      .from('song_interactions')
      .insert({
        user_id: userId,
        song_id: songId,
        interaction_type: interactionType,
        timestamp: timestamp || new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('--- Supabase Error (with Service Key) ---');
      console.error('Error object:', JSON.stringify(error, null, 2));
      console.error('--- End Supabase Error ---');
      
      return res.status(500).json({ 
        error: 'Failed to store interaction even with service key.', 
        details: error
      });
    }
    
    console.log('Interaction stored successfully (with Service Key):', data);
    return res.status(200).json({ success: true, data });
    
  } catch (error) {
    console.error('Unexpected error in handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
