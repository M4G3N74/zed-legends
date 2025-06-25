import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getUserWithRole(req) {
  const token =
    req.headers['authorization']?.replace('Bearer ', '') ||
    req.cookies?.['sb-access-token'] ||
    req.headers['sb-access-token'];

  if (!token) return { user: null, role: null };

  // Get user from Supabase Auth
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return { user: null, role: null };

  // Get role from users table
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('email', user.email)
    .single();

  return { user, role: data?.role || null };
} 