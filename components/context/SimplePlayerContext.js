import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLibrary } from './LibraryContext';
import React from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const { songs } = useLibrary();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.2);
  const [repeat, setRepeat] = useState('none'); // 'none', 'one', 'all'
  const [shuffle, setShuffle] = useState(true);
  const [smartShuffleEnabled, setSmartShuffleEnabled] = useState(true);
  const [bassBoost, setBassBoost] = useState(false);
  const [megaBoost, setMegaBoost] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [initialSongLoaded, setInitialSongLoaded] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [playbackPrompt, setPlaybackPrompt] = useState(false);

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
          else setVolume(0.2); // Default to 20% volume
          if (preferences.shuffle !== undefined) setShuffle(preferences.shuffle);
          if (preferences.smartShuffleEnabled !== undefined) setSmartShuffleEnabled(preferences.smartShuffleEnabled);
          else setSmartShuffleEnabled(true); // Default to enabled
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

    // Only send like to backend
    if (interactionType === 'like') {
      console.log('Sending like interaction to backend:', { songId, userId: localStorage.getItem('userId') || 'anonymous' });
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
    } else if (smartShuffleEnabled) {
      // Only send play/skip to backend if smart shuffle is enabled
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
    if (!song || !(song.url || song.file || song.path)) {
      console.log('No song url, file, or path provided to loadSong', song);
      return;
    }

    // Always use song.url if present
    let fileUrl;
    if (song.url) {
      // Append a cache buster
      fileUrl = song.url + `?v=${new Date().getTime()}`;
    } else {
      // Fallback for legacy/local files
      const fileName = song.file || song.path;
      fileUrl = `/music/${encodeURIComponent(fileName)}?v=${new Date().getTime()}`;
    }

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
    if (!userHasInteracted) {
      setPlaybackPrompt(true);
      return;
    }
    setPlaybackPrompt(false);
    console.log('playSong called with:', song);
    const songToPlay = song || currentSong;
    if (!songToPlay) {
        if (songs && songs.length > 0) {
            console.log('First song in list:', songs[0]);
            loadSong(songs[0]);
            audioRef.current?.play().catch(e => {
              if (e.name === 'NotAllowedError') {
                setPlaybackPrompt(true);
                setUserHasInteracted(false);
              } else {
                console.error("Playback error:", e);
              }
            });
        }
        return;
    }

    if (song && song.id !== currentSong?.id) {
        loadSong(song);
        const playWhenReady = () => audioRef.current?.play().catch(e => {
          if (e.name === 'NotAllowedError') {
            setPlaybackPrompt(true);
            setUserHasInteracted(false);
          } else {
            console.error("Playback error on load:", e);
          }
        });
        audioRef.current?.addEventListener('canplaythrough', playWhenReady, { once: true });
    } else {
        audioRef.current?.play().catch(e => {
          if (e.name === 'NotAllowedError') {
            setPlaybackPrompt(true);
            setUserHasInteracted(false);
          } else {
            console.error("Playback error:", e);
          }
        });
    }
  }, [currentSong, songs, loadSong, userHasInteracted]);

  // Handler for user gesture to unlock playback
  const handleUserPlaybackUnlock = () => {
    // Increase volume to saved preference on first interaction
    const savedPrefs = localStorage.getItem('playerPreferences');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      if (prefs.volume !== undefined && prefs.volume > 0.2) {
        setVolume(prefs.volume);
        if (audioRef.current) audioRef.current.volume = prefs.volume;
      }
    } else {
      setVolume(1);
      if (audioRef.current) audioRef.current.volume = 1;
    }
    
    setUserHasInteracted(true);
    setPlaybackPrompt(false);
    if (currentSong) {
      audioRef.current?.play().catch(console.error);
    }
  };

  // Effect to load a random song on initial app load when songs are available
  useEffect(() => {
    if (!initialSongLoaded && songs && songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      const randomSong = songs[randomIndex];
      
      console.log("Loading initial random song:", randomSong.title);
      loadSong(randomSong);
      setInitialSongLoaded(true);
    }
  }, [songs, initialSongLoaded, loadSong]);

  // Play next song
  const playNextSong = useCallback(() => {
    if (!currentSong || !songs || songs.length === 0) return;

    console.log('Playing next song');

    // Check if DJ Purple is active and has a recommendation
    if (window.djGetNextSong) {
      const djRecommendation = window.djGetNextSong();
      if (djRecommendation && autoplay) {
        playSong(djRecommendation);
        return;
      }
    }

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
            nextSongIndex = 0; // Default to first song if autoplay is on
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
      
      {playbackPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-surface/95 backdrop-blur-xl p-8 rounded-2xl border border-overlay/30 shadow-2xl flex flex-col items-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-gradient-to-br from-mauve to-lavender rounded-2xl flex items-center justify-center mb-4">
              <i className="fas fa-play text-background text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Listening</h3>
            <p className="text-muted text-center mb-6">Click to start playing music</p>
            <button
              onClick={handleUserPlaybackUnlock}
              className="px-6 py-3 bg-gradient-to-r from-mauve to-lavender text-background rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              <i className="fas fa-play mr-2"></i>
              Start Playing
            </button>
          </div>
        </div>
      )}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
