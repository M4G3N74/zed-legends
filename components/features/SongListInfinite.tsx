import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
}

interface SongListInfiniteProps {
  onEdit: (song: Song) => void;
}

export default function SongListInfinite({ onEdit }: SongListInfiniteProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const pageSize = 50;

  const fetchSongs = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/songs?page=${pageToFetch}&pageSize=${pageSize}`);
      const data = await res.json();
      if (pageToFetch === 1) {
        setSongs(data.songs);
      } else {
        setSongs(prev => [...prev, ...data.songs]);
      }
      setHasMore(data.hasMore);
    } catch (err: any) {
      // Optionally handle error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs(page);
  }, [page, fetchSongs]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(p => p + 1);
        }
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-surface rounded-lg">
        <thead>
          <tr className="border-b border-overlay">
            <th className="text-left p-3">Title</th>
            <th className="text-left p-3">Artist</th>
            <th className="text-left p-3">Album</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {songs.map(song => (
            <tr key={song.id} className="border-b border-overlay hover:bg-overlay/50">
              <td className="p-3 font-mono">{song.title}</td>
              <td className="p-3">{song.artist}</td>
              <td className="p-3">{song.album}</td>
              <td className="p-3">
                <button
                  onClick={() => onEdit(song)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm mr-2"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div ref={loaderRef} className="flex justify-center items-center h-16">
        {isLoading && <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauve"></div>}
        {!hasMore && <span className="text-mauve">No more songs</span>}
      </div>
    </div>
  );
}