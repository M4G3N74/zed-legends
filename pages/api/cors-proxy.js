// A simple CORS proxy for audio files
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Decode the URL
    const decodedUrl = decodeURIComponent(url);
    console.log('Proxying request to:', decodedUrl);
    
    // Fetch the resource with appropriate headers
    const response = await fetch(decodedUrl, {
      headers: {
        'Accept': 'audio/mpeg,audio/*;q=0.8,*/*;q=0.5',
        'User-Agent': 'ZedLegends/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`Proxy fetch failed: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: `Failed to fetch: ${response.status} ${response.statusText}` 
      });
    }
    
    // Get content type
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
      console.log('Content-Type from origin:', contentType);
    } else {
      // Default to audio/mpeg if no content type is provided
      res.setHeader('Content-Type', 'audio/mpeg');
      console.log('No Content-Type from origin, defaulting to audio/mpeg');
    }
    
    // Get content length if available
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
      console.log('Content-Length:', contentLength);
    }
    
    // Get the response as array buffer
    const buffer = await response.arrayBuffer();
    console.log('Successfully fetched buffer of size:', buffer.byteLength);
    
    // Send the response
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request: ' + error.message });
  }
}