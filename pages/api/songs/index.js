import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Pagination params
    const page = parseInt(req.query.page, 100) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize, 100) || 50, 100); // Max 100 per page
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Fetch paginated songs, filtering out 'mixdown' in title or artist at the DB level
    const { data: songs, error } = await supabase
      .from('songs')
      .select('*')
      .not('title', 'ilike', '%mixdown%')
      .not('artist', 'ilike', '%mixdown%')
      .order('title', { ascending: true })
      .range(from, to);

    // Get the total count of filtered songs for pagination
    const { count: filteredCount, error: countError } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })
      .not('title', 'ilike', '%mixdown%')
      .not('artist', 'ilike', '%mixdown%');

    if (error || countError) {
      console.error('Error fetching songs from Supabase:', error || countError);
      throw error || countError;
    }

    res.status(200).json({
      songs,
      total: filteredCount,
      page,
      pageSize,
      hasMore: to + 1 < filteredCount
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch songs from the database.' });
  }
} 