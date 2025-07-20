// Script to migrate existing voice files from local filesystem to Supabase
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local cache directory
const CACHE_DIR = path.join(__dirname, '..', 'public', 'voice-cache');

// Supabase bucket name
const BUCKET_NAME = 'voice-cache';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateVoices() {
  console.log('Starting migration of voice files to Supabase...');
  
  // Check if local cache directory exists
  if (!fs.existsSync(CACHE_DIR)) {
    console.error(`Local cache directory not found: ${CACHE_DIR}`);
    return;
  }
  
  // Check if bucket exists, create if not
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log(`Creating bucket: ${BUCKET_NAME}`);
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true
    });
  }
  
  // Get list of files in local cache
  const files = fs.readdirSync(CACHE_DIR).filter(file => file.endsWith('.mp3'));
  console.log(`Found ${files.length} voice files to migrate`);
  
  // Upload each file to Supabase
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const filePath = path.join(CACHE_DIR, file);
    const fileContent = fs.readFileSync(filePath);
    
    try {
      // Check if file already exists in Supabase
      const { data: existingFiles } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list('', {
          search: file
        });
      
      if (existingFiles && existingFiles.length > 0) {
        console.log(`File already exists in Supabase: ${file}`);
        successCount++;
        continue;
      }
      
      // Upload file to Supabase
      const { error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(file, fileContent, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`Error uploading ${file}:`, error);
        errorCount++;
      } else {
        console.log(`Successfully uploaded: ${file}`);
        successCount++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      errorCount++;
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Migration complete: ${successCount} successful, ${errorCount} failed`);
}

migrateVoices().catch(console.error);