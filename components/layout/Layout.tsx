'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import NowPlayingBar from './NowPlayingBar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Throttled resize handler for better performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIfMobile, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="app-container min-h-screen flex">
      {/* Sidebar - responsive */}
      <Sidebar isMobile={isMobile} />

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto ${
        isMobile ? 'pb-32 pt-12' : 'ml-48 lg:ml-64 pb-20 pt-12'
      }`}>
        {children}
      </main>

      {/* Now Playing Bar */}
      <NowPlayingBar isMobile={isMobile} />
    </div>
  );
}