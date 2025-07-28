// API endpoint for debugging voice issues
export default async function handler(req, res) {
  // DJ functionality disabled
  return res.status(503).json({ error: 'DJ functionality has been disabled' });
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  try {
    // Get environment variables related to voice
    const voiceConfig = {
      elevenlabsApiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? 
        `${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY.substring(0, 5)}...` : 'Not set',
      autoDj: process.env.NEXT_PUBLIC_AUTO_DJ,
      djSpeakMode: process.env.NEXT_PUBLIC_DJ_SPEAK_MODE,
      djPersistent: process.env.NEXT_PUBLIC_DJ_PERSISTENT,
      djStartOnAudio: process.env.NEXT_PUBLIC_DJ_START_ON_AUDIO,
      djUseCachedVoices: process.env.NEXT_PUBLIC_DJ_USE_CACHED_VOICES,
      djCachedMessagesCount: process.env.NEXT_PUBLIC_DJ_CACHED_MESSAGES_COUNT,
      djEnabledInProd: process.env.NEXT_PUBLIC_DJ_ENABLED_IN_PROD,
      djEnabledInDev: process.env.NEXT_PUBLIC_DJ_ENABLED_IN_DEV,
      nodeEnv: process.env.NODE_ENV,
    };
    
    // Test connection to ElevenLabs API
    let elevenlabsStatus = 'unknown';
    let elevenlabsError = null;
    
    try {
      const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      if (API_KEY) {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'xi-api-key': API_KEY
          }
        });
        
        if (response.ok) {
          elevenlabsStatus = 'connected';
        } else {
          elevenlabsStatus = 'error';
          elevenlabsError = `Status ${response.status}: ${response.statusText}`;
        }
      } else {
        elevenlabsStatus = 'no_api_key';
      }
    } catch (error) {
      elevenlabsStatus = 'error';
      elevenlabsError = error.message;
    }
    
    // Test Supabase storage connection
    let supabaseStatus = 'unknown';
    let supabaseError = null;
    
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { data, error } = await supabase
        .storage
        .getBucket('voice-cache');
      
      if (error) {
        supabaseStatus = 'error';
        supabaseError = error.message;
      } else {
        supabaseStatus = 'connected';
      }
    } catch (error) {
      supabaseStatus = 'error';
      supabaseError = error.message;
    }
    
    // Return debug information
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      voiceConfig,
      elevenlabs: {
        status: elevenlabsStatus,
        error: elevenlabsError
      },
      supabase: {
        status: supabaseStatus,
        error: supabaseError
      }
    });
  } catch (error) {
    console.error('Voice debug error:', error);
    return res.status(500).json({ error: error.message });
  }
}