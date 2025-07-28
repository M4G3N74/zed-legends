export default async function handler(req, res) {
  const { filename } = req.query;

  console.log('[/api/music/stream] Received filename parameter:', filename);

  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'File name is required' });
  }

  // Construct the public R2 URL for the music file
  const r2Url = `https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev/${filename}`;

  console.log('[/api/music/stream] Constructed R2 URL:', r2Url);

  try {
    const r2Res = await fetch(r2Url, {
      headers: {
        'Range': req.headers.range || '',
      },
    });

    console.log('[/api/music/stream] R2 Response Status:', r2Res.status, r2Res.statusText);

    if (!r2Res.ok) {
      return res.status(r2Res.status).json({ error: 'Failed to fetch file from R2' });
    }

    // Set appropriate headers for audio streaming
    res.setHeader('Content-Type', r2Res.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Content-Length', r2Res.headers.get('content-length') || '');
    res.setHeader('Accept-Ranges', 'bytes');

    // If it's a partial content response (range request)
    if (r2Res.status === 206) {
      res.setHeader('Content-Range', r2Res.headers.get('content-range') || '');
      res.status(206);
    } else {
      res.status(200);
    }

    // Pipe the R2 response stream directly to the client
    for await (const chunk of r2Res.body) {
      res.write(chunk);
    }
    res.end();

  } catch (error) {
    console.error('R2 music stream error:', error);
    res.status(500).json({ error: 'Failed to stream music from R2' });
  }
}