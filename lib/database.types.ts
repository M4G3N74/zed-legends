export interface User {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  song_id: string;
  song_path: string;
  song_title: string;
  song_artist: string;
  song_url: string;
  created_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  song_path: string;
  song_title: string;
  song_artist: string;
  song_url: string;
  position: number;
  added_at: string;
}

export interface PlaylistWithSongs extends Playlist {
  songs: PlaylistSong[];
  song_count: number;
}

export interface ListeningHistory {
  id: string;
  user_id: string;
  song_id: string;
  song_path: string;
  song_title: string;
  song_artist: string;
  song_url: string;
  played_at: string;
  duration_played: number;
}

export interface SongPlayCount {
  song_id: string;
  song_path: string;
  song_title: string;
  song_artist: string;
  play_count: number;
}
