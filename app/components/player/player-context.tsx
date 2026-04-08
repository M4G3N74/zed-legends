'use client';

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
  path?: string;
  duration?: number;
}

interface PlayerContextValue {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  queue: Song[];
  queueIndex: number;
  play: (song: Song) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: (song: Song) => void;
  playAll: (songs: Song[], startIndex?: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  const handleSongEnd = useCallback(() => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (queueIndex < queue.length - 1) {
      setQueueIndex((prev) => prev + 1);
      setCurrentSong(queue[queueIndex + 1]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      setQueueIndex(0);
      setCurrentSong(queue[0]);
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, queueIndex, queue]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
        }
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });

      audioRef.current.addEventListener('ended', () => {
        handleSongEnd();
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [handleSongEnd]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const play = useCallback(
    (song?: Song) => {
      if (song) {
        const existingIndex = queue.findIndex((s) => s.id === song.id);
        if (existingIndex !== -1) {
          setCurrentSong(song);
          setQueueIndex(existingIndex);
        } else {
          setQueue((prev) => {
            const newIndex = prev.length;
            setCurrentSong(song);
            setQueueIndex(newIndex);
            return [...prev, song];
          });
        }
      }
      setIsPlaying(true);
    },
    [queue]
  );

  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const next = useCallback(() => {
    setQueueIndex((currentIndex) => {
      const newIndex = currentIndex + 1;
      if (newIndex < queue.length) {
        setCurrentSong(queue[newIndex]);
        return newIndex;
      }
      return currentIndex;
    });
  }, [queue]);

  const previous = useCallback(() => {
    if (progress > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
    } else {
      setQueueIndex((currentIndex) => {
        const newIndex = currentIndex - 1;
        if (newIndex >= 0) {
          setCurrentSong(queue[newIndex]);
          return newIndex;
        }
        return currentIndex;
      });
    }
  }, [progress, queue]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffled((p) => !p), []);
  const toggleRepeat = useCallback(() => {
    setRepeatMode((mode) => {
      if (mode === 'none') return 'all';
      if (mode === 'all') return 'one';
      return 'none';
    });
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((prev) => prev.filter((_, i) => i !== index));
      if (index < queueIndex) setQueueIndex((prev) => prev - 1);
    },
    [queueIndex]
  );

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
  }, []);

  const playNext = useCallback(
    (song: Song) => {
      setQueue((prev) => {
        const newQueue = [...prev];
        newQueue.splice(queueIndex + 1, 0, song);
        return newQueue;
      });
    },
    [queueIndex]
  );

  const playAll = useCallback((songs: Song[], startIndex = 0) => {
    if (songs.length === 0) return;
    setQueue(songs);
    setQueueIndex(startIndex);
    setCurrentSong(songs[startIndex]);
    setIsPlaying(true);
  }, []);

  const value: PlayerContextValue = {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isShuffled,
    repeatMode,
    queue,
    queueIndex,
    play,
    pause,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playAll,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}
