// No import needed for fetch in Next.js API routes

export default async function handler(req, res) {
  if (!res) return;
  const { path: filePath } = req.query;
  if (!filePath) {
    res.status(400).json({ error: 'Missing file path' });
    return;
  }

  try {
    // Construct the public R2 URL
    const r2Url = `https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev/${encodeURI(filePath)}`;
    const fileName = filePath.split('/').pop();
    const r2Res = await fetch(r2Url);

    if (!r2Res.ok) {
      res.status(r2Res.status).json({ error: 'Failed to fetch file from R2' });
      return;
    }

    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', r2Res.headers.get('content-type') || 'application/octet-stream');

    // Buffer and send the file
    const arrayBuffer = await r2Res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error('Download proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy download' });
  }
} 