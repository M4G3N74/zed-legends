require('dotenv').config();

const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const mm = require('music-metadata');
const crypto = require('crypto');
// Correctly import p-limit for CommonJS
const pLimit = require('p-limit');

// --- CONFIGURATION ---
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL || 'https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev';
const CONCURRENCY_LIMIT = 10; // Number of files to process in parallel
const AUDIO_FILE_EXTENSIONS = /\.(mp3|wav|flac|m4a)$/i;

// --- INITIALIZATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Initialize p-limit
const limit = pLimit(CONCURRENCY_LIMIT);

// --- HELPER FUNCTIONS ---

/**
 * Lists all audio files from the R2 bucket.
 * @returns {Promise<string[]>} A list of file keys.
 */
async function listAudioFiles() {
  console.log(`Fetching file list from R2 bucket: ${R2_BUCKET_NAME}...`);
  const command = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME });
  const { Contents } = await s3Client.send(command);

  if (!Contents || Contents.length === 0) {
    console.log('No files found in R2 bucket.');
    return [];
  }

  return Contents
    .filter(file => AUDIO_FILE_EXTENSIONS.test(file.Key))
    .map(file => file.Key);
}

/**
 * Processes a single audio file from R2 to extract metadata.
 * @param {string} fileKey - The key of the file in the R2 bucket.
 * @returns {Promise<{songData: object, error: string|null}>}
 */
async function processFile(fileKey) {
  try {
    const getCommand = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: fileKey });
    const { Body } = await s3Client.send(getCommand);

    const metadata = await mm.parseStream(Body, { path: fileKey });
    const { common, format } = metadata;

    const songId = crypto.createHash('md5').update(fileKey).digest('hex');

    const songData = {
      id: songId,
      path: fileKey,
      title: common.title || 'Unknown Title',
      artist: common.artist || 'Unknown Artist',
      album: common.album || 'Unknown Album',
      duration: format.duration || 0,
      url: `${PUBLIC_R2_BASE_URL}/${encodeURIComponent(fileKey)}`,
      album_art: '/images/album-art.png', // Placeholder
    };

    return { songData, error: null };
  } catch (err) {
    console.error(`Error processing file ${fileKey}: ${err.message}`);
    return { songData: null, error: err.message, fileKey };
  }
}

/**
 * Deletes songs from the database that no longer exist in R2.
 * @param {Set<string>} r2FileKeys - A set of all current file keys in R2.
 */
async function cleanupDatabase(r2FileKeys) {
  console.log('Checking for songs to delete from the database...');
  const { data: dbSongs, error } = await supabase.from('songs').select('path');

  if (error) {
    console.error(`Failed to fetch songs from DB for cleanup: ${error.message}`);
    return;
  }

  const dbPaths = new Set(dbSongs.map(s => s.path));
  const pathsToDelete = [...dbPaths].filter(path => !r2FileKeys.has(path));

  if (pathsToDelete.length > 0) {
    console.log(`Deleting ${pathsToDelete.length} songs from DB that no longer exist in R2.`);
    const { error: deleteError } = await supabase.from('songs').delete().in('path', pathsToDelete);
    if (deleteError) {
      console.error(`Failed to delete old songs: ${deleteError.message}`);
    } else {
      console.log('Successfully deleted old songs.');
    }
  } else {
    console.log('No old songs to delete from the database.');
  }
}


// --- MAIN SYNC LOGIC ---

async function syncSongs() {
  console.log('Starting sync from R2 to Database...');
  const startTime = Date.now();

  try {
    const r2FileKeys = await listAudioFiles();
    if (r2FileKeys.length === 0) {
      console.log('Sync finished: No audio files to process.');
      return;
    }
    console.log(`Found ${r2FileKeys.length} audio files to process.`);

    const processingPromises = r2FileKeys.map(fileKey => limit(() => processFile(fileKey)));
    const results = await Promise.allSettled(processingPromises);

    const songsToUpsert = [];
    const invalidSongIdsToDelete = [];

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        const { songData, error, fileKey } = result.value;
        if (songData) {
          songsToUpsert.push(songData);
        } else if (error) {
          // This file is invalid or corrupt, mark it for deletion from DB
          const songId = crypto.createHash('md5').update(fileKey).digest('hex');
          invalidSongIdsToDelete.push(songId);
        }
      } else if (result.status === 'rejected') {
        console.error(`A critical error occurred during file processing:`, result.reason);
      }
    });

    // Batch upsert valid songs
    if (songsToUpsert.length > 0) {
      console.log(`Upserting ${songsToUpsert.length} valid songs to the database...`);
      const { error } = await supabase.from('songs').upsert(songsToUpsert, { onConflict: 'id' });
      if (error) {
        console.error(`Failed to batch upsert songs: ${error.message}`);
      } else {
        console.log('Successfully synced valid songs.');
      }
    }

    // Batch delete invalid songs
    if (invalidSongIdsToDelete.length > 0) {
      console.log(`Deleting ${invalidSongIdsToDelete.length} invalid songs from the database...`);
      const { error } = await supabase.from('songs').delete().in('id', invalidSongIdsToDelete);
      if (error) {
        console.error(`Failed to batch delete invalid songs: ${error.message}`);
      } else {
        console.log('Successfully cleaned up invalid songs.');
      }
    }

    // Clean up songs that are in DB but not in R2
    await cleanupDatabase(new Set(r2FileKeys));

  } catch (error) {
    console.error(`An unexpected error occurred during the sync process: ${error.message}`, error);
  } finally {
    const duration = (Date.now() - startTime) / 1000;
    console.log(`Sync completed in ${duration.toFixed(2)} seconds.`);
  }
}

// --- SCRIPT EXECUTION ---

if (require.main === module) {
  syncSongs();
}

module.exports = { syncSongs };
