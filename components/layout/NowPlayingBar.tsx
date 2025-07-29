import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { usePlayer, SimplePlayerContextType } from '../context/SimplePlayerContext';

interface RepeatToastProps {
  mode: string | null;
  onClose: () => void;
}

function RepeatToast({ mode, onClose }: RepeatToastProps) {
  if (!mode) return null;
  let text = '';
  if (mode === 'all') text = 'Repeat All Enabled';
  else if (mode === 'one') text = 'Repeat One Enabled';
  else text = 'Repeat Off';
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[999] bg-mauve text-background px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
      {text}
    </div>
  );
}

interface DownloadToastProps {
  show: boolean;
}

function DownloadToast({ show }: DownloadToastProps) {
  if (!show) return null;
  return (
    <div className="fixed bottom-36 left-1/2 transform -translate-x-1/2 z-[999] bg-mauve text-background px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
      Song download started
    </div>
  );
}

interface NowPlayingBarProps {
  isMobile: boolean;
}

export default function NowPlayingBar({ isMobile }: NowPlayingBarProps) {
  const {
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    playSong,
    pauseSong,
    resumeSong,
    playNextSong,
    playPreviousSong,
    seek,
    setVolume
  } = usePlayer() as SimplePlayerContextType;

  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [repeatToast, setRepeatToast] = useState<string | null>(null);
  const repeatToastTimeout = useRef<NodeJS.Timeout | null>(null);
  const [downloadToast, setDownloadToast] = useState<boolean>(false);
  const downloadToastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Format time in MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Update progress bar width
  useEffect(() => {
    if (progressBarRef.current) {
      const progressPercent = (currentTime / duration) * 100 || 0;
      progressBarRef.current.style.width = `${progressPercent}%`;
    }
  }, [currentTime, duration]);

  // Handle progress bar click/touch
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!duration) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const position = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const clickPosition = position / rect.width;
    seek(clickPosition * duration);
  };

  // Handle swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartXRef.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next song
        playNextSong();
      } else {
        // Swipe right - previous song
        playPreviousSong();
      }
    }

    touchStartXRef.current = null;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  // Toggle expanded player view (mobile only)
  const toggleExpandedView = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRepeatClick = () => {
    // Repeat functionality disabled for now
    setRepeatToast('none');
    if (repeatToastTimeout.current) clearTimeout(repeatToastTimeout.current);
    repeatToastTimeout.current = setTimeout(() => setRepeatToast(null), 1500);
  };

  const handleDownload = () => {
    if (currentSong?.path) {
      const url = `/api/download?path=${encodeURIComponent(currentSong.path)}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = currentSong.title ? `${currentSong.title}.mp3` : 'download.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadToast(true);
      if (downloadToastTimeout.current) clearTimeout(downloadToastTimeout.current);
      downloadToastTimeout.current = setTimeout(() => setDownloadToast(false), 1500);
    }
  };

  // Mobile compact bar and expanded view
  if (isMobile) {
    if (isExpanded) {
      // Render expanded player view (same as desktop expanded)
      return (
        <div className="fixed inset-0 z-50 bg-surface flex flex-col" style={{ paddingBottom: '4rem' }}>
          {/* Close button */}
          <button
            className="self-end text-muted p-2"
            onClick={toggleExpandedView}
            aria-label="Collapse player"
          >
            <i className="fas fa-chevron-down"></i>
          </button>

          {/* Album art - large */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-xs aspect-square rounded-lg overflow-hidden shadow-lg mx-auto">
              {currentSong?.album_art ? (
                <Image
                  src={currentSong.album_art}
                  alt={currentSong.title}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <i className="fas fa-music text-5xl text-muted" aria-label="No album art"></i>
                </div>
              )}
            </div>
          </div>

          {/* Song info */}
          <div className="text-center my-6">
            <h2 className="text-xl font-bold truncate">{currentSong?.title || 'No track selected'}</h2>
            <p className="text-muted truncate">{currentSong?.artist || 'Select a track to play'}</p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-6 px-4">
            <span className="text-sm text-muted">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-2 bg-overlay rounded-full overflow-hidden cursor-pointer"
              onClick={handleProgressClick}
            >
              <div ref={progressBarRef} className="h-full bg-mauve"></div>
            </div>
            <span className="text-sm text-muted">{formatTime(duration)}</span>
          </div>

          {/* Main controls - now with all features */}
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <button
              className="p-2 text-lg text-muted hover:text-text"
              aria-label="Shuffle"
              onClick={() => {}}
            >
              <i className="fas fa-random"></i>
            </button>
            <button
              className="p-2 text-lg text-muted hover:text-text"
              aria-label="Repeat"
              onClick={handleRepeatClick}
            >
              <i className="fas fa-redo"></i>
            </button>
            <button
              className="p-2 text-lg text-muted hover:text-pink-400"
              aria-label="Like song"
              onClick={() => {}}
            >
              <i className="fas fa-heart"></i>
            </button>
            <button
              className="p-2 text-lg text-muted hover:text-text"
              aria-label="Download song"
              onClick={handleDownload}
            >
              <i className="fas fa-download"></i>
            </button>
            <button
              className="text-2xl text-muted hover:text-text"
              aria-label="Previous song"
              title="Previous"
              onClick={playPreviousSong}
            >
              <i className="fas fa-step-backward"></i>
            </button>
            <button
              className="w-16 h-16 bg-mauve text-background rounded-full flex items-center justify-center text-2xl hover:bg-mauve/90 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={handlePlayPause}
            >
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </button>
            <button
              className="text-2xl text-muted hover:text-text"
              aria-label="Next song"
              onClick={playNextSong}
            >
              <i className="fas fa-step-forward"></i>
            </button>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2 px-4 mb-4">
            <i className="fas fa-volume-down text-muted"></i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-overlay rounded-lg appearance-none cursor-pointer"
            />
            <i className="fas fa-volume-up text-muted"></i>
          </div>
        </div>
      );
    }

    // Mobile compact bar
    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-surface border-t border-overlay p-2">
        {currentSong && (
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={toggleExpandedView}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
              {currentSong.album_art ? (
                <Image
                  src={currentSong.album_art}
                  alt={currentSong.title}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-background flex items-center justify-center">
                  <i className="fas fa-music text-muted"></i>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{currentSong.title}</div>
              <div className="text-sm text-muted truncate">{currentSong.artist}</div>
            </div>
            <button
              className="p-2 text-xl"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
            >
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Desktop version - simplified
  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-overlay p-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
          {currentSong.album_art ? (
            <Image
              src={currentSong.album_art}
              alt={currentSong.title}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-background flex items-center justify-center">
              <i className="fas fa-music text-muted"></i>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{currentSong.title}</div>
          <div className="text-sm text-muted truncate">{currentSong.artist}</div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={playPreviousSong} className="p-2 text-muted hover:text-text">
            <i className="fas fa-step-backward"></i>
          </button>
          <button onClick={handlePlayPause} className="p-2 text-xl">
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          <button onClick={playNextSong} className="p-2 text-muted hover:text-text">
            <i className="fas fa-step-forward"></i>
          </button>
        </div>
      </div>
      
      <RepeatToast mode={repeatToast} onClose={() => setRepeatToast(null)} />
      <DownloadToast show={downloadToast} />
    </div>
  );
}