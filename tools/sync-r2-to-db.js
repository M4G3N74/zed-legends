require('dotenv').config({ path: '.env.local' });

const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const mm = require('music-metadata');
const crypto = require('crypto');
const { Readable } = require('stream');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL || 'https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev';

// Helper to convert stream to buffer
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

async function syncSongs() {
  console.log('Starting sync from R2 to Database...');
  const logs = ['Sync started...'];

  try {
    // 1. List all objects in the R2 bucket
    const log_bucket = `Fetching file list from R2 bucket: ${R2_BUCKET_NAME}...`;
    console.log(log_bucket);
    logs.push(log_bucket);
    
    const listCommand = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME });
    const { Contents } = await s3Client.send(listCommand);

    if (!Contents || Contents.length === 0) {
      console.log('No files found in R2 bucket. Exiting.');
      logs.push('No files found in R2 bucket. Exiting.');
      return logs;
    }

    const audioFiles = Contents.filter(file =>
      /\.(mp3|wav|flac|m4a)$/i.test(file.Key)
    );

    const log_found = `Found ${audioFiles.length} audio files to process.`;
    console.log(log_found);
    logs.push(log_found);

    // 2. Process each file
    for (const file of audioFiles) {
      const log_processing = `Processing: ${file.Key}`;
      console.log(log_processing);
      logs.push(log_processing);

      try {
        // Download file from R2
        const getCommand = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: file.Key,
        });
        const { Body } = await s3Client.send(getCommand);
        
        const buffer = await streamToBuffer(Body);

        // Extract metadata
        const metadata = await mm.parseBuffer(buffer, file.Key.endsWith('.mp3') ? 'audio/mpeg' : undefined);
        const { common } = metadata;

        // Generate a stable ID from the file path
        const songId = crypto.createHash('md5').update(file.Key).digest('hex');
        
        let albumArtUrl = '/images/album-art.png';
        if (common.picture && common.picture.length > 0) {
          // Optionally, you could upload the image to R2 and set a URL here
          // For now, just note that embedded art exists
          // albumArtUrl = ...
        }

        const songData = {
          id: songId,
          path: file.Key,
          title: common.title || 'Unknown Title',
          artist: common.artist || 'Unknown Artist',
          album: common.album || 'Unknown Album',
          duration: metadata.format.duration || 0,
          url: `${PUBLIC_R2_BASE_URL}/${encodeURI(file.Key)}`,
          album_art: albumArtUrl,
        };

        // 3. Upsert data into Supabase
        const { error } = await supabase.from('songs').upsert(songData, { onConflict: 'id' });

        if (error) {
          const log_error = `Failed to upsert song ${file.Key}: ${error.message}`;
          console.error(log_error);
          logs.push(log_error);
        } else {
          const log_success = `Successfully synced: ${songData.title}`;
          console.log(log_success);
          logs.push(log_success);
        }
      } catch (err) {
        const log_file_error = `Error processing file ${file.Key}: ${err.message}`;
        console.error(log_file_error);
        logs.push(log_file_error);
      }
    }

    console.log('Sync completed successfully!');
    logs.push('Sync completed successfully!');
    return logs;

  } catch (error) {
    const log_unexpected = `An unexpected error occurred during the sync process: ${error.message}`;
    console.error(log_unexpected, error);
    logs.push(log_unexpected);
    return logs;
  }
}

// Only run sync directly if the script is called from the command line
if (require.main === module) {
  syncSongs();
}

module.exports = { syncSongs }; 
syncSongs(); 