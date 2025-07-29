'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isLightTheme: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isLightTheme, setIsLightTheme] = useState<boolean>(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('lightTheme');
      setIsLightTheme(savedTheme === 'true');
    }
  }, []);

  // Update body class and localStorage when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isLightTheme) {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
      localStorage.setItem('lightTheme', isLightTheme.toString());
    }
  }, [isLightTheme]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsLightTheme(prev => !prev);
  };

  const value: ThemeContextType = {
    isLightTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}