// Add this at the very top of your entry file
process.noDeprecation = true;

// Or to be more specific, only for this particular warning:
const originalEmit = process.emit;
process.emit = function(event, error) {
  if (event === 'warning' &&
      error &&
      error.name === 'DeprecationWarning' &&
      error.code === 'DEP0060') {
    return false;
  }
  return originalEmit.apply(process, arguments);
};

const http = require('http');
const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');
const { parseFile } = require('music-metadata');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const archiver = require('archiver');

const PORT = process.env.PORT || 3000;
const MUSIC_DIR = '/home/purple/Music';

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Set a timeout for the request to prevent hanging connections
  req.setTimeout(30000, () => {
    console.error('Request timeout reached for:', req.url);
    if (!res.headersSent) {
      res.writeHead(408, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request timeout' }));
    } else {
      res.end();
    }
  });

  // Add error handlers for the request and response
  req.on('error', (err) => {
    console.error('Request error:', err);
    try {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error', details: err.message }));
      } else {
        res.end();
      }
    } catch (e) {
      console.error('Error while handling request error:', e);
    }
  });

  res.on('error', (err) => {
    console.error('Response error:', err);
  });

  // Handle API requests
  if (req.url.startsWith('/api')) {
    try {
      return handleApiRequest(req, res);
    } catch (err) {
      console.error('Error in API request handler:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error', details: err.message }));
      } else {
        res.end();
      }
    }
  }

  // Handle music file requests
  if (req.url.startsWith('/music/')) {
    try {
      return handleMusicRequest(req, res);
    } catch (err) {
      console.error('Error in music request handler:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error', details: err.message }));
      } else {
        res.end();
      }
    }
  }

  // Serve static files
  let filePath;
  if (req.url === '/') {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else {
    filePath = path.join(__dirname, 'public', req.url);
  }

  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found
        fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf8');
    }
  });
});

// Handle API requests
function handleApiRequest(req, res) {
  // Set a timeout specifically for API requests
  const apiTimeoutId = setTimeout(() => {
    console.error('API request timeout reached for:', req.url);
    if (!res.headersSent) {
      res.writeHead(408, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API request timeout' }));
    } else {
      res.end();
    }
  }, 30000); // 30 seconds timeout

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const endpoint = url.pathname;

    console.log(`API Request: ${req.method} ${url.pathname}`);

    // Log query parameters if present
    if (url.search) {
      console.log('Query parameters:');
      for (const [key, value] of url.searchParams.entries()) {
        console.log(`- ${key}: ${value}`);
      }
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Add a listener to clear the timeout when the response ends
    res.on('finish', () => {
      clearTimeout(apiTimeoutId);
    });

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      clearTimeout(apiTimeoutId);
      return;
    }

    // API endpoints
    if (endpoint === '/api/songs' && req.method === 'GET') {
      // Get all songs
      getSongs(req, res);
    } else if (endpoint === '/api/songs' && req.method === 'DELETE') {
      // Delete a song
      deleteSong(req, res);
    } else if (endpoint === '/api/songs/metadata' && req.method === 'PUT') {
      // Update song metadata
      updateSongMetadata(req, res);
    } else if (endpoint === '/api/songs/download' && req.method === 'GET') {
      // Download a song
      downloadSong(req, res);
    } else if (endpoint === '/api/songs/download-all' && req.method === 'GET') {
      // Download all songs as a zip file
      downloadAllSongs(req, res);
    } else if (endpoint === '/api/cache/clear' && req.method === 'GET') {
      // Clear caches and force rescan
      const result = forceClearCaches();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      clearTimeout(apiTimeoutId);
    } else {
      // API endpoint not found
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
      clearTimeout(apiTimeoutId);
    }
  } catch (error) {
    console.error('Error in handleApiRequest:', error);

    // Only send response if headers haven't been sent yet
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }));
    } else {
      // If headers were already sent, just end the response
      res.end();
    }

    // Clear the timeout in case of error
    clearTimeout(apiTimeoutId);
  }
}

