'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePlayer } from './player-context';
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  ShuffleIcon,
  RepeatIcon,
  VolumeIcon,
  VolumeMuteIcon,
  ChevronDownIcon,
  HeartOutlineIcon,
  HeartIcon,
  QueueIcon,
} from '../icons';
import { AlbumArt } from '../ui';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function FullPlayer({ isOpen, onClose }: FullPlayerProps) {
  const {
    currentSong,
    isPlaying,
    toggle,
    progress,
    duration,
    volume,
    isShuffled,
    repeatMode,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [localVolume, setLocalVolume] = useState(volume);
  const [isLiked, setIsLiked] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      setLocalVolume(volume);
    }
  }, [volume]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = Math.max(0, Math.min(duration, percent * duration));
      seek(newTime);
    },
    [duration, seek]
  );

  const handleProgressDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      setDragProgress(percent * duration);
    },
    [duration]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setLocalVolume(newVolume);
      setVolume(newVolume);
    },
    [setVolume]
  );

  const currentTime = isDragging ? dragProgress : progress;
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  if (!isOpen || !currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 animate-slide-up">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-bg to-bg" />

      <div className="relative h-full flex flex-col px-6 pt-4 pb-8">
        <button
          onClick={onClose}
          className="self-start p-2 -ml-2 rounded-full hover:bg-surface-hover transition-colors"
        >
          <ChevronDownIcon size={24} />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-md mx-auto w-full">
          <div className="relative w-full aspect-square max-w-xs rounded-3xl overflow-hidden shadow-2xl shadow-accent/20">
            <AlbumArt
              title={currentSong.title}
              artist={currentSong.artist}
              size="lg"
              className="w-full h-full"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent animate-pulse-subtle" />
            )}
          </div>

          <div className="text-center w-full">
            <h2 className="text-xl font-bold truncate mb-1">
              {currentSong.title}
            </h2>
            <p className="text-muted truncate">{currentSong.artist}</p>
          </div>

          <div className="w-full space-y-4">
            <div
              ref={progressRef}
              className="relative h-1.5 bg-border rounded-full cursor-pointer group"
              onClick={handleProgressClick}
              onMouseMove={handleProgressDrag}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <div
                className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progressPercent}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                isShuffled ? 'text-accent' : 'text-muted hover:text-text'
              }`}
            >
              <ShuffleIcon size={20} />
            </button>

            <button
              onClick={previous}
              className="p-2 rounded-full text-text hover:text-accent transition-colors"
            >
              <SkipBackIcon size={28} />
            </button>

            <button
              onClick={toggle}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-accent text-bg hover:bg-accent-hover transition-all hover:scale-105"
            >
              {isPlaying ? (
                <PauseIcon size={28} />
              ) : (
                <PlayIcon size={28} className="ml-1" />
              )}
            </button>

            <button
              onClick={next}
              className="p-2 rounded-full text-text hover:text-accent transition-colors"
            >
              <SkipForwardIcon size={28} />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-colors relative ${
                repeatMode !== 'none'
                  ? 'text-accent'
                  : 'text-muted hover:text-text'
              }`}
            >
              <RepeatIcon size={20} />
              {repeatMode === 'one' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-2xs font-bold">
                  1
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4 w-full max-w-xs">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              className="text-muted hover:text-text transition-colors"
            >
              {volume > 0 ? (
                <VolumeIcon size={20} />
              ) : (
                <VolumeMuteIcon size={20} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localVolume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
              style={{
                background: `linear-gradient(to right, var(--accent) ${localVolume * 100}%, var(--border) ${localVolume * 100}%)`,
              }}
            />
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 transition-colors ${isLiked ? 'text-love' : 'text-muted hover:text-love'}`}
            >
              {isLiked ? (
                <HeartIcon size={24} />
              ) : (
                <HeartOutlineIcon size={24} />
              )}
            </button>
            <button className="p-2 text-muted hover:text-text transition-colors">
              <QueueIcon size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
