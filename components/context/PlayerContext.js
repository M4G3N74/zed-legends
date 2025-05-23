import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLibrary } from './LibraryContext';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const { songs } = useLibrary();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [repeat, setRepeat] = useState('none'); // 'none', 'one', 'all'
  const [shuffle, setShuffle] = useState(false);
  const [smartShuffleEnabled, setSmartShuffleEnabled] = useState(true); // Smart shuffle is enabled by default
  const [bassBoost, setBassBoost] = useState(false);
  const [megaBoost, setMegaBoost] = useState(false);
  const [autoplay, setAutoplay] = useState(true);

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const bassBoostNodeRef = useRef(null);
  const analyzerNodeRef = useRef(null);
  const shuffleQueueRef = useRef([]);
  const playHistoryRef = useRef([]);
  const skipHistoryRef = useRef([]);
  const songScoresRef = useRef({});
  const audioSourceRef = useRef(null); // Add this to track the audio source node

  // Initialize audio context and nodes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Check if Web Audio API is supported
        if (window.AudioContext || window.webkitAudioContext) {
          console.log('Initializing Web Audio API...');
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioContextRef.current = new AudioContext();

          // Create analyzer node
          analyzerNodeRef.current = audioContextRef.current.createAnalyser();
          analyzerNodeRef.current.fftSize = 256;
          analyzerNodeRef.current.smoothingTimeConstant = 0.8;

          // Create bass boost node
          bassBoostNodeRef.current = audioContextRef.current.createBiquadFilter();
          bassBoostNodeRef.current.type = 'lowshelf';
          bassBoostNodeRef.current.frequency.value = 100;
          bassBoostNodeRef.current.gain.value = 0;
          bassBoostNodeRef.current.Q.value = 0; // Resonance parameter for mega boost

          console.log('Web Audio API initialized successfully');
        } else {
          console.warn('Web Audio API is not supported in this browser. Advanced audio features will be disabled.');
          // Set a flag to indicate that Web Audio API is not available
          window.__WEB_AUDIO_API_UNAVAILABLE = true;
        }

        // Load preferences from localStorage
        loadPlayerPreferences();

        return () => {
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
          }
        };
      } catch (error) {
        console.error('Failed to initialize Web Audio API:', error);
        // Set a flag to indicate that Web Audio API initialization failed
        window.__WEB_AUDIO_API_FAILED = true;

        // Disable features that depend on Web Audio API
        setBassBoost(false);
        setMegaBoost(false);
      }
    }
  }, []);

  // Connect audio element to Web Audio API when it's available
  useEffect(() => {
    // Skip if audio element is not available
    if (!audioRef.current) {
      console.log('Audio element not available yet');
      return;
    }

    // Skip if Web Audio API is not available or failed to initialize
    if (window.__WEB_AUDIO_API_UNAVAILABLE || window.__WEB_AUDIO_API_FAILED) {
      console.log('Web Audio API not available, using standard audio playback');
      return;
    }

    // Skip if audio context is not available
    if (!audioContextRef.current) {
      console.log('Audio context not available yet');
      return;
    }

    // Check if we've already connected this audio element
    if (audioRef.current.connected) {
      console.log('Audio already connected to Web Audio API');
      return;
    }

    console.log('Connecting audio to Web Audio API...');

    try {
      // Resume audio context if it's suspended
      if (audioContextRef.current.state === 'suspended') {
        console.log('Resuming suspended audio context');
        audioContextRef.current.resume().catch(err =>
          console.error('Failed to resume audio context:', err)
        );
      }

      // Disconnect any existing source to prevent duplicate connections
      if (audioSourceRef.current) {
        try {
          console.log('Disconnecting previous audio source');
          audioSourceRef.current.disconnect();
        } catch (e) {
          // Ignore disconnection errors
          console.log('Error disconnecting previous source:', e);
        }
      }

      // Create a new media element source
      console.log('Creating new media element source');
      audioSourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);

      // Connect the audio processing chain
      console.log('Connecting audio processing chain');
      audioSourceRef.current.connect(analyzerNodeRef.current);
      analyzerNodeRef.current.connect(bassBoostNodeRef.current);
      bassBoostNodeRef.current.connect(audioContextRef.current.destination);

      // Mark as connected to prevent duplicate connections
      audioRef.current.connected = true;

      console.log('Audio connected to Web Audio API successfully');
    } catch (error) {
      console.error('Error connecting audio to Web Audio API:', error);

      // If we fail to connect to the Web Audio API, make sure audio can still play directly
      if (audioRef.current && audioSourceRef.current) {
        try {
          console.log('Attempting to clean up after connection error');
          // Try to disconnect from the audio graph and let the audio play normally
          audioSourceRef.current.disconnect();
          audioRef.current.connected = false;
          audioSourceRef.current = null;
        } catch (e) {
          console.error('Failed to clean up after connection error:', e);
        }
      }

      // Set the flag to indicate that Web Audio API failed
      window.__WEB_AUDIO_API_FAILED = true;

      // Disable features that depend on Web Audio API
      setBassBoost(false);
      setMegaBoost(false);
    }
  }, [audioRef.current, audioContextRef.current]);

  // Load player preferences from localStorage
  const loadPlayerPreferences = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem('playerPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);

        if (preferences.volume !== undefined) setVolume(preferences.volume);
        if (preferences.shuffle !== undefined) setShuffle(preferences.shuffle);
        if (preferences.smartShuffleEnabled !== undefined) setSmartShuffleEnabled(preferences.smartShuffleEnabled);
        if (preferences.repeat !== undefined) setRepeat(preferences.repeat);
        if (preferences.autoplay !== undefined) setAutoplay(preferences.autoplay);

        // Handle bass boost and mega boost
        if (preferences.bassBoost !== undefined) {
          setBassBoost(preferences.bassBoost);
          if (preferences.megaBoost !== undefined) {
            setMegaBoost(preferences.megaBoost);
          }

          // Apply the appropriate audio effects
          if (bassBoostNodeRef.current) {
            if (preferences.bassBoost && preferences.megaBoost) {
              // Mega boost
              bassBoostNodeRef.current.gain.value = 20;
              bassBoostNodeRef.current.Q.value = 2;
            } else if (preferences.bassBoost) {
              // Normal boost
              bassBoostNodeRef.current.gain.value = 10;
              bassBoostNodeRef.current.Q.value = 0;
            } else {
              // No boost
              bassBoostNodeRef.current.gain.value = 0;
              bassBoostNodeRef.current.Q.value = 0;
            }
          }
        }
      }

      // Load play history
      const savedPlayHistory = localStorage.getItem('playHistory');
      if (savedPlayHistory) {
        playHistoryRef.current = JSON.parse(savedPlayHistory);
      }
    }
  }, []);

  // Save player preferences to localStorage
  const savePlayerPreferences = useCallback(() => {
    if (typeof window !== 'undefined') {
      const preferences = {
        volume,
        shuffle,
        smartShuffleEnabled,
        repeat,
        autoplay,
        bassBoost,
        megaBoost
      };

      localStorage.setItem('playerPreferences', JSON.stringify(preferences));
    }
  }, [volume, shuffle, smartShuffleEnabled, repeat, autoplay, bassBoost, megaBoost]);

  // Save song scores to localStorage
  const saveSongScores = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('songScores', JSON.stringify(songScoresRef.current));
      localStorage.setItem('playHistory', JSON.stringify(playHistoryRef.current.slice(-50)));
      localStorage.setItem('skipHistory', JSON.stringify(skipHistoryRef.current.slice(-50)));
    }
  }, []);

  // Track user interaction with songs to improve smart shuffle
  const trackUserInteraction = useCallback(async (interactionType, songId) => {
    if (!songId) return;

    // Record interaction locally
    if (interactionType === 'play') {
      // Add to play history if not already the last played song
      const lastPlayed = playHistoryRef.current[playHistoryRef.current.length - 1];
      if (lastPlayed !== songId) {
        playHistoryRef.current.push(songId);
        // Keep history at a reasonable size
        if (playHistoryRef.current.length > 100) {
          playHistoryRef.current = playHistoryRef.current.slice(-100);
        }
      }
    } else if (interactionType === 'skip') {
      skipHistoryRef.current.push(songId);
      // Keep history at a reasonable size
      if (skipHistoryRef.current.length > 100) {
        skipHistoryRef.current = skipHistoryRef.current.slice(-100);
      }
    } else if (interactionType === 'like') {
      // Increase song score
      songScoresRef.current[songId] = (songScoresRef.current[songId] || 1) * 1.5;
    } else if (interactionType === 'dislike') {
      // Decrease song score
      songScoresRef.current[songId] = (songScoresRef.current[songId] || 1) * 0.5;
    }

    // Save to localStorage
    saveSongScores();

    // Send to backend if smart shuffle is enabled
    if (smartShuffleEnabled) {
      try {
        const userData = {
          userId: localStorage.getItem('userId') || 'anonymous',
          songId,
          interactionType,
          timestamp: new Date().toISOString()
        };

        // Send interaction data to backend
        await fetch('/api/track-interaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
      } catch (error) {
        console.error('Failed to send interaction data to backend:', error);
        // Continue even if backend tracking fails
      }
    }
  }, [smartShuffleEnabled, saveSongScores]);



  // Load a song
  const loadSong = useCallback((song) => {
    if (!song || !audioRef.current) return;

    console.log('Loading song:', song.title);

    // Update current song
    setCurrentSong(song);

    // Update audio source - ensure the path is correct
    const songPath = `/music/${encodeURIComponent(song.file)}`;
    console.log('Song path:', songPath);

    // Set the source and load the audio
    audioRef.current.src = songPath;
    audioRef.current.load();

    // Ensure volume is set correctly
    audioRef.current.volume = volume;

    // Resume audio context if it's suspended (needed for browsers that require user interaction)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(err => console.error('Failed to resume audio context:', err));
    }

    // Make sure the audio element is properly connected to the Web Audio API
    if (audioContextRef.current && !audioRef.current.connected &&
        !window.__WEB_AUDIO_API_UNAVAILABLE && !window.__WEB_AUDIO_API_FAILED) {
      try {
        console.log('Attempting to reconnect audio to Web Audio API');

        // Reconnect the audio element if needed
        if (audioSourceRef.current) {
          try {
            audioSourceRef.current.disconnect();
          } catch (e) {
            // Ignore disconnection errors
            console.log('Error disconnecting previous source:', e);
          }
        }

        audioSourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        audioSourceRef.current.connect(analyzerNodeRef.current);
        analyzerNodeRef.current.connect(bassBoostNodeRef.current);
        bassBoostNodeRef.current.connect(audioContextRef.current.destination);
        audioRef.current.connected = true;

        console.log('Reconnected audio to Web Audio API');
      } catch (error) {
        console.error('Error reconnecting audio:', error);

        // If reconnection fails, mark Web Audio API as failed
        window.__WEB_AUDIO_API_FAILED = true;

        // Disable features that depend on Web Audio API
        setBassBoost(false);
        setMegaBoost(false);
      }
    }

    // Track this interaction
    trackUserInteraction('play', song.id);
  }, [volume, trackUserInteraction]);

  // Play the current song
  const playSong = useCallback(() => {
    if (!audioRef.current || !currentSong) return;

    // Check if the audio has a valid source
    if (!audioRef.current.src && currentSong.file) {
      audioRef.current.src = `/music/${encodeURIComponent(currentSong.file)}`;
      audioRef.current.load();
    }

    // Make sure the audio context is resumed
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(err =>
        console.error('Failed to resume audio context:', err)
      );
    }

    // Attempt to play the audio
    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Error playing audio:', error);

        // Handle autoplay blocking
        if (error.name === 'NotAllowedError') {
          alert('Autoplay was blocked. Please click play to start playback.');
        } else if (currentSong && currentSong.file) {
          // For other errors, try to recover by reloading the audio
          setTimeout(() => {
            audioRef.current.src = `/music/${encodeURIComponent(currentSong.file)}`;
            audioRef.current.load();
            audioRef.current.play().catch(e => console.error('Recovery attempt failed:', e));
          }, 500);
        }
      });
    }
  }, [currentSong]);

  // Pause the current song
  const pauseSong = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
  }, []);

  // Get smart shuffle recommendations from backend
  const getSmartShuffleRecommendations = useCallback(async () => {
    if (!currentSong || !songs || songs.length === 0) return null;

    try {
      // Prepare user listening data
      const userData = {
        currentSongId: currentSong.id,
        playHistory: playHistoryRef.current,
        skipHistory: skipHistoryRef.current,
        userId: localStorage.getItem('userId') || 'anonymous'
      };

      // Call backend API for smart shuffle recommendations
      const response = await fetch('/api/smart-shuffle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to get smart shuffle recommendations');
      }

      const data = await response.json();
      return data.recommendations; // Array of song IDs recommended by the backend
    } catch (error) {
      console.error('Smart shuffle error:', error);
      return null; // Return null on error to fall back to regular shuffle
    }
  }, [currentSong, songs]);

  // Play next song implementation
  const playNextSong = useCallback(async () => {
    if (!currentSong || !songs || songs.length === 0) return;

    let nextSongIndex = -1;

    // Handle different playback modes
    if (shuffle) {
      if (smartShuffleEnabled) {
        // Try to get smart shuffle recommendations from backend
        const recommendations = await getSmartShuffleRecommendations();

        if (recommendations && recommendations.length > 0) {
          // Find the first recommended song that exists in our library
          for (const songId of recommendations) {
            const song = songs.find(s => s.id === songId);
            if (song && song.id !== currentSong.id) {
              loadSong(song);
              if (autoplay) playSong();
              return;
            }
          }
        }

        // Fall back to regular shuffle if smart shuffle fails or returns no valid recommendations
        const availableSongs = songs.filter(song => song.id !== currentSong.id);
        if (availableSongs.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        loadSong(availableSongs[randomIndex]);
      } else {
        // Regular shuffle - completely random
        const availableSongs = songs.filter(song => song.id !== currentSong.id);

        if (availableSongs.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        loadSong(availableSongs[randomIndex]);
      }
    } else {
      // Find current song index
      const currentIndex = songs.findIndex(song => song.id === currentSong.id);

      if (currentIndex !== -1) {
        // Get next song index
        nextSongIndex = currentIndex + 1;

        // Handle repeat all
        if (nextSongIndex >= songs.length) {
          if (repeat === 'all') {
            nextSongIndex = 0;
          } else if (!autoplay) {
            // Stop playback if we're at the end and not repeating
            return;
          } else {
            nextSongIndex = 0; // Default to first song if autoplay is on
          }
        }

        // Load and play next song
        loadSong(songs[nextSongIndex]);
      }
    }

    // Play the song if autoplay is enabled
    if (autoplay) playSong();
  }, [currentSong, songs, shuffle, smartShuffleEnabled, repeat, autoplay, loadSong, playSong, getSmartShuffleRecommendations]);

  // Play previous song
  const playPreviousSong = useCallback(() => {
    if (!currentSong || !songs || songs.length === 0) return;

    // If current time is more than 3 seconds, restart the current song
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    // Find current song index
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);

    if (currentIndex !== -1) {
      // Get previous song index
      let prevSongIndex = currentIndex - 1;

      // Handle wrap around
      if (prevSongIndex < 0) {
        if (repeat === 'all') {
          prevSongIndex = songs.length - 1;
        } else {
          // If not repeating, stay on first song
          prevSongIndex = 0;
        }
      }

      // Load and play previous song
      loadSong(songs[prevSongIndex]);
      if (isPlaying) playSong();
    }
  }, [currentSong, songs, repeat, isPlaying, loadSong, playSong]);

  // Toggle bass boost
  const toggleBassBoost = useCallback(() => {
    // Cycle through: off -> normal boost -> mega boost -> off
    if (!bassBoost && !megaBoost) {
      // Turn on normal bass boost
      setBassBoost(true);
      setMegaBoost(false);
      if (bassBoostNodeRef.current) {
        bassBoostNodeRef.current.gain.value = 10;
      }
    } else if (bassBoost && !megaBoost) {
      // Switch to mega boost
      setBassBoost(true);
      setMegaBoost(true);
      if (bassBoostNodeRef.current) {
        bassBoostNodeRef.current.gain.value = 20; // Higher gain for mega boost
        bassBoostNodeRef.current.Q.value = 2; // Add resonance for more dramatic effect
      }
    } else {
      // Turn off all boosts
      setBassBoost(false);
      setMegaBoost(false);
      if (bassBoostNodeRef.current) {
        bassBoostNodeRef.current.gain.value = 0;
        bassBoostNodeRef.current.Q.value = 0;
      }
    }
  }, [bassBoost, megaBoost]);

  // Set up Media Session API for background playback
  useEffect(() => {
    if (!currentSong || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title || 'Unknown Title',
        artist: currentSong.artist || 'Unknown Artist',
        album: currentSong.album || 'Unknown Album',
        artwork: [
          {
            src: currentSong.albumArt || '/images/default-album-art.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      });

      // Update playback state
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      // Set action handlers for media keys
      navigator.mediaSession.setActionHandler('play', () => playSong());
      navigator.mediaSession.setActionHandler('pause', () => pauseSong());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPreviousSong());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNextSong());

      // Add seekto handler if supported
      try {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime && audioRef.current) {
            audioRef.current.currentTime = details.seekTime;
          }
        });
      } catch (error) {
        // Seekto not supported, ignore
      }
    } catch (error) {
      console.error('Failed to update Media Session metadata:', error);
    }
  }, [currentSong, isPlaying, playSong, pauseSong, playPreviousSong, playNextSong]);



  const value = {
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    repeat,
    shuffle,
    smartShuffleEnabled,
    bassBoost,
    megaBoost,
    autoplay,
    audioRef,
    audioContextRef,
    analyzerNodeRef,
    loadSong,
    playSong,
    pauseSong,
    playNextSong,
    playPreviousSong,
    toggleBassBoost,
    trackUserInteraction,
    setVolume: (newVolume) => {
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
      // Save to preferences
      savePlayerPreferences();
    },
    setCurrentTime: (time) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    },
    setRepeat: (value) => {
      setRepeat(value);
      savePlayerPreferences();
    },
    setShuffle: (value) => {
      setShuffle(value);
      savePlayerPreferences();
    },
    setSmartShuffleEnabled: (value) => {
      setSmartShuffleEnabled(value);
      savePlayerPreferences();
    },
    setAutoplay: (value) => {
      setAutoplay(value);
      savePlayerPreferences();
    }
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        autoPlay={false}
        loop={repeat === 'one'}
        x-webkit-airplay="allow"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          // Handle song end based on repeat mode
          if (repeat === 'one') {
            // Repeat the current song
            audioRef.current.currentTime = 0;
            playSong();
          } else {
            // Play the next song (this function handles repeat all and autoplay)
            playNextSong();
          }
        }}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
