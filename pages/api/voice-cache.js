import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Create cache directory if it doesn't exist
const CACHE_DIR = path.join(process.cwd(), 'public', 'voice-cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

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
      const cacheFilePath = path.join(CACHE_DIR, `${hash}.mp3`);
      const cacheUrl = `/voice-cache/${hash}.mp3`;
      
      // Check if file exists in cache
      if (fs.existsSync(cacheFilePath)) {
        return res.status(200).json({ url: cacheUrl, cached: true });
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
      
      // Get audio as buffer and save to cache
      const audioBuffer = await response.arrayBuffer();
      fs.writeFileSync(cacheFilePath, Buffer.from(audioBuffer));
      
      return res.status(200).json({ url: cacheUrl, cached: false });
    } catch (error) {
      console.error('Voice cache error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  res.setHeader('Allow', ['POST']);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}