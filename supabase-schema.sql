-- =============================================
-- ZED LEGENDS - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  song_id TEXT NOT NULL,
  song_path TEXT NOT NULL,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  song_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- =============================================
-- PLAYLISTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_updated_at ON playlists(updated_at DESC);

-- =============================================
-- PLAYLIST SONGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS playlist_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  song_path TEXT NOT NULL,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  song_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_position ON playlist_songs(playlist_id, position);

-- =============================================
-- LISTENING HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS listening_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  song_id TEXT NOT NULL,
  song_path TEXT NOT NULL,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  song_url TEXT NOT NULL,
  duration_played INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_played_at ON listening_history(played_at DESC);
CREATE INDEX idx_listening_history_song_id ON listening_history(song_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'anon_%');

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'anon_%');

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'anon_%');

-- Playlists policies
CREATE POLICY "Users can view their own playlists"
  ON playlists FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'anon_%');

CREATE POLICY "Users can insert their own playlists"
  ON playlists FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'anon_%');

CREATE POLICY "Users can update their own playlists"
  ON playlists FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'anon_%');

CREATE POLICY "Users can delete their own playlists"
  ON playlists FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'anon_%');

-- Playlist songs policies
CREATE POLICY "Users can view songs in their playlists"
  ON playlist_songs FOR SELECT
  USING (
    playlist_id IN (
      SELECT id FROM playlists WHERE 
        user_id = current_setting('request.jwt.claims', true)::json->>'sub' 
        OR user_id LIKE 'anon_%'
    )
  );

CREATE POLICY "Users can insert songs to their playlists"
  ON playlist_songs FOR INSERT
  WITH CHECK (
    playlist_id IN (
      SELECT id FROM playlists WHERE 
        user_id = current_setting('request.jwt.claims', true)::json->>'sub' 
        OR user_id LIKE 'anon_%'
    )
  );

CREATE POLICY "Users can delete songs from their playlists"
  ON playlist_songs FOR DELETE
  USING (
    playlist_id IN (
      SELECT id FROM playlists WHERE 
        user_id = current_setting('request.jwt.claims', true)::json->>'sub' 
        OR user_id LIKE 'anon_%'
    )
  );

-- Listening history policies
CREATE POLICY "Users can view their own history"
  ON listening_history FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'anon_%');

CREATE POLICY "Users can insert their own history"
  ON listening_history FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'anon_%');

CREATE POLICY "Users can delete their own history"
  ON listening_history FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'anon_%');

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Uncomment below to add some test data
/*
INSERT INTO favorites (user_id, song_id, song_path, song_title, song_artist, song_url)
VALUES 
  ('anon_test_user', 'test_1', 'path/to/song1.mp3', 'Test Song 1', 'Test Artist', 'https://example.com/song1.mp3'),
  ('anon_test_user', 'test_2', 'path/to/song2.mp3', 'Test Song 2', 'Test Artist 2', 'https://example.com/song2.mp3');

INSERT INTO playlists (user_id, name, description)
VALUES ('anon_test_user', 'My Favorites', 'A collection of my favorite songs');

INSERT INTO listening_history (user_id, song_id, song_path, song_title, song_artist, song_url)
VALUES 
  ('anon_test_user', 'test_1', 'path/to/song1.mp3', 'Test Song 1', 'Test Artist', 'https://example.com/song1.mp3', 120, NOW());
*/
