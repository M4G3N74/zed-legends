import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';

const AutoDJContext = createContext();

export function AutoDJProvider({ children }) {
  const [autoDJEnabled, setAutoDJEnabled] = useState(false);
  const [djActive, setDJActive] = useState(false);
  
  // Initialize from environment variable or localStorage
  useEffect(() => {
    // Check environment variable first
    const envAutoDJ = process.env.NEXT_PUBLIC_AUTO_DJ === 'true';
    
    // Then check localStorage (allows user to override)
    const savedPreference = localStorage.getItem('autoDJEnabled');
    const initialValue = savedPreference !== null 
      ? savedPreference === 'true'
      : envAutoDJ;
    
    setAutoDJEnabled(initialValue);
    
    // If auto DJ is enabled, activate it
    if (initialValue) {
      setDJActive(true);
    }
  }, []);
  
  // Save preference when changed
  useEffect(() => {
    localStorage.setItem('autoDJEnabled', autoDJEnabled.toString());
  }, [autoDJEnabled]);
  
  const toggleAutoDJ = () => {
    const newValue = !autoDJEnabled;
    setAutoDJEnabled(newValue);
    
    // If turning on, activate DJ immediately
    if (newValue) {
      setDJActive(true);
    }
  };
  
  return (
    <AutoDJContext.Provider value={{ 
      autoDJEnabled, 
      setAutoDJEnabled, 
      toggleAutoDJ,
      djActive,
      setDJActive
    }}>
      {children}
    </AutoDJContext.Provider>
  );
}

export function useAutoDJ() {
  return useContext(AutoDJContext);
}