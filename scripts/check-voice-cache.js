// Script to check the voice-cache bucket in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'voice-cache';

async function checkVoiceCache() {
  console.log('Checking voice-cache bucket in Supabase...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    const bucket = buckets.find(b => b.name === BUCKET_NAME);
    
    if (!bucket) {
      console.log(`Bucket '${BUCKET_NAME}' does not exist. Creating it...`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
      
      console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' exists.`);
      
      // Check if bucket is public
      if (!bucket.public) {
        console.log('Bucket is not public. Updating...');
        const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
          public: true
        });
        
        if (updateError) {
          console.error('Error updating bucket:', updateError);
        } else {
          console.log('Bucket updated to public.');
        }
      } else {
        console.log('Bucket is already public.');
      }
    }
    
    // List files in bucket
    const { data: files, error: filesError } = await supabase.storage.from(BUCKET_NAME).list();
    
    if (filesError) {
      console.error('Error listing files:', filesError);
      return;
    }
    
    console.log(`Found ${files.length} files in bucket:`);
    files.slice(0, 10).forEach(file => {
      console.log(`- ${file.name} (${Math.round(file.metadata.size / 1024)} KB)`);
    });
    
    if (files.length > 10) {
      console.log(`... and ${files.length - 10} more files.`);
    }
    
    // Test getting a public URL
    if (files.length > 0) {
      const testFile = files[0];
      const { data: urlData } = await supabase.storage.from(BUCKET_NAME).getPublicUrl(testFile.name);
      console.log('Sample public URL:', urlData.publicUrl);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkVoiceCache().catch(console.error);