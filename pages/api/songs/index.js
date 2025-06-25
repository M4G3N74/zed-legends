import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 50, 100); // Max 100 per page
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Fetch paginated songs
    const { data: songs, error, count } = await supabase
      .from('songs')
      .select('*', { count: 'exact' })
      .order('title', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching songs from Supabase:', error);
      throw error;
    }

    res.status(200).json({
      songs,
      total: count,
      page,
      pageSize,
      hasMore: to + 1 < count
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch songs from the database.' });
  }
} 