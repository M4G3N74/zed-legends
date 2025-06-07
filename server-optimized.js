const http = require('http');
const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');

const PORT = process.env.PORT || 3000;
const MUSIC_DIR = process.env.MUSIC_DIR || '/home/purple/Music';

// Cache for songs to avoid repeated file system scans
let songsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Memory-efficient song scanning
async function scanMusicFiles() {
  const now = Date.now();
  
  if (songsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return songsCache;
  }

  console.log('Scanning music files...');
  const songs = [];
  
  try {
    if (!fs.existsSync(MUSIC_DIR)) {
      console.error(`Music directory not found: ${MUSIC_DIR}`);
      return [];
    }

    const files = fs.readdirSync(MUSIC_DIR);
    
    // Process files in batches to avoid memory spikes
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      for (const file of batch) {
        if (file.match(/\.(mp3|wav|flac|m4a)$/i)) {
          const filePath = path.join(MUSIC_DIR, file);
          
          try {
            const stats = fs.statSync(filePath);
            
            // Basic metadata without heavy parsing
            let metadata = { 
              title: file.replace(/\.[^/.]+$/, ''), 
              artist: 'Unknown Artist', 
              album: 'Unknown Album' 
            };
            
            // Only parse ID3 for MP3 files to save memory
            if (file.toLowerCase().endsWith('.mp3')) {
              try {
                const tags = NodeID3.read(filePath);
                if (tags.title) metadata.title = tags.title;
                if (tags.artist) metadata.artist = tags.artist;
                if (tags.album) metadata.album = tags.album;
              } catch (e) {
                console.warn(`Failed to read metadata for ${file}:`, e.message);
              }
            }
            
            songs.push({
              id: songs.length,
              title: metadata.title,
              artist: metadata.artist,
              album: metadata.album,
              filename: file,
              size: stats.size,
              url: `/music/${encodeURIComponent(file)}`,
              duration: '0:00' // You can add duration parsing later if needed
            });
          } catch (e) {
            console.warn(`Failed to process file ${file}:`, e.message);
          }
        }
      }
      
      // Small delay between batches to prevent blocking
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
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
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://zed-legends.vercel.app', // Replace with your actual Vercel URL
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  try {
    // Health check endpoint
    if (url.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        uptime: process.uptime()
      }));
      return;
    }
    
    // API Routes
    if (url.pathname === '/api/songs') {
      const songs = await scanMusicFiles();
      const page = parseInt(url.searchParams.get('page')) || 1;
      const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100); // Max 100 per page
      const search = url.searchParams.get('search') || '';
      const sortBy = url.searchParams.get('sortBy') || 'artist';
      
      let filteredSongs = songs;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredSongs = songs.filter(song => 
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower) ||
          song.album.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort songs
      filteredSongs.sort((a, b) => {
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';
        return aVal.localeCompare(bVal);
      });
      
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
    
    // Music file streaming with range support
    if (url.pathname.startsWith('/music/')) {
      const filename = decodeURIComponent(url.pathname.replace('/music/', ''));
      const filePath = path.join(MUSIC_DIR, filename);
      
      // Security check - ensure file is within music directory
      const resolvedPath = path.resolve(filePath);
      const resolvedMusicDir = path.resolve(MUSIC_DIR);
      if (!resolvedPath.startsWith(resolvedMusicDir)) {
        res.writeHead(403);
        res.end('Access denied');
        return;
      }
      
      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      const stat = fs.statSync(filePath);
      const range = req.headers.range;
      
      // Determine content type
      const ext = path.extname(filename).toLowerCase();
      const contentType = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.flac': 'audio/flac',
        '.m4a': 'audio/mp4',
        '.ogg': 'audio/ogg'
      }[ext] || 'audio/mpeg';
      
      if (range) {
        // Stream audio with range support for better performance
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600'
        });
        
        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stat.size,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600'
        });
        fs.createReadStream(filePath).pipe(res);
      }
      return;
    }
    
    // Serve static files (your built Next.js app)
    const staticDir = path.join(__dirname, 'out');
    let filePath = path.join(staticDir, url.pathname === '/' ? 'index.html' : url.pathname);
    
    // Handle Next.js routing
    if (!fs.existsSync(filePath) && !path.extname(filePath)) {
      filePath = path.join(staticDir, url.pathname, 'index.html');
    }
    
    if (!fs.existsSync(filePath)) {
      filePath = path.join(staticDir, '404.html');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(staticDir, 'index.html');
      }
    }
    
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    }[ext] || 'text/plain';
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    fs.createReadStream(filePath).pipe(res);
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

server.listen(PORT, () => {
  console.log(`Optimized server running on port ${PORT}`);
  console.log(`Music directory: ${MUSIC_DIR}`);
  console.log(`Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});