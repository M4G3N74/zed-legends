export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // (Optional) Add authentication/authorization here to restrict to admins
  // Example: if (!req.user || !req.user.isAdmin) { ... }

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/sync-songs`;
    const syncRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-sync-secret': process.env.SYNC_SECRET,
        'Content-Type': 'application/json',
      },
    });
    const data = await syncRes.json();
    if (!syncRes.ok) throw new Error(data.error || 'Sync failed');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 