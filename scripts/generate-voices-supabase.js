// Script to pre-generate DJ voices and store them in Supabase
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { DJ_MESSAGES, SONG_INTRO_MESSAGES } from '../lib/constants/djMessages.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'voice-cache';

// Sample song data for intro messages
const sampleSongs = [
  { title: 'Sample Song', artist: 'Sample Artist' },
  { title: 'Another Track', artist: 'Cool Artist' },
  { title: 'Great Tune', artist: 'Amazing Band' }
];

async function generateVoice(text, voiceId = 'EXAVITQu4vr4xnSDxMaL') {
  // Create a hash of the text and voiceId to use as filename
  const hash = crypto.createHash('md5').update(`${text}-${voiceId}`).digest('hex');
  const fileName = `${hash}.mp3`;
  
  // Check if file exists in Supabase storage
  const { data: existingFiles } = await supabase
    .storage
    .from(BUCKET_NAME)
    .list('', {
      search: fileName
    });
  
  if (existingFiles && existingFiles.length > 0) {
    console.log(`Already cached in Supabase: ${text}`);
    return true;
  }
  
  // If not in cache, generate from ElevenLabs
  const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!API_KEY) {
    console.error('ElevenLabs API key not found');
    return false;
  }
  
  console.log(`Generating voice for: ${text}`);
  
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
      console.error(`Failed to generate voice: ${response.status}`);
      return false;
    }
    
    // Get audio as buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Upload to Supabase storage
    const { error: uploadError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(fileName, Buffer.from(audioBuffer), {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return false;
    }
    
    console.log(`Cached in Supabase: ${text}`);
    return true;
  } catch (error) {
    console.error('Voice generation error:', error);
    return false;
  }
}

async function main() {
  // Check if bucket exists, create if not
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log(`Creating bucket: ${BUCKET_NAME}`);
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true
    });
  }
  
  const phrasesToGenerate = [];
  
  // Add welcome messages
  Object.values(DJ_MESSAGES).forEach(messages => {
    messages.forEach(msg => phrasesToGenerate.push(msg));
  });
  
  // Add song intro messages
  SONG_INTRO_MESSAGES.forEach(introFn => {
    sampleSongs.forEach(song => {
      phrasesToGenerate.push(introFn(song));
    });
  });
  
  // Add some DJ catchphrases
  const catchphrases = [
    "That's how we do it!",
    "You know the vibes!",
    "This is what I'm talking about!",
    "DJ Purple approved!",
    "Let me know if you're feeling this!",
    "This is my jam right here!",
    "The beat doesn't stop!",
    "Music is life, am I right?",
    "We're just getting started!",
    "Perfect morning energy right here!",
    "This is how we do afternoons!",
    "Evening vibes on point with this one!",
    "Late night session getting real with this track!"
  ];
  
  catchphrases.forEach(phrase => phrasesToGenerate.push(phrase));
  
  // Generate all phrases
  console.log(`Generating ${phrasesToGenerate.length} phrases...`);
  
  for (const phrase of phrasesToGenerate) {
    await generateVoice(phrase);
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Done generating phrases!');
}

main().catch(console.error);