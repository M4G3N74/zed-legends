'use client';

import { usePlayer } from './player-context';
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  QueueIcon,
} from '../icons';
import { IconButton } from '../ui';
import { AlbumArt } from '../ui';

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface PlayerBarProps {
  onOpenFullPlayer?: () => void;
  onOpenQueue?: () => void;
}

export function PlayerBar({ onOpenFullPlayer, onOpenQueue }: PlayerBarProps) {
  const {
    currentSong,
    isPlaying,
    toggle,
    progress,
    duration,
    previous,
    next,
    queue,
  } = usePlayer();

  if (!currentSong) return null;

  const handleDoubleClick = () => {
    if (onOpenFullPlayer) {
      onOpenFullPlayer();
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-20 glass-subtle border-t border-border safe-bottom">
      <div className="flex items-center gap-3 px-4 py-2">
        <button
          onClick={handleDoubleClick}
          className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <AlbumArt
              title={currentSong.title}
              artist={currentSong.artist}
              size="sm"
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate text-text group-hover:text-accent transition-colors">
              {currentSong.title}
            </p>
            <p className="text-xs truncate text-muted">{currentSong.artist}</p>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <IconButton label="Previous" onClick={previous}>
            <SkipBackIcon size={20} />
          </IconButton>
          <button
            onClick={toggle}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-bg hover:bg-accent-hover transition-colors"
          >
            {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
          <IconButton label="Next" onClick={next}>
            <SkipForwardIcon size={20} />
          </IconButton>
          {onOpenQueue && (
            <IconButton label="Queue" onClick={onOpenQueue}>
              <div className="relative">
                <QueueIcon size={20} />
                {queue.length > 1 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-2xs bg-accent text-bg rounded-full flex items-center justify-center font-bold">
                    {queue.length > 9 ? '9+' : queue.length}
                  </span>
                )}
              </div>
            </IconButton>
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-100"
            style={{ width: `${(progress / duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-2xs text-muted">{formatTime(progress)}</span>
          <span className="text-2xs text-muted">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
