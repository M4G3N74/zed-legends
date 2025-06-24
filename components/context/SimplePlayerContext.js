import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const [initialSongLoaded, setInitialSongLoaded] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

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
    if (!song || !(song.file || song.path || song.url)) {
      console.log('No song file, path, or url provided to loadSong', song);
      return;
    }

    const fileName = song.file || song.path;
    const fileUrl = song.url || `/music/${encodeURIComponent(fileName)}`;
    console.log('Loading song:', song.title, fileUrl);
    setCurrentSong(song);

    if (audioRef.current) {
      audioRef.current.src = fileUrl;
      console.log('Audio src set to:', audioRef.current.src);
      audioRef.current.load();
      audioRef.current.volume = volume;
    }
    trackUserInteraction('play', song.id);
  }, [volume, trackUserInteraction]);

  // Play a song (or the current one)
  const playSong = useCallback((song = null) => {
    if (typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) && !userHasInteracted) {
      console.log('Playback blocked: waiting for user gesture on mobile.');
      return;
    }
    setUserHasInteracted(true);
    console.log('playSong called with:', song);
    const songToPlay = song || currentSong;
    if (!songToPlay) {
        if (songs && songs.length > 0) {
            console.log('First song in list:', songs[0]);
            loadSong(songs[0]);
            audioRef.current?.play().catch(e => console.error("Playback error:", e));
        }
        return;
    }

    if (song && song.id !== currentSong?.id) {
        loadSong(song);
        const playWhenReady = () => audioRef.current?.play().catch(e => console.error("Playback error on load:", e));
        audioRef.current?.addEventListener('canplaythrough', playWhenReady, { once: true });
    } else {
        audioRef.current?.play().catch(e => console.error("Playback error:", e));
    }
  }, [currentSong, songs, loadSong, userHasInteracted]);

  // Effect to load a random song on initial app load when songs are available
  useEffect(() => {
    if (!initialSongLoaded && songs && songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      const randomSong = songs[randomIndex];
      
      console.log("Loading initial random song:", randomSong.title);
      playSong(randomSong);
      setInitialSongLoaded(true);
    }
  }, [songs, initialSongLoaded, playSong]);

  // Play next song
  const playNextSong = useCallback(() => {
    if (!currentSong || !songs || songs.length === 0) return;

    console.log('Playing next song');

    let nextSongIndex = -1;
    const playNext = autoplay;

    // Handle different playback modes
    if (shuffle) {
      // Regular shuffle - completely random
      const availableSongs = songs.filter(song => song.id !== currentSong.id);

      if (availableSongs.length === 0) return;

      const randomIndex = Math.floor(Math.random() * availableSongs.length);
      if (autoplay) {
        playSong(availableSongs[randomIndex]);
      } else {
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
          } else if (!playNext) {
            // Stop playback if we're at the end and not repeating
            return;
          } else {
            nextSongIndex = 1; // Default to first song if autoplay is on
          }
        }

        // Load and play next song
        if (autoplay) {
          playSong(songs[nextSongIndex]);
        } else {
          loadSong(songs[nextSongIndex]);
        }
      }
    }
  }, [currentSong, songs, shuffle, repeat, autoplay, loadSong, playSong]);

  useEffect(() => {
    const audioEl = audioRef.current;
    const handleEnded = () => playNextSong();

    if (audioEl) {
      audioEl.addEventListener('ended', handleEnded);
    }

    return () => {
      if (audioEl) {
        audioEl.removeEventListener('ended', handleEnded);
      }
    };
  }, [playNextSong]);

  // Pause the current song
  const pauseSong = useCallback(() => {
    if (!audioRef.current) return;

    console.log('Pausing song');
    audioRef.current.pause();
  }, []);

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
      if (autoplay) {
        playSong(songs[prevSongIndex]);
      } else {
        loadSong(songs[prevSongIndex]);
      }
    }
  }, [currentSong, songs, repeat, autoplay, loadSong, playSong]);

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

  const setVolumeCallback = useCallback((newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    savePlayerPreferences();
  }, [savePlayerPreferences]);

  const setCurrentTimeCallback = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setRepeatCallback = useCallback((value) => {
    setRepeat(value);
    savePlayerPreferences();
  }, [savePlayerPreferences]);

  const setShuffleCallback = useCallback((value) => {
    setShuffle(value);
    savePlayerPreferences();
  }, [savePlayerPreferences]);

  const setSmartShuffleEnabledCallback = useCallback((value) => {
    setSmartShuffleEnabled(value);
    savePlayerPreferences();
  }, [savePlayerPreferences]);

  const setAutoplayCallback = useCallback((value) => {
    setAutoplay(value);
    savePlayerPreferences();
  }, [savePlayerPreferences]);

  const contextValue = useMemo(() => ({
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
    setVolume: setVolumeCallback,
    setCurrentTime: setCurrentTimeCallback,
    setRepeat: setRepeatCallback,
    setShuffle: setShuffleCallback,
    setSmartShuffleEnabled: setSmartShuffleEnabledCallback,
    setAutoplay: setAutoplayCallback,
    setUserHasInteracted,
  }), [
    currentSong, isPlaying, duration, currentTime, volume, repeat, shuffle,
    smartShuffleEnabled, bassBoost, megaBoost, autoplay, audioRef,
    loadSong, playSong, pauseSong, playNextSong, playPreviousSong,
    toggleBassBoost, trackUserInteraction, setVolumeCallback, setCurrentTimeCallback,
    setRepeatCallback, setShuffleCallback, setSmartShuffleEnabledCallback, setAutoplayCallback,
    setUserHasInteracted
  ]);

  return (
    <PlayerContext.Provider value={contextValue}>
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
