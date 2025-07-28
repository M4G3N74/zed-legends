export default async function handler(req, res) {
  const { path } = req.query;
  const filename = Array.isArray(path) ? path.join('/') : path;
  
  if (!filename) {
    return res.status(400).json({ error: 'No file specified' });
  }

  const decodedFilename = decodeURIComponent(filename);
  const r2Url = `https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev/${encodeURIComponent(decodedFilename)}`;
  
  try {
    const response = await fetch(r2Url);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Get the response as buffer and send
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({ error: 'Streaming failed' });
  }
}