export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url || !url.startsWith('https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev/')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    // Forward range header for streaming
    const headers = {};
    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch audio' });
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    
    // Forward response headers
    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    
    if (response.headers.get('content-length')) {
      res.setHeader('Content-Length', response.headers.get('content-length'));
    }
    
    if (response.headers.get('content-range')) {
      res.setHeader('Content-Range', response.headers.get('content-range'));
      res.status(206); // Partial Content
    }

    // Stream the response directly
    const reader = response.body.getReader();
    
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } catch (error) {
        console.error('Streaming error:', error);
        res.end();
      }
    };

    pump();
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy error' });
  }
}