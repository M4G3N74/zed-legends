export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  res.status(200).json({ success: true, message: 'Cache cleared (no-op on Vercel).' });
} 