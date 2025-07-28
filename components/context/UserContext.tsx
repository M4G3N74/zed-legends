import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  // Add other user properties you expect from session.user
}

interface UserContextType {
  user: UserProfile | null;
  role: string | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // Clear any invalid tokens
          await supabase.auth.signOut();
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }
        
        const email = session.user.email;
        const { data, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('email', email)
          .single();
          
        setUser(session.user as UserProfile);
        setRole(data?.role || null);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, role, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}