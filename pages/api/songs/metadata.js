export default function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  res.status(501).json({ error: 'Editing metadata is not supported in this deployment.' });
} 