// Update song metadata
async function updateSongMetadata(req, res) {
  try {
    // Read the request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { filePath, title, artist, album } = data;

        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File path is required' }));
          return;
        }

        // Construct the full path to the file
        const fullPath = path.join(MUSIC_DIR, filePath);

        // Check if the file exists
        if (!fs.existsSync(fullPath)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File not found' }));
          return;
        }

        // Get the file extension
        const ext = path.extname(fullPath).toLowerCase();

        // Update metadata based on file type
        let success = false;
        let errorMessage = null;

        try {
          if (ext === '.mp3') {
            // Update MP3 ID3 tags using NodeID3
            const tags = {
              title: title || '',
              artist: artist || '',
              album: album || ''
            };

            success = NodeID3.write(tags, fullPath);
          } else if (ext === '.flac') {
            // Use metaflac (part of flac package) to update FLAC metadata
            // Check if metaflac is installed
            try {
              await execPromise('which metaflac');

              // Escape special characters in title, artist, and album
              const escapedTitle = title.replace(/"/g, '\\"');
              const escapedArtist = artist.replace(/"/g, '\\"');
              const escapedAlbum = album ? album.replace(/"/g, '\\"') : '';

              // Update FLAC metadata
              let command = `metaflac --remove-tag=TITLE --remove-tag=ARTIST`;
              if (album) command += ` --remove-tag=ALBUM`;

              command += ` --set-tag="TITLE=${escapedTitle}" --set-tag="ARTIST=${escapedArtist}"`;
              if (album) command += ` --set-tag="ALBUM=${escapedAlbum}"`;

              command += ` "${fullPath}"`;

              await execPromise(command);
              success = true;
            } catch (error) {
              console.error('Error using metaflac:', error);
              errorMessage = 'metaflac tool not found. Please install flac package.';
              success = false;
            }
          } else if (ext === '.m4a' || ext === '.mp4' || ext === '.m4b') {
            // Use AtomicParsley to update M4A/MP4 metadata
            try {
              await execPromise('which AtomicParsley');

              // Escape special characters in title, artist, and album
              const escapedTitle = title.replace(/"/g, '\\"');
              const escapedArtist = artist.replace(/"/g, '\\"');
              const escapedAlbum = album ? album.replace(/"/g, '\\"') : '';

              // Update M4A metadata
              let command = `AtomicParsley "${fullPath}" --title "${escapedTitle}" --artist "${escapedArtist}"`;
              if (album) command += ` --album "${escapedAlbum}"`;
              command += ` --overWrite`;

              await execPromise(command);
              success = true;
            } catch (error) {
              console.error('Error using AtomicParsley:', error);
              errorMessage = 'AtomicParsley tool not found. Please install AtomicParsley package.';
              success = false;
            }
          } else if (ext === '.ogg' || ext === '.oga') {
            // Use vorbiscomment (part of vorbis-tools) to update OGG metadata
            try {
              await execPromise('which vorbiscomment');

              // Create a temporary file for the comments
              const tempFile = path.join('/tmp', `vorbis_comments_${Date.now()}.txt`);

              // Extract existing comments
              await execPromise(`vorbiscomment -l "${fullPath}" > "${tempFile}"`);

              // Read the comments file
              let comments = fs.readFileSync(tempFile, 'utf8')
                .split('\n')
                .filter(line => !line.startsWith('TITLE=') && !line.startsWith('ARTIST=') && !line.startsWith('ALBUM='))
                .filter(Boolean);

              // Add new comments
              comments.push(`TITLE=${title}`);
              comments.push(`ARTIST=${artist}`);
              if (album) comments.push(`ALBUM=${album}`);

              // Write back to the comments file
              fs.writeFileSync(tempFile, comments.join('\n') + '\n');

              // Update the OGG file
              await execPromise(`vorbiscomment -w -c "${tempFile}" "${fullPath}"`);

              // Clean up
              fs.unlinkSync(tempFile);

              success = true;
            } catch (error) {
              console.error('Error using vorbiscomment:', error);
              errorMessage = 'vorbiscomment tool not found. Please install vorbis-tools package.';
              success = false;
            }
          } else if (ext === '.wav') {
            // WAV files don't have standard metadata tags
            // We could use BWF MetaEdit or similar tools, but for simplicity
            // we'll just rename the file to include the metadata in the filename

            // Only do this if both title and artist are provided
            if (title && artist) {
              const dir = path.dirname(fullPath);
              const newFilename = `${artist} - ${title}${ext}`;
              const newPath = path.join(dir, newFilename);

              // Rename the file
              fs.renameSync(fullPath, newPath);

              // Update the file path in the response
              data.filePath = newFilename;
              success = true;
            } else {
              errorMessage = 'Both title and artist are required for WAV files';
              success = false;
            }
          } else {
            errorMessage = `Unsupported file format: ${ext}`;
            success = false;
          }
        } catch (error) {
          console.error('Error updating metadata:', error);
          errorMessage = error.message;
          success = false;
        }

        if (success) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Metadata updated successfully',
            file: data.filePath || filePath,
            title,
            artist,
            album
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: errorMessage || 'Failed to update metadata',
            details: errorMessage
          }));
        }
      } catch (error) {
        console.error('Error parsing request body:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// Function to recursively get all audio files from a directory
async function getAllAudioFiles(dir, baseDir = null) {
  // If this is the top-level call, initialize the cache check
  if (baseDir === null) {
    baseDir = dir;

    // Use a cache to avoid rescanning the directory unnecessarily
    if (global.audioFilesCache && !global.forceRescan) {
      console.log(`Using cached audio files list with ${global.audioFilesCache.length} files`);
      return global.audioFilesCache;
    }

    console.log('Scanning music directory for audio files...');
  }

  let results = [];
  const processedPaths = new Set(); // Track processed paths to avoid duplicates

  // Read the directory contents
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      // Recursively scan subdirectories, but pass the original base directory
      const subDirFiles = await getAllAudioFiles(fullPath, baseDir);
      // Don't use concat as it creates a new array each time
      for (const file of subDirFiles) {
        if (!processedPaths.has(file)) {
          processedPaths.add(file);
          results.push(file);
        }
      }
    } else {
      // Check if it's an audio file
      const ext = path.extname(item.name).toLowerCase();
      if (['.mp3', '.wav', '.flac', '.ogg', '.m4a'].includes(ext)) {
        // Get the relative path from the music directory
        const relativePath = path.relative(baseDir, fullPath);

        // Only add if we haven't processed this path before
        if (!processedPaths.has(relativePath)) {
          processedPaths.add(relativePath);
          results.push(relativePath);
        }
      }
    }
  }

  // Only cache the results at the top level
  if (dir === baseDir) {
    console.log(`Found ${results.length} audio files`);
    global.audioFilesCache = results;
    global.forceRescan = false;
  }

  return results;
}

// Extract metadata from an audio file
async function extractMetadata(relativePath, fullPath) {
  try {
    const stats = fs.statSync(fullPath);
    const ext = path.extname(relativePath).toLowerCase();

    // Get folder information
    const folder = path.dirname(relativePath);
    const folderName = folder === '.' ? 'Root' : folder;

    // Default metadata from filename
    let artist = 'Unknown Artist';
    let title = path.basename(relativePath, path.extname(relativePath));
    let album = folderName;
    let albumArt = null;

    const parts = title.split(' - ');
    if (parts.length > 1) {
      artist = parts[0];
      title = parts.slice(1).join(' - ');
    }

    // Only extract full metadata for MP3 files to improve performance
    // For other formats, use filename-based metadata
    if (ext === '.mp3') {
      try {
        // Read ID3 tags for MP3 files
        const tags = NodeID3.read(fullPath);
        if (tags.title) title = tags.title;
        if (tags.artist) artist = tags.artist;
        if (tags.album) album = tags.album;

        // Extract album art if available, but limit size
        if (tags.image && tags.image.imageBuffer) {
          const imageBuffer = tags.image.imageBuffer;
          // Only include album art if it's not too large (< 100KB)
          if (imageBuffer.length < 100 * 1024) {
            const mimeType = tags.image.mime || 'image/jpeg';
            albumArt = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
          }
        }
      } catch (metadataError) {
        console.error(`Error reading MP3 metadata for ${relativePath}:`, metadataError);
        // Fall back to filename-based metadata
      }
    }

    return {
      title: title,
      artist: artist,
      album: album,
      folder: folderName,
      file: relativePath,
      path: `/music/${encodeURIComponent(relativePath)}`,
      size: stats.size,
      modified: stats.mtime,
      albumArt: albumArt
    };
  } catch (error) {
    console.error(`Error extracting metadata for ${relativePath}:`, error);
    return {
      title: path.basename(relativePath),
      artist: 'Unknown',
      album: 'Unknown',
      folder: 'Unknown',
      file: relativePath,
      path: `/music/${encodeURIComponent(relativePath)}`,
      size: 0,
      modified: new Date(),
      albumArt: null
    };
  }
}

// Get all songs from the music directory with pagination support and search
async function getSongs(req, res) {
  // Set a timeout specifically for this handler
  const timeoutId = setTimeout(() => {
    console.error('getSongs timeout reached');
    if (!res.headersSent) {
      res.writeHead(408, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request timeout in getSongs' }));
    } else {
      res.end();
    }
  }, 25000); // 25 seconds timeout

  try {
    // Create music directory if it doesn't exist
    if (!fs.existsSync(MUSIC_DIR)) {
      fs.mkdirSync(MUSIC_DIR, { recursive: true });
    }

    // Parse URL to get query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 50; // Default to 50 songs per page
    const sortBy = url.searchParams.get('sortBy') || 'artist'; // Default sort by artist
    const searchQuery = url.searchParams.get('search') || ''; // Search query

    console.log('Server received search request:');
    console.log('- URL:', req.url);
    console.log('- Search query:', searchQuery);
    console.log('- Page:', page);
    console.log('- Sort by:', sortBy);

    // Use cached song list if available and not searching
    const cacheKey = `songs_${sortBy}`;
    let allSongsWithMetadata = global.songCache?.[cacheKey];

    if (!allSongsWithMetadata || searchQuery) {
      console.time('getAllAudioFiles');
      // Get all audio files recursively
      const audioFiles = await getAllAudioFiles(MUSIC_DIR);
      console.timeEnd('getAllAudioFiles');

      console.time('extractMetadata');
      // Process files in batches to avoid memory issues
      const batchSize = 100;
      allSongsWithMetadata = [];

      for (let i = 0; i < audioFiles.length; i += batchSize) {
        const batch = audioFiles.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (relativePath) => {
            const fullPath = path.join(MUSIC_DIR, relativePath);
            return await extractMetadata(relativePath, fullPath);
          })
        );
        allSongsWithMetadata.push(...batchResults);
      }
      console.timeEnd('extractMetadata');

      // Cache the results if not searching
      if (!searchQuery) {
        if (!global.songCache) global.songCache = {};
        global.songCache[cacheKey] = allSongsWithMetadata;
      }
    }

    // Filter songs based on search query if provided
    let filteredSongs = allSongsWithMetadata;
    if (searchQuery) {
      console.time('search');
      const query = searchQuery.toLowerCase().trim();
      console.log('Filtering songs with query:', query);
      console.log('Total songs before filtering:', allSongsWithMetadata.length);

      filteredSongs = allSongsWithMetadata.filter(song => {
        const titleMatch = song.title && song.title.toLowerCase().includes(query);
        const artistMatch = song.artist && song.artist.toLowerCase().includes(query);
        const albumMatch = song.album && song.album.toLowerCase().includes(query);

        return titleMatch || artistMatch || albumMatch;
      });

      console.log('Total songs after filtering:', filteredSongs.length);
      console.timeEnd('search');
    }

    // Apply sorting if needed
    if (sortBy) {
      console.time('sort');
      filteredSongs.sort((a, b) => {
        switch (sortBy) {
          case 'artist':
            return a.artist.localeCompare(b.artist);
          case 'album':
            return a.album.localeCompare(b.album);
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
      console.timeEnd('sort');
    }

    // Calculate total number of songs and pages after filtering
    const totalSongs = filteredSongs.length;
    const totalPages = Math.ceil(totalSongs / limit);

    // Calculate start and end indices for pagination
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalSongs);

    // Get the subset of songs for the current page
    const paginatedSongs = filteredSongs.slice(startIndex, endIndex);

    // Add IDs to the songs
    const songs = paginatedSongs.map((song, index) => ({
      ...song,
      id: startIndex + index + 1 // Global ID across all pages
    }));

    // Create pagination metadata
    const pagination = {
      total: totalSongs,
      page: page,
      limit: limit,
      totalPages: totalPages,
      hasMore: page < totalPages
    };

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=60'); // Cache for 1 minute

    // Return songs with pagination info
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      pagination: pagination,
      songs: songs
    }));

    // Clear the timeout since we've successfully responded
    clearTimeout(timeoutId);
  } catch (error) {
    console.error('Error getting songs:', error);

    // Only send response if headers haven't been sent yet
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }));
    } else {
      // If headers were already sent, just end the response
      res.end();
    }

    // Clear the timeout in case of error too
    clearTimeout(timeoutId);
  }
}

