'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';

import { InstantLink } from '../navigation/InstantRouter';

// Removed LogoutToast component

interface SidebarProps {
  isMobile: boolean;
}

export default function Sidebar({ isMobile }: SidebarProps) {
  const pathname = usePathname();
  const { toggleTheme, isLightTheme } = useTheme();
  const { pagination } = useLibrary();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className={`sidebar ${isMobile ? 'h-16 fixed bottom-0 left-0 right-0 z-30' : 'w-48 md:w-48 lg:w-64 h-full fixed left-0 top-0 z-20'} 
      bg-surface/95 backdrop-blur-2xl ${isMobile ? 'border-t' : 'border-r'} border-overlay/20 shadow-2xl`}>
      {!isMobile && (
        <div className="logo p-4 sm:p-6 flex items-center gap-3 border-b border-overlay/20 bg-gradient-to-br from-mauve/5 via-lavender/5 to-blue/5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-mauve to-lavender rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-music text-background text-sm sm:text-lg"></i>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-mauve to-lavender bg-clip-text text-transparent">Zed Legends</h1>
            <p className="text-xs text-muted">Zambian Music</p>
          </div>
        </div>
      )}

      <ul className={`nav-menu ${isMobile ? 'flex items-center justify-around w-full px-2 py-2' : 'p-4 sm:p-6 space-y-2 sm:space-y-3'} 
        ${!isMobile ? 'mt-2' : ''}`}>
        <li className={`nav-item`}>
          <InstantLink href="/" className={`group flex items-center ${isMobile ? 'flex-col gap-1 p-2' : 'gap-3 p-2 sm:p-3'} rounded-lg sm:rounded-xl transition-all duration-300 ${
            pathname === '/' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} rounded-lg flex items-center justify-center transition-all ${
              pathname === '/' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className={`fas fa-home ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}></i>
            </div>
            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Home</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/library" className={`group flex items-center ${isMobile ? 'flex-col gap-1 p-2' : 'gap-3 p-2 sm:p-3'} rounded-lg sm:rounded-xl transition-all duration-300 ${
            pathname === '/library' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} rounded-lg flex items-center justify-center transition-all ${
              pathname === '/library' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className={`fas fa-book ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}></i>
            </div>
            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Library</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/playlists" className={`group flex items-center ${isMobile ? 'flex-col gap-1 p-2' : 'gap-3 p-2 sm:p-3'} rounded-lg sm:rounded-xl transition-all duration-300 ${
            pathname === '/playlists' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} rounded-lg flex items-center justify-center transition-all ${
              pathname === '/playlists' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className={`fas fa-list ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}></i>
            </div>
            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Top 100</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/request" className={`group flex items-center ${isMobile ? 'flex-col gap-1 p-2' : 'gap-3 p-2 sm:p-3'} rounded-lg sm:rounded-xl transition-all duration-300 ${
            pathname === '/request' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} rounded-lg flex items-center justify-center transition-all ${
              pathname === '/request' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className={`fas fa-lightbulb ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}></i>
            </div>
            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Request</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/support" className={`group flex items-center ${isMobile ? 'flex-col gap-1 p-2' : 'gap-3 p-2 sm:p-3'} rounded-lg sm:rounded-xl transition-all duration-300 ${
            pathname === '/support' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} rounded-lg flex items-center justify-center transition-all ${
              pathname === '/support' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className={`fas fa-headset ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}></i>
            </div>
            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Support</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/favorites" className={`group flex items-center ${isMobile ? 'flex-col gap-1 p-2' : 'gap-3 p-2 sm:p-3'} rounded-lg sm:rounded-xl transition-all duration-300 ${
            pathname === '/favorites' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} rounded-lg flex items-center justify-center transition-all ${
              pathname === '/favorites' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className={`fas fa-heart ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}></i>
            </div>
            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Favorites</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/recent" className={`group flex items-center ${isMobile ? 'flex-col gap-1 p-2' : 'gap-3 p-2 sm:p-3'} rounded-lg sm:rounded-xl transition-all duration-300 ${
            pathname === '/recent' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} rounded-lg flex items-center justify-center transition-all ${
              pathname === '/recent' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className={`fas fa-clock ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}></i>
            </div>
            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Recent</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/profile" className={`group flex items-center ${isMobile ? 'flex-col gap-1 p-2' : 'gap-3 p-2 sm:p-3'} rounded-lg sm:rounded-xl transition-all duration-300 ${
            pathname === '/profile' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} rounded-lg flex items-center justify-center transition-all ${
              pathname === '/profile' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className={`fas fa-user ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}></i>
            </div>
            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Profile</span>
          </InstantLink>
        </li>
        {/* Removed admin-only navigation */}
      </ul>

      {!isMobile && mounted && (
        <div className="sidebar-footer absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-overlay/20 bg-gradient-to-t from-surface/95 to-surface/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-background/50 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 border border-overlay/30">
              <div className="flex items-center gap-1 sm:gap-2">
                <i className="fas fa-music text-mauve text-xs sm:text-sm"></i>
                <span className="text-xs sm:text-sm font-medium">{pagination?.total ?? 0}</span>
                <span className="text-xs text-muted hidden sm:inline">songs</span>
              </div>
            </div>
            <button 
              onClick={toggleTheme} 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-surface/50 hover:bg-overlay/50 border border-overlay/30 flex items-center justify-center transition-all duration-300 hover:shadow-lg"
              aria-label={isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              <i className={`fas ${isLightTheme ? 'fa-moon' : 'fa-sun'} text-muted text-xs sm:text-sm`}></i>
            </button>
          </div>
        </div>
      )}

      {/* Removed logout buttons and toast */}
    </nav>
  );
}