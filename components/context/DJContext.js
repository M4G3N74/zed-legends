import { createContext, useContext, useState, useEffect } from 'react';

const DJContext = createContext();

export function DJProvider({ children }) {
  const [djControlMode, setDjControlMode] = useState(false);
  
  // Load DJ state from localStorage on initial render
  useEffect(() => {
    const savedDjMode = localStorage.getItem('djControlMode') === 'true';
    if (savedDjMode) {
      setDjControlMode(true);
    }
  }, []);
  
  // Save DJ state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('djControlMode', djControlMode.toString());
  }, [djControlMode]);

  return (
    <DJContext.Provider value={{ djControlMode, setDjControlMode }}>
      {children}
    </DJContext.Provider>
  );
}

export function useDJ() {
  const context = useContext(DJContext);
  if (!context) {
    throw new Error('useDJ must be used within a DJProvider');
  }
  return context;
}