// Serve music files
async function handleMusicRequest(req, res) {
  try {
    const urlParts = req.url.split('?')[0].split('/');
    const filePath = urlParts.slice(2).join('/'); // Skip /music/ prefix
    const decodedPath = decodeURIComponent(filePath);
    const fullPath = path.join(MUSIC_DIR, decodedPath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File not found' }));
      return;
    }

    // Get file stats
    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const ext = path.extname(fullPath).toLowerCase();

    // Set appropriate content type based on file extension
    let contentType = 'audio/mpeg';
    if (ext === '.flac') contentType = 'audio/flac';
    if (ext === '.wav') contentType = 'audio/wav';
    if (ext === '.ogg' || ext === '.oga') contentType = 'audio/ogg';
    if (ext === '.m4a' || ext === '.mp4' || ext === '.m4b') contentType = 'audio/mp4';

    // Handle range requests for better streaming
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(fullPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      });

      file.pipe(res);
    } else {
      // No range requested, send entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      });

      fs.createReadStream(fullPath).pipe(res);
    }
  } catch (error) {
    console.error('Error handling music request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// Delete a song
async function deleteSong(req, res) {
  try {
    // Read the request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { filePath } = data;

        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File path is required' }));
          return;
        }

        // Construct the full path to the file
        const fullPath = path.join(MUSIC_DIR, filePath);

        // Check if the file exists
        if (!fs.existsSync(fullPath)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File not found' }));
          return;
        }

        try {
          // Delete the file
          fs.unlinkSync(fullPath);

          // Check if the file was deleted successfully
          if (fs.existsSync(fullPath)) {
            throw new Error('Failed to delete file');
          }

          // Return success response
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'File deleted successfully',
            file: filePath
          }));
        } catch (deleteError) {
          console.error('Error deleting file:', deleteError);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Failed to delete file',
            details: deleteError.message
          }));
        }
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
  } catch (error) {
    console.error('Error handling delete request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// Download a song
function downloadSong(req, res) {
  try {
    // Parse the URL to get the file path parameter
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filePath = url.searchParams.get('file');

    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File path parameter is required' }));
      return;
    }

    // Construct the full path to the file
    const fullPath = path.join(MUSIC_DIR, filePath);

    // Check if the file exists
    if (!fs.existsSync(fullPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File not found' }));
      return;
    }

    // Get file stats
    const stat = fs.statSync(fullPath);

    // Get file name for the Content-Disposition header
    const fileName = path.basename(fullPath);

    // Determine MIME type based on extension
    const ext = path.extname(fullPath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    // Set response headers for download
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Cache-Control': 'no-cache'
    });

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(fullPath);

    // Handle errors on the file stream
    fileStream.on('error', (err) => {
      console.error(`Error streaming file ${filePath} for download:`, err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error streaming file for download' }));
      } else {
        res.end();
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error('Error handling download request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// Download all songs as a zip file
function downloadAllSongs(_, res) {
  try {
    // Create a zip file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFileName = `music-collection-${timestamp}.zip`;

    // Set response headers for zip download
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipFileName}"`,
      'Cache-Control': 'no-cache'
    });

    // Create a zip archive
    const archive = archiver('zip', {
      zlib: { level: 5 } // Compression level (0-9)
    });

    // Pipe the archive to the response
    archive.pipe(res);

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Error creating zip archive:', err);
      // If headers haven't been sent yet, send an error response
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to create zip archive' }));
      } else {
        // Otherwise, just end the response
        res.end();
      }
    });

    // Get all audio files recursively
    getAllAudioFiles(MUSIC_DIR)
      .then(async (audioFiles) => {
        // Add each file to the archive
        for (const relativePath of audioFiles) {
          const fullPath = path.join(MUSIC_DIR, relativePath);

          try {
            // Add the file to the archive with its relative path
            archive.file(fullPath, { name: relativePath });
          } catch (fileError) {
            console.error(`Error adding file ${relativePath} to archive:`, fileError);
            // Continue with other files
          }
        }

        // Finalize the archive
        await archive.finalize();
      })
      .catch((error) => {
        console.error('Error getting audio files for zip:', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to get audio files' }));
        } else {
          res.end();
        }
      });
  } catch (error) {
    console.error('Error handling download all request:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    } else {
      res.end();
    }
  }
}

// Add a function to clear the cache periodically
function clearCaches() {
  global.audioFilesCache = null;
  global.songCache = {};
  global.forceRescan = true; // Force a rescan next time
  console.log('Song caches cleared at', new Date().toISOString());
}

// Function to manually clear caches and force a rescan
function forceClearCaches() {
  clearCaches();
  return { success: true, message: 'Caches cleared and rescan forced' };
}

// Clear caches every hour to pick up new files
setInterval(clearCaches, 60 * 60 * 1000);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Music directory: ${MUSIC_DIR}`);
});
