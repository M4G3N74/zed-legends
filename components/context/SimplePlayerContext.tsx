import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { useLibrary } from './LibraryContext';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  path: string;
  album_art?: string;
  url?: string;
}

interface SimplePlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
  togglePlayPause: () => void;
  shuffleSongs: () => void;
  repeatSong: () => void;
  isShuffling: boolean;
  isRepeating: boolean;
  currentPlaylist: Song[];
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  queue: Song[];
  playQueue: (songs: Song[]) => void;
  playSongFromQueue: (songId: string) => void;
  userHasInteracted: boolean;
  setUserHasInteracted: (hasInteracted: boolean) => void;
}

const SimplePlayerContext = createContext<SimplePlayerContextType | undefined>(undefined);

export function SimplePlayerProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>([]);
  const [userHasInteracted, setUserHasInteracted] = useState<boolean>(false);

  const { songs: librarySongs } = useLibrary();

  // Load songs from library
  useEffect(() => {
    setSongs(librarySongs);
    setCurrentPlaylist(librarySongs);
  }, [librarySongs]);

  const playSong = useCallback((song: Song) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio();
    const audioUrl = `/api/proxy-audio?url=${encodeURIComponent(song.url || song.path)}`;
    audio.src = audioUrl;
    
    audio.addEventListener('play', () => {
      setIsPlaying(true);
      // Track stream when song starts playing
      fetch('/api/track-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: song.id,
          title: song.title,
          artist: song.artist
        })
      }).catch(error => console.error('Stream tracking failed:', error));
    });
    
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      if (isRepeating) {
        playSong(song);
      } else {
        playNextSong();
      }
    });
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    });
    
    audio.play().then(() => {
      setCurrentSong(song);
      setCurrentAudio(audio);
      setUserHasInteracted(true);
    }).catch(error => {
      console.error('Play failed:', error);
    });
  }, [currentAudio, isRepeating]);

  const pauseSong = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
    }
  }, [currentAudio]);

  const resumeSong = useCallback(() => {
    if (currentAudio) {
      currentAudio.play().catch(error => {
        console.error('Resume failed:', error);
      });
    }
  }, [currentAudio]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  }, [isPlaying, pauseSong, resumeSong]);

  const seek = useCallback((time: number) => {
    if (currentAudio) {
      currentAudio.currentTime = time;
    }
  }, [currentAudio]);

  const setVolume = useCallback((vol: number) => {
    if (currentAudio) {
      currentAudio.volume = vol;
    }
    setVolumeState(vol);
  }, [currentAudio]);

  const playNextSong = useCallback(() => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(prev => prev.slice(1));
      playSong(nextSong);
      return;
    }

    if (currentPlaylist.length > 0 && currentSong) {
      const currentIndex = currentPlaylist.findIndex(s => s.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % currentPlaylist.length;
      playSong(currentPlaylist[nextIndex]);
    }
  }, [queue, currentPlaylist, currentSong, playSong]);

  const playPreviousSong = useCallback(() => {
    if (currentPlaylist.length > 0 && currentSong) {
      const currentIndex = currentPlaylist.findIndex(s => s.id === currentSong.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentPlaylist.length - 1;
      playSong(currentPlaylist[prevIndex]);
    }
  }, [currentPlaylist, currentSong, playSong]);

  const shuffleSongs = useCallback(() => {
    setIsShuffling(prev => !prev);
  }, []);

  const repeatSong = useCallback(() => {
    setIsRepeating(prev => !prev);
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((songId: string) => {
    setQueue(prev => prev.filter(song => song.id !== songId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playQueue = useCallback((songs: Song[]) => {
    setQueue(songs);
    if (songs.length > 0) {
      playSong(songs[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [playSong]);

  const playSongFromQueue = useCallback((songId: string) => {
    const songIndex = queue.findIndex(s => s.id === songId);
    if (songIndex !== -1) {
      const songToPlay = queue[songIndex];
      setQueue(prev => prev.filter((_, index) => index !== songIndex));
      playSong(songToPlay);
    }
  }, [queue, playSong]);

  const value: SimplePlayerContextType = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playSong,
    pauseSong,
    resumeSong,
    seek,
    setVolume,
    playNextSong,
    playPreviousSong,
    togglePlayPause,
    shuffleSongs,
    repeatSong,
    isShuffling,
    isRepeating,
    currentPlaylist,
    addToQueue,
    removeFromQueue,
    clearQueue,
    queue,
    playQueue,
    playSongFromQueue,
    userHasInteracted,
    setUserHasInteracted,
  };

  return (
    <SimplePlayerContext.Provider value={value}>
      {children}
    </SimplePlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(SimplePlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a SimplePlayerProvider');
  }
  return context;
}