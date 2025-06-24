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

const R2_ACCOUNT_ID = 'ce53c504acc542c7a0155e598af3bf57'; // Example, use your real one
const R2_ACCESS_KEY_ID = '56026cf46a6e6021368296e767de7b8d';
const R2_SECRET_ACCESS_KEY = 'b893693621ce5301f264f2533d7762409037c796560f1c71547b743e7afc8896';
const R2_BUCKET_NAME = 'zedlegends';

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
