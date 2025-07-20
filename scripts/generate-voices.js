// A simpler script to pre-generate DJ voices
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { DJ_MESSAGES, SONG_INTRO_MESSAGES } from '../lib/constants/djMessages.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create cache directory if it doesn't exist
const CACHE_DIR = path.join(__dirname, '..', 'public', 'voice-cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Sample song data for intro messages
const sampleSongs = [
  { title: 'Sample Song', artist: 'Sample Artist' },
  { title: 'Another Track', artist: 'Cool Artist' },
  { title: 'Great Tune', artist: 'Amazing Band' }
];

async function generateVoice(text, voiceId = 'EXAVITQu4vr4xnSDxMaL') {
  // Create a hash of the text and voiceId to use as filename
  const hash = crypto.createHash('md5').update(`${text}-${voiceId}`).digest('hex');
  const cacheFilePath = path.join(CACHE_DIR, `${hash}.mp3`);
  
  // Check if file exists in cache
  if (fs.existsSync(cacheFilePath)) {
    console.log(`Already cached: ${text}`);
    return `/voice-cache/${hash}.mp3`;
  }
  
  // If not in cache, generate from ElevenLabs
  const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!API_KEY) {
    console.error('ElevenLabs API key not found');
    return null;
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
      return null;
    }
    
    // Get audio as buffer and save to cache
    const audioBuffer = await response.arrayBuffer();
    fs.writeFileSync(cacheFilePath, Buffer.from(audioBuffer));
    
    console.log(`Cached: ${text}`);
    return `/voice-cache/${hash}.mp3`;
  } catch (error) {
    console.error('Voice generation error:', error);
    return null;
  }
}

async function main() {
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