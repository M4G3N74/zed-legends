import { supabase, isSupabaseConfigured } from './supabase';
import type {
  Favorite,
  Playlist,
  PlaylistSong,
  PlaylistWithSongs,
  ListeningHistory,
} from './database.types';
import type { Song } from './api';

const ANONYMOUS_ID = 'anonymous';

function getUserId(): string {
  if (typeof window === 'undefined') return ANONYMOUS_ID;

  const storedUser = localStorage.getItem('zed_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user.id) return user.id;
    } catch {}
  }

  let userId = localStorage.getItem('zed_user_id');
  if (!userId) {
    userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('zed_user_id', userId);
  }
  return userId;
}

function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  const storedUser = localStorage.getItem('zed_user');
  if (!storedUser) return false;
  try {
    const user = JSON.parse(storedUser);
    return Boolean(user.id);
  } catch {
    return false;
  }
}

async function fetchUserData(): Promise<{
  favorites: Favorite[];
  playlists: Playlist[];
  history: ListeningHistory[];
} | null> {
  if (!isLoggedIn()) return null;

  const user = getStoredUser();
  if (!user) return null;

  try {
    const res = await fetch('/api/user/data', {
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

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

async function updateUserData(
  action: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!isLoggedIn()) return false;

  const user = getStoredUser();
  if (!user) return false;

  try {
    const res = await fetch('/api/user/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
      body: JSON.stringify({ action, ...payload }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const favorites = {
  async getAll(): Promise<Favorite[]> {
    if (isLoggedIn()) {
      const userData = await fetchUserData();
      if (userData) return userData.favorites;
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('zed_favorites');
      return stored ? JSON.parse(stored) : [];
    }

    const userId = getUserId();
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
    if (isLoggedIn()) {
      const success = await updateUserData('add_favorite', {
        song: {
          song_id: song.id,
          song_title: song.title,
          song_artist: song.artist,
          song_url: song.url,
          song_path: song.path,
        },
      });
      if (success) {
        return {
          id: `${Date.now()}`,
          user_id: 'current',
          song_id: song.id,
          song_path: song.path,
          song_title: song.title,
          song_artist: song.artist,
          song_url: song.url,
          created_at: new Date().toISOString(),
        };
      }
      return null;
    }

    if (!isSupabaseConfigured) {
      const favorites = await this.getAll();
      const newFavorite: Favorite = {
        id: `local_${Date.now()}`,
        user_id: ANONYMOUS_ID,
        song_id: song.id,
        song_path: song.path,
        song_title: song.title,
        song_artist: song.artist,
        song_url: song.url,
        created_at: new Date().toISOString(),
      };
      favorites.push(newFavorite);
      localStorage.setItem('zed_favorites', JSON.stringify(favorites));
      return newFavorite;
    }

    const userId = getUserId();
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
    if (isLoggedIn()) {
      return updateUserData('remove_favorite', { song_id: songId });
    }

    if (!isSupabaseConfigured) {
      const favorites = await this.getAll();
      const filtered = favorites.filter((f) => f.song_id !== songId);
      localStorage.setItem('zed_favorites', JSON.stringify(filtered));
      return true;
    }

    const userId = getUserId();
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
    const userFavorites = await this.getAll();
    return userFavorites.some((f) => f.song_id === songId);
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
    if (isLoggedIn()) {
      const userData = await fetchUserData();
      if (userData) {
        return userData.playlists.map((p) => ({
          id: p.id,
          user_id: 'current',
          name: p.name,
          description: p.description,
          is_public: false,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));
      }
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('zed_playlists');
      return stored ? JSON.parse(stored) : [];
    }

    const userId = getUserId();
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
    if (isLoggedIn()) {
      const userData = await fetchUserData();
      if (userData) {
        const playlist = userData.playlists.find((p) => p.id === playlistId);
        if (playlist) {
          return {
            id: playlist.id,
            user_id: 'current',
            name: playlist.name,
            description: playlist.description,
            is_public: false,
            created_at: playlist.created_at,
            updated_at: playlist.updated_at,
            songs: playlist.songs,
            song_count: playlist.songs.length,
          };
        }
        return null;
      }
    }

    if (!isSupabaseConfigured) {
      const storedPlaylists = localStorage.getItem('zed_playlists');
      const storedSongs = localStorage.getItem('zed_playlist_songs');
      const playlists = storedPlaylists ? JSON.parse(storedPlaylists) : [];
      const songs = storedSongs ? JSON.parse(storedSongs) : [];
      const playlist = playlists.find((p: Playlist) => p.id === playlistId);
      if (!playlist) return null;
      const playlistSongs = songs.filter(
        (s: PlaylistSong) => s.playlist_id === playlistId
      );
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
    if (isLoggedIn()) {
      const success = await updateUserData('create_playlist', {
        name,
        description,
      });
      if (success) {
        return {
          id: `${Date.now()}`,
          user_id: 'current',
          name,
          description,
          is_public: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return null;
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('zed_playlists');
      const playlists = stored ? JSON.parse(stored) : [];
      const newPlaylist: Playlist = {
        id: `local_${Date.now()}`,
        user_id: ANONYMOUS_ID,
        name,
        description,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      playlists.push(newPlaylist);
      localStorage.setItem('zed_playlists', JSON.stringify(playlists));
      return newPlaylist;
    }

    const userId = getUserId();
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

  async update(id: string, updates: Partial<Playlist>): Promise<boolean> {
    if (isLoggedIn()) {
      return updateUserData('update_playlist', { playlist_id: id, ...updates });
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('zed_playlists');
      const playlists = stored ? JSON.parse(stored) : [];
      const index = playlists.findIndex((p: Playlist) => p.id === id);
      if (index === -1) return false;
      playlists[index] = {
        ...playlists[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('zed_playlists', JSON.stringify(playlists));
      return true;
    }

    const { error } = await supabase
      .from('playlists')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating playlist:', error);
      return false;
    }

    return true;
  },

  async delete(id: string): Promise<boolean> {
    if (isLoggedIn()) {
      return updateUserData('delete_playlist', { playlist_id: id });
    }

    if (!isSupabaseConfigured) {
      const storedPlaylists = localStorage.getItem('zed_playlists');
      const storedSongs = localStorage.getItem('zed_playlist_songs');
      let playlists = storedPlaylists ? JSON.parse(storedPlaylists) : [];
      let songs = storedSongs ? JSON.parse(storedSongs) : [];
      playlists = playlists.filter((p: Playlist) => p.id !== id);
      songs = songs.filter((s: PlaylistSong) => s.playlist_id !== id);
      localStorage.setItem('zed_playlists', JSON.stringify(playlists));
      localStorage.setItem('zed_playlist_songs', JSON.stringify(songs));
      return true;
    }

    await supabase.from('playlist_songs').delete().eq('playlist_id', id);

    const { error } = await supabase.from('playlists').delete().eq('id', id);

    if (error) {
      console.error('Error deleting playlist:', error);
      return false;
    }

    return true;
  },

  async addSong(playlistId: string, song: Song): Promise<boolean> {
    if (isLoggedIn()) {
      return updateUserData('add_to_playlist', {
        playlist_id: playlistId,
        song: {
          song_id: song.id,
          song_title: song.title,
          song_artist: song.artist,
          song_url: song.url,
          song_path: song.path,
        },
      });
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('zed_playlist_songs');
      const songs = stored ? JSON.parse(stored) : [];
      const position = songs.filter(
        (s: PlaylistSong) => s.playlist_id === playlistId
      ).length;
      songs.push({
        id: `local_${Date.now()}`,
        playlist_id: playlistId,
        song_id: song.id,
        song_path: song.path,
        song_title: song.title,
        song_artist: song.artist,
        song_url: song.url,
        position,
        added_at: new Date().toISOString(),
      });
      localStorage.setItem('zed_playlist_songs', JSON.stringify(songs));
      return true;
    }

    const { count } = await supabase
      .from('playlist_songs')
      .select('*', { count: 'exact', head: true })
      .eq('playlist_id', playlistId);

    const position = (count || 0) + 1;

    const { error } = await supabase.from('playlist_songs').insert({
      playlist_id: playlistId,
      song_id: song.id,
      song_path: song.path,
      song_title: song.title,
      song_artist: song.artist,
      song_url: song.url,
      position,
    });

    if (error) {
      console.error('Error adding song to playlist:', error);
      return false;
    }

    await this.update(playlistId, {});
    return true;
  },

  async removeSong(playlistId: string, songId: string): Promise<boolean> {
    if (isLoggedIn()) {
      return updateUserData('remove_from_playlist', {
        playlist_id: playlistId,
        song_id: songId,
      });
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('zed_playlist_songs');
      const songs = stored ? JSON.parse(stored) : [];
      const filtered = songs.filter(
        (s: PlaylistSong) =>
          s.playlist_id !== playlistId || s.song_id !== songId
      );
      localStorage.setItem('zed_playlist_songs', JSON.stringify(filtered));
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
  async getRecent(limit = 50): Promise<ListeningHistory[]> {
    if (isLoggedIn()) {
      const userData = await fetchUserData();
      if (userData) return userData.history.slice(0, limit);
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('zed_history');
      const history = stored ? JSON.parse(stored) : [];
      return history.slice(0, limit);
    }

    const userId = getUserId();
    const { data, error } = await supabase
      .from('listening_history')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data || [];
  },

  async add(song: Song, durationPlayed = 0): Promise<ListeningHistory | null> {
    if (isLoggedIn()) {
      await updateUserData('add_history', {
        song: {
          song_id: song.id,
          song_title: song.title,
          song_artist: song.artist,
          song_url: song.url,
          song_path: song.path,
        },
      });
      return {
        id: `${Date.now()}`,
        user_id: 'current',
        song_id: song.id,
        song_path: song.path,
        song_title: song.title,
        song_artist: song.artist,
        song_url: song.url,
        played_at: new Date().toISOString(),
        duration_played: durationPlayed,
      };
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('zed_history');
      const history = stored ? JSON.parse(stored) : [];
      const newEntry: ListeningHistory = {
        id: `local_${Date.now()}`,
        user_id: ANONYMOUS_ID,
        song_id: song.id,
        song_path: song.path,
        song_title: song.title,
        song_artist: song.artist,
        song_url: song.url,
        played_at: new Date().toISOString(),
        duration_played: durationPlayed,
      };
      history.unshift(newEntry);
      const trimmed = history.slice(0, 100);
      localStorage.setItem('zed_history', JSON.stringify(trimmed));
      return newEntry;
    }

    const userId = getUserId();
    const { data, error } = await supabase
      .from('listening_history')
      .insert({
        user_id: userId,
        song_id: song.id,
        song_path: song.path,
        song_title: song.title,
        song_artist: song.artist,
        song_url: song.url,
        duration_played: durationPlayed,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to history:', error);
      return null;
    }

    return data;
  },

  async clear(): Promise<boolean> {
    if (isLoggedIn()) {
      return updateUserData('clear_history', {});
    }

    if (!isSupabaseConfigured) {
      localStorage.removeItem('zed_history');
      return true;
    }

    const userId = getUserId();
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

export const stats = {
  async getPlayCount(songId: string): Promise<number> {
    if (!isSupabaseConfigured) return 0;

    const { count } = await supabase
      .from('listening_history')
      .select('*', { count: 'exact', head: true })
      .eq('song_id', songId);

    return count || 0;
  },

  async getTopSongs(limit = 10): Promise<
    {
      song_id: string;
      song_title: string;
      song_artist: string;
      play_count: number;
    }[]
  > {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('listening_history')
      .select('song_id, song_title, song_artist')
      .order('played_at', { ascending: false });

    if (error) {
      console.error('Error fetching top songs:', error);
      return [];
    }

    const counts: Record<
      string,
      { song_title: string; song_artist: string; play_count: number }
    > = {};
    data?.forEach((entry) => {
      if (!counts[entry.song_id]) {
        counts[entry.song_id] = {
          song_title: entry.song_title,
          song_artist: entry.song_artist,
          play_count: 0,
        };
      }
      counts[entry.song_id].play_count++;
    });

    return Object.entries(counts)
      .map(([song_id, info]) => ({ song_id, ...info }))
      .sort((a, b) => b.play_count - a.play_count)
      .slice(0, limit);
  },
};
