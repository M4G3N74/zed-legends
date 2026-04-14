import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zed_token');
}

function createSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const token = getToken();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}

export const supabase = {
  get client() {
    return createSupabaseClient();
  },
  from: (table: string) => {
    const client = createSupabaseClient();
    if (!client) {
      const noopQuery = {
        select: () => noopQuery,
        insert: () => noopQuery,
        update: () => noopQuery,
        delete: () => noopQuery,
        eq: () => noopQuery,
        order: () => noopQuery,
        limit: () => noopQuery,
        single: () =>
          Promise.resolve({ data: null, error: { message: 'Not configured' } }),
        then: (resolve: (value: unknown) => void) =>
          resolve({ data: null, error: { message: 'Not configured' } }),
      };
      return noopQuery;
    }
    return client.from(table);
  },
} as unknown as SupabaseClient;

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
