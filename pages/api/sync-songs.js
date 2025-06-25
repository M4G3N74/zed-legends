import { syncSongs } from '../../tools/sync-r2-to-db';

export default async function handler(req, res) {
  // Check for secret key to prevent unauthorized access
  const providedSecret = req.headers['x-sync-secret'] || req.query.secret;

  if (providedSecret !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret key.' });
  }

  if (req.method === 'POST') {
    try {
      console.log('API endpoint triggered for song sync.');
      // Wait for the sync to finish and return the logs
      const logs = await syncSongs();
      res.status(200).json({ message: 'Song synchronization completed.', logs });
    } catch (error) {
      console.error('API Error starting sync process:', error);
      res.status(500).json({ error: 'Failed to start sync process.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 