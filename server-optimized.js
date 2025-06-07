const http = require('http');
const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');

const PORT = process.env.PORT || 3000;
const MUSIC_DIR = '/home/purple/Music';

// Cache for songs to avoid repeated file system scans
let songsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Memory-efficient song scanning
async function scanMusicFiles() {
  const now = Date.now();
  
  // Return cached results if still valid
  if (songsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return songsCache;
  }

  console.log('Scanning music files...');
  const songs = [];
  
  try {
    const files = fs.readdirSync(MUSIC_DIR);
    
    // Process files in batches to avoid memory spikes
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      for (const file of batch) {
        if (file.match(/\.(mp3|wav|flac|m4a)$/i)) {
          const filePath = path.join(MUSIC_DIR, file);
          const stats = fs.statSync(filePath);
          
          // Basic metadata without heavy parsing
          let metadata = { title: file, artist: 'Unknown', album: 'Unknown' };
          
          try {
            // Only parse ID3 for MP3 files to save memory
            if (file.endsWith('.mp3')) {
              const tags = NodeID3.read(filePath);
              if (tags.title) metadata.title = tags.title;
              if (tags.artist) metadata.artist = tags.artist;
              if (tags.album) metadata.album = tags.album;
            }
          } catch (e) {
            // Skip metadata parsing if it fails
          }
          
          songs.push({
            id: songs.length,
            title: metadata.title,
            artist: metadata.artist,
            album: metadata.album,
            filename: file,
            size: stats.size,
            url: `/music/${encodeURIComponent(file)}`
          });
        }
      }
      
      // Small delay between batches to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    songsCache = songs;
    cacheTimestamp = now;
    console.log(`Cached ${songs.length} songs`);
    
    return songs;
  } catch (error) {
    console.error('Error scanning music files:', error);
    return [];
  }
}

// Lightweight server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  try {
    // API Routes
    if (url.pathname === '/api/songs') {
      const songs = await scanMusicFiles();
      const page = parseInt(url.searchParams.get('page')) || 1;
      const limit = parseInt(url.searchParams.get('limit')) || 50;
      const search = url.searchParams.get('search') || '';
      
      let filteredSongs = songs;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredSongs = songs.filter(song => 
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower) ||
          song.album.toLowerCase().includes(searchLower)
        );
      }
      
      const startIndex = (page - 1) * limit;
      const paginatedSongs = filteredSongs.slice(startIndex, startIndex + limit);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        songs: paginatedSongs,
        totalSongs: filteredSongs.length,
        currentPage: page,
        totalPages: Math.ceil(filteredSongs.length / limit)
      }));
      return;
    }
    
    // Music file streaming
    if (url.pathname.startsWith('/music/')) {
      const filename = decodeURIComponent(url.pathname.replace('/music/', ''));
      const filePath = path.join(MUSIC_DIR, filename);
      
      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      const stat = fs.statSync(filePath);
      const range = req.headers.range;
      
      if (range) {
        // Stream audio with range support
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        });
        
        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stat.size,
          'Content-Type': 'audio/mpeg',
        });
        fs.createReadStream(filePath).pipe(res);
      }
      return;
    }
    
    // Serve static files (your built Next.js app)
    let filePath = path.join(__dirname, 'out', url.pathname === '/' ? 'index.html' : url.pathname);
    
    if (!fs.existsSync(filePath) && !path.extname(filePath)) {
      filePath = path.join(__dirname, 'out', url.pathname, 'index.html');
    }
    
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, 'out', '404.html');
    }
    
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    }[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Optimized server running on port ${PORT}`);
  console.log(`Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});