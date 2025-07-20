// API endpoint to track user interactions with songs
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
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
    
    console.log(`Tracking ${interactionType} interaction for song ${songId} by user ${userId}`);
    
    // Store interaction in Supabase
    const { error } = await supabase
      .from('song_interactions')
      .insert({
        user_id: userId,
        song_id: songId,
        interaction_type: interactionType,
        timestamp: timestamp || new Date().toISOString()
      });
    
    if (error) {
      console.error('Error storing interaction:', error);
      
      // If table doesn't exist, create it
      if (error.code === '42P01') {
        console.log('Creating song_interactions table...');
        
        // Create the table using SQL
        await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.song_interactions (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id TEXT NOT NULL,
              song_id TEXT NOT NULL,
              interaction_type TEXT NOT NULL CHECK (interaction_type IN ('play', 'skip', 'like')),
              timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_song_interactions_user_id ON public.song_interactions(user_id);
            CREATE INDEX IF NOT EXISTS idx_song_interactions_song_id ON public.song_interactions(song_id);
          `
        });
        
        // Try inserting again
        const { error: retryError } = await supabase
          .from('song_interactions')
          .insert({
            user_id: userId,
            song_id: songId,
            interaction_type: interactionType,
            timestamp: timestamp || new Date().toISOString()
          });
        
        if (retryError) {
          console.error('Error storing interaction after table creation:', retryError);
          return res.status(500).json({ error: 'Failed to store interaction' });
        }
      } else {
        return res.status(500).json({ error: 'Failed to store interaction' });
      }
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}