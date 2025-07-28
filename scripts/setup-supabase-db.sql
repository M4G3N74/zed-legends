-- Create the song_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS song_likes (
    id SERIAL PRIMARY KEY,
    song_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'like', 'dislike'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(song_id, user_id, interaction_type)
);

-- Table to store song metadata cache
CREATE TABLE IF NOT EXISTS songs (
    id VARCHAR(255) PRIMARY KEY, -- Using the file hash as the ID
    title TEXT,
    artist TEXT,
    album TEXT,
    duration FLOAT,
    path TEXT NOT NULL, -- The file key in R2
    album_art TEXT, -- URL or path to album art
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update 'updated_at' on songs table
DROP TRIGGER IF EXISTS set_songs_timestamp ON songs;
CREATE TRIGGER set_songs_timestamp
BEFORE UPDATE ON songs
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

GRANT ALL PRIVILEGES ON TABLE song_likes TO postgres;
GRANT ALL PRIVILEGES ON TABLE songs TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Enable Row Level Security
alter table song_likes enable row level security;

-- Allow anonymous users to insert likes (for public apps, development only)
-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Allow anon insert" ON song_likes;
-- Create the new policy with the correct clause
create policy "Allow anon insert"
on song_likes
for insert
to anon
with check (true); 