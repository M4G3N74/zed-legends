'use client';

import SongList from '../components/features/SongList';
import Visualizer from '../components/ui/Visualizer';
import { useLibrary } from '../components/context/LibraryContext';

import ClientOnly from '../components/ClientOnly';

import React, { useState, useEffect } from 'react';



export default function HomeClientPage() {
  const { isLoading, error } = useLibrary();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Render nothing until mounted
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-mauve/10 via-lavender/5 to-blue/10 rounded-2xl sm:rounded-3xl border border-overlay/20 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-mauve/5 to-transparent"></div>
          <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-mauve via-lavender to-blue bg-clip-text text-transparent mb-3 sm:mb-4">
                  Zambian Legends
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-muted mb-4 sm:mb-6 max-w-2xl mx-auto lg:mx-0">
                  Discover the rich sounds of Zambian music. From traditional rhythms to modern beats, 
                  experience the best of Zambian musical heritage.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-4">
                  <div className="bg-surface/50 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 border border-overlay/30">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-music text-mauve text-sm sm:text-base"></i>
                      <span className="text-xs sm:text-sm font-medium">Premium Quality</span>
                    </div>
                  </div>
                  <div className="bg-surface/50 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 border border-overlay/30">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-headphones text-blue text-sm sm:text-base"></i>
                      <span className="text-xs sm:text-sm font-medium">High Quality Audio</span>
                    </div>
                  </div>
                  <div className="bg-surface/50 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 border border-overlay/30">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-heart text-love text-sm sm:text-base"></i>
                      <span className="text-xs sm:text-sm font-medium">Free Streaming</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-auto max-w-md lg:max-w-none">
                <Visualizer />
              </div>
            </div>
          </div>
        </div>

        {/* Music Library Section */}
        <div className="bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-overlay/30 shadow-xl">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue to-sky rounded-lg sm:rounded-xl flex items-center justify-center">
                <i className="fas fa-compact-disc text-background text-lg sm:text-xl"></i>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold">Music Library</h2>
                <p className="text-sm sm:text-base text-muted">Explore our collection of Zambian music</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-32 sm:h-40">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-mauve"></div>
              </div>
            ) : error ? (
              <div className="bg-love/10 border border-love/30 rounded-lg sm:rounded-xl p-3 sm:p-4 text-love">
                <i className="fas fa-exclamation-circle mr-2"></i>{error as React.ReactNode}
              </div>
            ) : (
              <SongList />
            )}
          </div>
        </div>
      </div>
    );
}
