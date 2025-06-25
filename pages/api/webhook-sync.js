export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // (Optional) Add authentication here!

  try {
    // Replace with your private server's URL
    const webhookUrl = process.env.PRIVATE_SYNC_WEBHOOK_URL || 'https://your-private-server.com/sync-r2';
    const webhookSecret = process.env.WEBHOOK_SECRET;

    const syncRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret,
      },
      body: JSON.stringify({ trigger: 'dashboard' }),
    });

    const data = await syncRes.json();
    if (!syncRes.ok) throw new Error(data.error || 'Sync failed');
    res.status(200).json({ message: 'Sync triggered successfully', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 