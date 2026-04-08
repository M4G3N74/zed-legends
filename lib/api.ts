export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  path: string;
  url: string;
  size?: number;
  duration?: number;
  coverUrl?: string;
  lastModified?: string;
}

export interface SongsResponse {
  songs: Song[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000');

export const apiEndpoints = {
  songs: `${API_BASE_URL}/api/songs`,
};

export async function fetchSongs(
  options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<SongsResponse> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.search) params.set('search', options.search);

  const url = `${apiEndpoints.songs}?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch songs');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching songs:', error);
    return { songs: [], total: 0, page: 1, limit: 50, hasMore: false };
  }
}

export async function searchSongs(query: string): Promise<Song[]> {
  if (!query.trim()) return [];

  const result = await fetchSongs({ search: query, limit: 20 });
  return result.songs;
}
