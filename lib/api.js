const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin
    : undefined);

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL is not set. Please set NEXT_PUBLIC_API_URL in your environment.');
}

export const apiEndpoints = {
  songs: `${API_BASE_URL}/api/songs`,
  health: `${API_BASE_URL}/api/health`,
  music: (filename) => `${API_BASE_URL}/music/${filename}`,
  mostLiked: `${API_BASE_URL}/api/songs/most-liked`,
  updateMetadata: `${API_BASE_URL}/api/songs/metadata`,
  trackInteraction: `${API_BASE_URL}/api/track-interaction`,
  download: `${API_BASE_URL}/api/download`,
  clearCache: `${API_BASE_URL}/api/cache/clear`,
};

export const fetchFromAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};