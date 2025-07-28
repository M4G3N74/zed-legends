export default async function handler(req, res) {
  // DJ functionality disabled
  return res.status(503).json({ error: 'DJ functionality has been disabled' });
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Temporarily disabled - return empty data
  if (req.method === 'GET') {
    return res.status(200).json({ pronunciations: [] });
  }

  if (req.method === 'POST') {
    return res.status(200).json({ success: true, pronunciation: null });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}