-- Create the song_likes table if it doesn't exist
create table if not exists song_likes (
  id uuid default uuid_generate_v4() primary key,
  song_id text not null,
  user_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table song_likes enable row level security;

-- Allow anonymous users to insert likes (for public apps, development only)
create policy "Allow anon insert"
on song_likes
for insert
to anon
using (true); 