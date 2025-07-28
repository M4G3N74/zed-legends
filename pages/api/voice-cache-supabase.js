import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'voice-cache';

export default async function handler(req, res) {
  // DJ functionality disabled
  return res.status(503).json({ error: 'DJ functionality has been disabled' });
  
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
        } else {
          // File does not exist, generate it using ElevenLabs
          console.log(`Voice file not found in cache: ${fileName}. Generating...`);
          
          const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
          const VOICE_GENERATION_URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'EXAVITQu4vr4xnSDxMaL'}`;

          if (!ELEVENLABS_API_KEY) {
            console.error('ElevenLabs API key not configured.');
            return res.status(500).json({ error: 'ElevenLabs API key not configured.' });
          }

          try {
            const elevenLabsResponse = await fetch(VOICE_GENERATION_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
              },
              body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2', // Or another appropriate model
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.75,
                },
              }),
            });

            if (!elevenLabsResponse.ok) {
              const errorData = await elevenLabsResponse.json();
              console.error('ElevenLabs API error:', errorData);
              return res.status(elevenLabsResponse.status).json({ error: 'Failed to generate voice from ElevenLabs.', details: errorData });
            }

            const audioBuffer = await elevenLabsResponse.arrayBuffer();
            
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(fileName, audioBuffer, {
                contentType: 'audio/mpeg',
                upsert: true, // Overwrite if exists (though it shouldn't if we got here)
              });

            if (uploadError) {
              console.error('Supabase upload error:', uploadError);
              return res.status(500).json({ error: 'Failed to upload voice to cache.', details: uploadError.message });
            }

            // Get public URL
            const { data: urlData } = await supabase.storage
              .from(BUCKET_NAME)
              .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;
            const proxiedUrl = `/api/cors-proxy?url=${encodeURIComponent(publicUrl)}`;

            console.log('Successfully generated and cached voice file:', fileName);
            console.log('Cached URL:', publicUrl);
            console.log('Proxied URL:', proxiedUrl);

            return res.status(200).json({ url: proxiedUrl, cached: false });

          } catch (elevenLabsError) {
            console.error('Error during ElevenLabs voice generation or upload:', elevenLabsError);
            return res.status(500).json({ error: 'Internal server error during voice generation.', details: elevenLabsError.message });
          }
        }
      } catch (error) {
        console.error('Error checking cache:', error);
        // If there's an error checking the cache, we should probably not proceed to generation.
        return res.status(500).json({ error: 'Error checking voice cache.' });
      }
    } catch (error) {
      console.error('Voice cache error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  res.setHeader('Allow', ['POST']);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
