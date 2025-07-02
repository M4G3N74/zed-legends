import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getUserWithRole(req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, role: null };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Use anon client for auth verification
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: { user }, error: authError } = await anonSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return { user: null, role: null };
    }

    // Get role from users table using service role client
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data, error } = await serviceSupabase
      .from('users')
      .select('role, id')
      .eq('email', user.email)
      .single();

    if (error) {
      return { user, role: null };
    }

    return { user: { ...user, id: data.id }, role: data?.role || null };
  } catch (error) {
    console.error('getUserWithRole error:', error);
    return { user: null, role: null };
  }
} 