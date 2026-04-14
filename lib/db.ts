import { supabase, isSupabaseConfigured } from './supabase';
import type {
  Favorite,
  Playlist,
  PlaylistSong,
  PlaylistWithSongs,
  ListeningHistory,
} from './database.types';
import type { Song } from './api';

function getStoredUser(): { id: string; email: string; name: string } | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('zed_user');
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    return user.id ? { id: user.id, email: user.email, name: user.name } : null;
  } catch {
    return null;
  }
}

function getAuthenticatedUserId(): string | null {
  const user = getStoredUser();
  return user?.id || null;
}

function getAnonymousData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
}

function setAnonymousData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const favorites = {
  async getAll(): Promise<Favorite[]> {
    const userId = getAuthenticatedUserId();
    if (!userId) {
      return getAnonymousData<Favorite[]>('zed_favorites', []);
    }

    if (!isSupabaseConfigured) {
      return getAnonymousData<Favorite[]>('zed_favorites', []);
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }

    return data || [];
  },

  async add(song: Song): Promise<Favorite | null> {
    const userId = getAuthenticatedUserId();
    if (!userId) return null;

    if (!isSupabaseConfigured) {
      const favorites = await this.getAll();
      const newFavorite: Favorite = {
        id: `local_${Date.now()}`,
        user_id: 'anonymous',
        song_id: song.id,
        song_path: song.path,
        song_title: song.title,
        song_artist: song.artist,
        song_url: song.url,
        created_at: new Date().toISOString(),
      };
      favorites.push(newFavorite);
      setAnonymousData('zed_favorites', favorites);
      return newFavorite;
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        song_id: song.id,
        song_path: song.path,
        song_title: song.title,
        song_artist: song.artist,
        song_url: song.url,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding favorite:', error);
      return null;
    }

    return data;
  },

  async remove(songId: string): Promise<boolean> {
    const userId = getAuthenticatedUserId();
    if (!userId) return false;

    if (!isSupabaseConfigured) {
      const favorites = await this.getAll();
      const filtered = favorites.filter((f) => f.song_id !== songId);
      setAnonymousData('zed_favorites', filtered);
      return true;
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('song_id', songId);

    if (error) {
      console.error('Error removing favorite:', error);
      return false;
    }

    return true;
  },

  async isFavorite(songId: string): Promise<boolean> {
    const userId = getAuthenticatedUserId();
    if (!userId) return false;

    if (!isSupabaseConfigured) {
      const favorites = await this.getAll();
      return favorites.some((f) => f.song_id === songId);
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .single();

    return !error && !!data;
  },

  async toggle(song: Song): Promise<boolean> {
    const isFav = await this.isFavorite(song.id);
    if (isFav) {
      await this.remove(song.id);
      return false;
    } else {
      await this.add(song);
      return true;
    }
  },
};

export const playlists = {
  async getAll(): Promise<Playlist[]> {
    const userId = getAuthenticatedUserId();
    if (!userId) {
      return getAnonymousData<Playlist[]>('zed_playlists', []);
    }

    if (!isSupabaseConfigured) {
      return getAnonymousData<Playlist[]>('zed_playlists', []);
    }

    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }

    return data || [];
  },

  async getWithSongs(playlistId: string): Promise<PlaylistWithSongs | null> {
    if (!isSupabaseConfigured) {
      const playlists = getAnonymousData<Playlist[]>('zed_playlists', []);
      const songs = getAnonymousData<PlaylistSong[]>('zed_playlist_songs', []);
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) return null;
      const playlistSongs = songs.filter((s) => s.playlist_id === playlistId);
      return {
        ...playlist,
        songs: playlistSongs,
        song_count: playlistSongs.length,
      };
    }

    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .single();

    if (playlistError || !playlist) return null;

    const { data: songs, error: songsError } = await supabase
      .from('playlist_songs')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });

    if (songsError) {
      console.error('Error fetching playlist songs:', songsError);
      return { ...playlist, songs: [], song_count: 0 };
    }

    return {
      ...playlist,
      songs: songs || [],
      song_count: (songs || []).length,
    };
  },

  async create(name: string, description?: string): Promise<Playlist | null> {
    const userId = getAuthenticatedUserId();
    if (!userId) return null;

    if (!isSupabaseConfigured) {
      const playlists = await this.getAll();
      const newPlaylist: Playlist = {
        id: `local_${Date.now()}`,
        user_id: 'anonymous',
        name,
        description,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      playlists.push(newPlaylist);
      setAnonymousData('zed_playlists', playlists);
      return newPlaylist;
    }

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: userId,
        name,
        description,
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating playlist:', error);
      return null;
    }

    return data;
  },

  async update(
    id: string,
    updates: { name?: string; description?: string }
  ): Promise<boolean> {
    const userId = getAuthenticatedUserId();
    if (!userId) return false;

    if (!isSupabaseConfigured) {
      const playlists = await this.getAll();
      const index = playlists.findIndex((p) => p.id === id);
      if (index === -1) return false;
      playlists[index] = { ...playlists[index], ...updates };
      setAnonymousData('zed_playlists', playlists);
      return true;
    }

    const { error } = await supabase
      .from('playlists')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating playlist:', error);
      return false;
    }

    return true;
  },

  async delete(id: string): Promise<boolean> {
    const userId = getAuthenticatedUserId();
    if (!userId) return false;

    if (!isSupabaseConfigured) {
      const playlists = await this.getAll();
      const filtered = playlists.filter((p) => p.id !== id);
      setAnonymousData('zed_playlists', filtered);
      return true;
    }

    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting playlist:', error);
      return false;
    }

    return true;
  },

  async addSong(playlistId: string, song: Song): Promise<boolean> {
    const userId = getAuthenticatedUserId();
    if (!userId) return false;

    if (!isSupabaseConfigured) {
      const songs = getAnonymousData<PlaylistSong[]>('zed_playlist_songs', []);
      const newSong: PlaylistSong = {
        id: `local_${Date.now()}`,
        playlist_id: playlistId,
        song_id: song.id,
        song_path: song.path,
        song_title: song.title,
        song_artist: song.artist,
        song_url: song.url,
        position: songs.length,
        added_at: new Date().toISOString(),
      };
      songs.push(newSong);
      setAnonymousData('zed_playlist_songs', songs);
      return true;
    }

    const { count } = await supabase
      .from('playlist_songs')
      .select('*', { count: 'exact', head: true })
      .eq('playlist_id', playlistId);

    const { error } = await supabase.from('playlist_songs').insert({
      playlist_id: playlistId,
      song_id: song.id,
      song_path: song.path,
      song_title: song.title,
      song_artist: song.artist,
      song_url: song.url,
      position: (count || 0) + 1,
    });

    if (error) {
      console.error('Error adding song to playlist:', error);
      return false;
    }

    return true;
  },

  async removeSong(playlistId: string, songId: string): Promise<boolean> {
    const userId = getAuthenticatedUserId();
    if (!userId) return false;

    if (!isSupabaseConfigured) {
      const songs = getAnonymousData<PlaylistSong[]>('zed_playlist_songs', []);
      const filtered = songs.filter(
        (s) => !(s.playlist_id === playlistId && s.song_id === songId)
      );
      setAnonymousData('zed_playlist_songs', filtered);
      return true;
    }

    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);

    if (error) {
      console.error('Error removing song from playlist:', error);
      return false;
    }

    return true;
  },
};

