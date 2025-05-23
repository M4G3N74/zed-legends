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
  const [smartShuffleEnabled, setSmartShuffleEnabled] = useState(true);
  const [bassBoost, setBassBoost] = useState(false);
  const [megaBoost, setMegaBoost] = useState(false);
  const [autoplay, setAutoplay] = useState(true);

  const audioRef = useRef(null);
  const playHistoryRef = useRef([]);
  const skipHistoryRef = useRef([]);

  // Load player preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem('playerPreferences');
      if (savedPreferences) {
        try {
          const preferences = JSON.parse(savedPreferences);

          if (preferences.volume !== undefined) setVolume(preferences.volume);
          if (preferences.shuffle !== undefined) setShuffle(preferences.shuffle);
          if (preferences.smartShuffleEnabled !== undefined) setSmartShuffleEnabled(preferences.smartShuffleEnabled);
          if (preferences.repeat !== undefined) setRepeat(preferences.repeat);
          if (preferences.autoplay !== undefined) setAutoplay(preferences.autoplay);
          if (preferences.bassBoost !== undefined) setBassBoost(preferences.bassBoost);
          if (preferences.megaBoost !== undefined) setMegaBoost(preferences.megaBoost);
        } catch (error) {
          console.error('Error loading player preferences:', error);
        }
      }

      // Load play history
      const savedPlayHistory = localStorage.getItem('playHistory');
      if (savedPlayHistory) {
        try {
          playHistoryRef.current = JSON.parse(savedPlayHistory);
        } catch (error) {
          console.error('Error loading play history:', error);
        }
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

  // Track user interaction with songs
  const trackUserInteraction = useCallback((interactionType, songId) => {
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

        // Save to localStorage
        localStorage.setItem('playHistory', JSON.stringify(playHistoryRef.current));
      }
    } else if (interactionType === 'skip') {
      skipHistoryRef.current.push(songId);
      // Keep history at a reasonable size
      if (skipHistoryRef.current.length > 100) {
        skipHistoryRef.current = skipHistoryRef.current.slice(-100);
      }

      // Save to localStorage
      localStorage.setItem('skipHistory', JSON.stringify(skipHistoryRef.current));
    }

    // Send to backend if smart shuffle is enabled
    if (smartShuffleEnabled) {
      try {
        fetch('/api/track-interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: localStorage.getItem('userId') || 'anonymous',
            songId,
            interactionType,
            timestamp: new Date().toISOString()
          }),
        }).catch(error => {
          console.error('Failed to send interaction data to backend:', error);
        });
      } catch (error) {
        console.error('Failed to send interaction data to backend:', error);
      }
    }
  }, [smartShuffleEnabled]);

  // Load a song
  const loadSong = useCallback((song) => {
    if (!song) return;

    console.log('Loading song:', song.title);

    // Update current song
    setCurrentSong(song);

    // Update audio source
    if (audioRef.current) {
      const songPath = `/music/${encodeURIComponent(song.file)}`;
      console.log('Song path:', songPath);

      audioRef.current.src = songPath;
      audioRef.current.load();
      audioRef.current.volume = volume;
    }

    // Track this interaction
    trackUserInteraction('play', song.id);
  }, [volume, trackUserInteraction]);

  // Play the current song
  const playSong = useCallback(() => {
    if (!audioRef.current) return;

    console.log('Playing song');

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Error playing audio:', error);

        if (error.name === 'NotAllowedError') {
          alert('Autoplay was blocked. Please click play to start playback.');
        }
      });
    }
  }, []);

  // Pause the current song
  const pauseSong = useCallback(() => {
    if (!audioRef.current) return;

    console.log('Pausing song');
    audioRef.current.pause();
  }, []);

  // Play next song
  const playNextSong = useCallback(() => {
    if (!currentSong || !songs || songs.length === 0) return;

    console.log('Playing next song');

    let nextSongIndex = -1;

    // Handle different playback modes
    if (shuffle) {
      // Regular shuffle - completely random
      const availableSongs = songs.filter(song => song.id !== currentSong.id);

      if (availableSongs.length === 0) return;

      const randomIndex = Math.floor(Math.random() * availableSongs.length);
      loadSong(availableSongs[randomIndex]);
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
  }, [currentSong, songs, shuffle, repeat, autoplay, loadSong, playSong]);

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

  // Toggle bass boost (dummy implementation)
  const toggleBassBoost = useCallback(() => {
    if (!bassBoost && !megaBoost) {
      setBassBoost(true);
      setMegaBoost(false);
    } else if (bassBoost && !megaBoost) {
      setBassBoost(true);
      setMegaBoost(true);
    } else {
      setBassBoost(false);
      setMegaBoost(false);
    }

    savePlayerPreferences();
  }, [bassBoost, megaBoost, savePlayerPreferences]);

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
            src: currentSong.albumArt || '/images/album-art.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      });

      // Set action handlers for media keys
      navigator.mediaSession.setActionHandler('play', playSong);
      navigator.mediaSession.setActionHandler('pause', pauseSong);
      navigator.mediaSession.setActionHandler('previoustrack', playPreviousSong);
      navigator.mediaSession.setActionHandler('nexttrack', playNextSong);
    } catch (error) {
      console.error('Failed to update Media Session metadata:', error);
    }
  }, [currentSong, playSong, pauseSong, playPreviousSong, playNextSong]);

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
        loop={repeat === 'one'}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          if (repeat === 'one') {
            audioRef.current.currentTime = 0;
            playSong();
          } else {
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
