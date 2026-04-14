'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    name: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

const USER_KEY = 'zed_user';
const TOKEN_KEY = 'zed_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error };
      }

      const { user: userData } = data;
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      return { success: true };
    } catch {
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error };
        }

        const { user: userData } = data;
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));

        return { success: true };
      } catch {
        return { success: false, error: 'Registration failed' };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
