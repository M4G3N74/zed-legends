// Smart Shuffle API endpoint
// This endpoint receives user listening data and returns personalized song recommendations

export default async function handler(req, res) {
  // DJ functionality disabled
  return res.status(503).json({ error: 'DJ functionality has been disabled' });
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      userId, 
      currentSongId, 
      skipHistory = [], 
      playHistory = [],
      userProfile = {},
      timeOfDay,
      mood = 'neutral'
    } = req.body;

    // Get all songs from database
    const response = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/songs`);
    const { songs } = await response.json();
    
    if (!songs || songs.length === 0) {
      return res.status(404).json({ error: 'No songs available' });
    }

    // DJ Purple advanced intelligence
    const currentHour = new Date().getHours();
    const recentSkips = skipHistory.slice(-15);
    const recentPlays = playHistory.slice(-10);
    
    const scoredSongs = songs.map(song => {
      let score = Math.random() * 0.2;
      
      if (song.id === currentSongId || recentSkips.includes(song.id)) {
        return { song, score: 0 };
      }
      
      // Favorite artists boost
      if (userProfile.favoriteArtists?.includes(song.artist)) {
        score += 0.4;
      }
      
      // Time-based preferences
      if (userProfile.listeningTimes?.[currentHour]) {
        const timePrefs = userProfile.listeningTimes[currentHour];
        if (timePrefs.artists?.includes(song.artist)) {
          score += 0.3;
        }
      }
      
      // Play history boost
      const timesPlayed = playHistory.filter(id => id === song.id).length;
      if (timesPlayed > 0 && !recentPlays.includes(song.id)) {
        score += Math.min(timesPlayed * 0.15, 0.3);
      }
      
      // Diversity bonus
      if (recentPlays.length > 0) {
        const recentArtists = recentPlays.map(id => 
          songs.find(s => s.id === id)?.artist
        ).filter(Boolean);
        
        if (!recentArtists.slice(-3).includes(song.artist)) {
          score += 0.1;
        }
      }
      
      return { song, score };
    });

    const validSongs = scoredSongs.filter(item => item.score > 0);
    
    if (validSongs.length === 0) {
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      return res.status(200).json({ 
        recommendedSong: randomSong,
        reason: 'Random fallback',
        confidence: 0.1
      });
    }
    
    validSongs.sort((a, b) => b.score - a.score);
    
    const topCandidates = validSongs.slice(0, Math.min(8, validSongs.length));
    const totalWeight = topCandidates.reduce((sum, item) => sum + item.score, 0);
    
    let random = Math.random() * totalWeight;
    let selectedSong = topCandidates[0];
    
    for (const candidate of topCandidates) {
      random -= candidate.score;
      if (random <= 0) {
        selectedSong = candidate;
        break;
      }
    }

    let reason = 'DJ Purple\'s smart pick';
    if (selectedSong.score > 0.6) {
      reason = 'Perfect match for your taste! 🎯';
    } else if (userProfile.favoriteArtists?.includes(selectedSong.song.artist)) {
      reason = `You love ${selectedSong.song.artist}! 💜`;
    } else if (selectedSong.score > 0.4) {
      reason = 'Great choice based on your history 🎵';
    }

    res.status(200).json({
      recommendedSong: selectedSong.song,
      reason,
      confidence: Math.min(selectedSong.score, 1.0),
      djMode: true
    });

  } catch (error) {
    console.error('DJ Purple error:', error);
    res.status(500).json({ error: 'DJ Purple is taking a break' });
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
