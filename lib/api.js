const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
);

export const apiEndpoints = {
  songs: `${API_BASE_URL}/api/songs`,
  health: `${API_BASE_URL}/api/health`,
  music: (filename) => `${API_BASE_URL}/music/${filename}`,
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