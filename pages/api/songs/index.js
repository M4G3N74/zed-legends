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
    // Pagination and search params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'title';
    const pageSize = Math.min(limit, 100);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build query with search and sort
    let query = supabase
      .from('songs')
      .select('*')
      .not('title', 'ilike', '%mixdown%')
      .not('artist', 'ilike', '%mixdown%');

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%,album.ilike.%${search}%`);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: true });

    // Execute query with pagination
    const { data: songs, error } = await query.range(from, to);

    // Get total count with same filters
    let countQuery = supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })
      .not('title', 'ilike', '%mixdown%')
      .not('artist', 'ilike', '%mixdown%');

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,artist.ilike.%${search}%,album.ilike.%${search}%`);
    }

    const { count: filteredCount, error: countError } = await countQuery;

    if (error || countError) {
      console.error('Error fetching songs from Supabase:', error || countError);
      throw error || countError;
    }

    res.status(200).json({
      songs,
      totalSongs: filteredCount,
      page,
      pageSize,
      hasMore: to + 1 < filteredCount
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch songs from the database.' });
  }
} 