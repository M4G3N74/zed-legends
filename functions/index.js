const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.api = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const { path } = req;
    
    if (path.startsWith('/api/songs')) {
      // Handle songs API
      const bucket = admin.storage().bucket();
      const [files] = await bucket.getFiles({ prefix: 'music/' });
      
      const songs = files
        .filter(file => file.name.match(/\.(mp3|wav|flac|m4a)$/i))
        .map((file, index) => ({
          id: index,
          title: file.name.split('/').pop().replace(/\.[^/.]+$/, ''),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`,
        }));
      
      res.json({ songs });
    }
  });
});