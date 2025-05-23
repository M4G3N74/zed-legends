// Smart Shuffle API endpoint
// This endpoint receives user listening data and returns personalized song recommendations

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentSongId, playHistory, skipHistory, userId } = req.body;

    // Validate required fields
    if (!currentSongId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a real implementation, this would call your backend service
    // that implements the smart shuffle algorithm
    
    // For now, we'll simulate a response with a simple algorithm
    // that prioritizes songs that:
    // 1. Haven't been played recently
    // 2. Haven't been skipped
    // 3. Are similar to the current song (genre, artist, etc.)
    
    // Get all songs from your database or library
    // This is a placeholder - in a real implementation, you would fetch from your database
    const allSongs = await getMockSongLibrary();
    
    // Filter out the current song
    const availableSongs = allSongs.filter(song => song.id !== currentSongId);
    
    // Calculate a score for each song
    const scoredSongs = availableSongs.map(song => {
      let score = 1.0; // Base score
      
      // Reduce score if the song was recently played
      if (playHistory && playHistory.includes(song.id)) {
        const recencyIndex = playHistory.lastIndexOf(song.id);
        const recencyPenalty = 0.9 ** (playHistory.length - recencyIndex);
        score *= recencyPenalty;
      }
      
      // Heavily reduce score if the song was recently skipped
      if (skipHistory && skipHistory.includes(song.id)) {
        const skipIndex = skipHistory.lastIndexOf(song.id);
        const skipPenalty = 0.5 ** (skipHistory.length - skipIndex);
        score *= skipPenalty;
      }
      
      // Boost score for songs with the same artist
      const currentSong = allSongs.find(s => s.id === currentSongId);
      if (currentSong && song.artist === currentSong.artist) {
        score *= 1.2;
      }
      
      // Boost score for songs with the same genre
      if (currentSong && song.genre === currentSong.genre) {
        score *= 1.3;
      }
      
      return { id: song.id, score };
    });
    
    // Sort by score (highest first)
    scoredSongs.sort((a, b) => b.score - a.score);
    
    // Return the top recommendations
    const recommendations = scoredSongs.slice(0, 10).map(song => song.id);
    
    // Return the recommendations
    return res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Smart shuffle error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Mock function to get song library
// In a real implementation, this would fetch from your database
async function getMockSongLibrary() {
  // This is just a placeholder with sample data
  return [
    { id: '1', title: 'Song 1', artist: 'Artist A', genre: 'Rock' },
    { id: '2', title: 'Song 2', artist: 'Artist A', genre: 'Rock' },
    { id: '3', title: 'Song 3', artist: 'Artist B', genre: 'Pop' },
    { id: '4', title: 'Song 4', artist: 'Artist C', genre: 'Electronic' },
    { id: '5', title: 'Song 5', artist: 'Artist B', genre: 'Pop' },
    { id: '6', title: 'Song 6', artist: 'Artist D', genre: 'Hip Hop' },
    { id: '7', title: 'Song 7', artist: 'Artist E', genre: 'Jazz' },
    { id: '8', title: 'Song 8', artist: 'Artist C', genre: 'Electronic' },
    { id: '9', title: 'Song 9', artist: 'Artist F', genre: 'Classical' },
    { id: '10', title: 'Song 10', artist: 'Artist D', genre: 'Hip Hop' },
    { id: '11', title: 'Song 11', artist: 'Artist G', genre: 'Rock' },
    { id: '12', title: 'Song 12', artist: 'Artist H', genre: 'Pop' },
    { id: '13', title: 'Song 13', artist: 'Artist I', genre: 'Electronic' },
    { id: '14', title: 'Song 14', artist: 'Artist J', genre: 'Hip Hop' },
    { id: '15', title: 'Song 15', artist: 'Artist K', genre: 'Jazz' },
  ];
}
