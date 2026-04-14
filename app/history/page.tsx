'use client';

import { Header } from '../components/layout';
import { AlbumArt } from '../components/ui';
import { PlayIcon, ClockIcon, TrashIcon } from '../components/icons';
import { useHistory, useClearHistory } from '@/lib/hooks';
import { usePlayer } from '../components/player';

export default function HistoryPage() {
  const { data: history = [], isLoading } = useHistory(50);
  const clearHistory = useClearHistory();
  const { play } = usePlayer();

  const handlePlaySong = (item: (typeof history)[0]) => {
    play({
      id: item.song_id,
      title: item.song_title,
      artist: item.song_artist,
      audioUrl: item.song_url,
      path: item.song_path,
    });
  };

  const handleClearHistory = () => {
    if (confirm('Clear your listening history?')) {
      clearHistory.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <Header title="Recently Played" />
        <div className="px-4 pt-4 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-surface" />
              <div className="flex-1">
                <div className="h-4 bg-surface rounded w-3/4 mb-1" />
                <div className="h-3 bg-surface rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="Recently Played"
        rightContent={
          history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 text-xs text-muted hover:text-love transition-colors"
            >
              Clear
            </button>
          )
        }
      />

      <div className="px-4 pt-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-4">
              <ClockIcon size={40} className="text-muted" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No listening history</h3>
            <p className="text-sm text-muted text-center max-w-xs">
              Songs you play will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-muted mb-4">
              {history.length} {history.length === 1 ? 'song' : 'songs'} played
            </p>
            {history.map((item, i) => (
              <button
                key={item.id}
                onClick={() => handlePlaySong(item)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all text-left group animate-fade-up"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <AlbumArt
                    title={item.song_title}
                    artist={item.song_artist}
                    size="sm"
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {item.song_title}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {item.song_artist}
                  </p>
                </div>
                <div className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(item.played_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
