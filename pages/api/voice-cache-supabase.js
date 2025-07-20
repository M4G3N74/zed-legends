import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'voice-cache';

export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  if (req.method === 'POST') {
    try {
      const { text, voiceId } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }
      
      // Create a hash of the text and voiceId to use as filename
      const hash = crypto.createHash('md5').update(`${text}-${voiceId || 'default'}`).digest('hex');
      const fileName = `${hash}.mp3`;
      
      // Check if file exists in Supabase storage
      try {
        const { data } = await supabase
          .storage
          .from(BUCKET_NAME)
          .list('', { search: fileName });
          
        if (data && data.length > 0) {
          // File exists, get public URL
          const { data: urlData } = await supabase
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);
            
          // Create a proxied URL to avoid CORS issues
          const publicUrl = urlData.publicUrl;
          const proxiedUrl = `/api/cors-proxy?url=${encodeURIComponent(publicUrl)}`;
          
          console.log('Found cached voice file:', fileName);
          console.log('Cached URL:', publicUrl);
          console.log('Proxied URL:', proxiedUrl);
            
          return res.status(200).json({ url: proxiedUrl, cached: true });
        }
      } catch (error) {
        console.error('Error checking cache:', error);
        // Continue to generation if check fails
      }
      
      // If not in cache, generate from ElevenLabs
      const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      if (!API_KEY) {
        return res.status(500).json({ error: 'ElevenLabs API key not found' });
      }
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'EXAVITQu4vr4xnSDxMaL'}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.4
          }
        })
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to generate voice' });
      }
      
      // Get audio as buffer
      const audioBuffer = await response.arrayBuffer();
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(fileName, Buffer.from(audioBuffer), {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload voice file' });
      }
      
      // Get public URL
      const { data: urlData } = await supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);
      
      // Create a proxied URL to avoid CORS issues
      const publicUrl = urlData.publicUrl;
      const proxiedUrl = `/api/cors-proxy?url=${encodeURIComponent(publicUrl)}`;
      
      console.log('Generated new voice file:', fileName);
      console.log('Public URL:', publicUrl);
      console.log('Proxied URL:', proxiedUrl);
      
      return res.status(200).json({ url: proxiedUrl, cached: false });
    } catch (error) {
      console.error('Voice cache error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  res.setHeader('Allow', ['POST']);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}