export const history = {
  async getAll(): Promise<ListeningHistory[]> {
    const userId = getAuthenticatedUserId();
    if (!userId) {
      return getAnonymousData<ListeningHistory[]>('zed_history', []);
    }

    if (!isSupabaseConfigured) {
      return getAnonymousData<ListeningHistory[]>('zed_history', []);
    }

    const { data, error } = await supabase
      .from('listening_history')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data || [];
  },

  async add(song: Song, durationPlayed: number = 0): Promise<boolean> {
    const userId = getAuthenticatedUserId();
    if (!userId) return false;

    if (!isSupabaseConfigured) {
      const history = await this.getAll();
      const newEntry: ListeningHistory = {
        id: `local_${Date.now()}`,
        user_id: 'anonymous',
        song_id: song.id,
        song_path: song.path,
        song_title: song.title,
        song_artist: song.artist,
        song_url: song.url,
        duration_played: durationPlayed,
        played_at: new Date().toISOString(),
      };
      history.unshift(newEntry);
      setAnonymousData('zed_history', history.slice(0, 100));
      return true;
    }

    const { error } = await supabase.from('listening_history').insert({
      user_id: userId,
      song_id: song.id,
      song_path: song.path,
      song_title: song.title,
      song_artist: song.artist,
      song_url: song.url,
      duration_played: durationPlayed,
    });

    if (error) {
      console.error('Error adding to history:', error);
      return false;
    }

    return true;
  },

  async clear(): Promise<boolean> {
    const userId = getAuthenticatedUserId();
    if (!userId) {
      setAnonymousData('zed_history', []);
      return true;
    }

    if (!isSupabaseConfigured) {
      setAnonymousData('zed_history', []);
      return true;
    }

    const { error } = await supabase
      .from('listening_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing history:', error);
      return false;
    }

    return true;
  },
};
