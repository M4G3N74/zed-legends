import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // GET - Retrieve all pronunciation guides
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('pronunciations')
        .select('*');
      
      if (error) throw error;
      return res.status(200).json({ pronunciations: data || [] });
    } catch (error) {
      console.error('Error fetching pronunciations:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // POST - Add or update a pronunciation guide
  if (req.method === 'POST') {
    try {
      const { originalText, pronunciation, type } = req.body;
      
      if (!originalText || !pronunciation || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      if (!['artist', 'song'].includes(type)) {
        return res.status(400).json({ error: 'Type must be either "artist" or "song"' });
      }
      
      // Check if pronunciation already exists
      const { data: existing } = await supabase
        .from('pronunciations')
        .select('*')
        .eq('originalText', originalText)
        .single();
      
      let result;
      if (existing) {
        // Update existing pronunciation
        const { data, error } = await supabase
          .from('pronunciations')
          .update({ pronunciation, updatedAt: new Date().toISOString() })
          .eq('id', existing.id)
          .select();
        
        if (error) throw error;
        result = data[0];
      } else {
        // Insert new pronunciation
        const { data, error } = await supabase
          .from('pronunciations')
          .insert({
            originalText,
            pronunciation,
            type,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system'
          })
          .select();
        
        if (error) throw error;
        result = data[0];
      }
      
      return res.status(200).json({ success: true, pronunciation: result });
    } catch (error) {
      console.error('Error saving pronunciation:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE - Remove a pronunciation guide
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Pronunciation ID required' });
      }
      
      const { error } = await supabase
        .from('pronunciations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting pronunciation:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}