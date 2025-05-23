import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isLightTheme, setIsLightTheme] = useState(false);

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
      localStorage.setItem('lightTheme', isLightTheme);
    }
  }, [isLightTheme]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsLightTheme(prev => !prev);
  };

  const value = {
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
  return useContext(ThemeContext);
}
