import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import { useUser } from '../context/UserContext';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';
import { InstantLink } from '../navigation/InstantRouter';

function LogoutToast({ show }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[999] bg-mauve text-background px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
      You have been logged out.
    </div>
  );
}

export default function Sidebar({ isMobile }) {
  const router = useRouter();
  const { toggleTheme, isLightTheme } = useTheme();
  const { pagination } = useLibrary();
  const { user, role } = useUser();
  const [logoutToast, setLogoutToast] = useState(false);
  let logoutTimeout = null;

  const handleLogout = async () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut();
      setLogoutToast(true);
      logoutTimeout = setTimeout(() => {
        setLogoutToast(false);
        window.location.href = '/login';
      }, 1500);
    }
  };

  return (
    <nav className={`sidebar ${isMobile ? 'h-16' : 'w-48 md:w-48 lg:w-64 h-full fixed left-0 top-0'} 
      bg-surface/80 backdrop-blur-xl border-r border-overlay/30 shadow-2xl`}>
      {!isMobile && (
        <div className="logo p-4 md:p-3 flex items-center gap-2 border-b border-overlay/20 bg-gradient-to-r from-mauve/10 to-lavender/10">
          <i className="fas fa-music text-mauve text-xl"></i>
          <h1 className="text-xl font-bold bg-gradient-to-r from-mauve to-lavender bg-clip-text text-transparent">Zambian Legends</h1>
        </div>
      )}

      <ul className={`nav-menu ${isMobile ? 'flex items-center justify-around w-full' : 'p-4 md:p-3 space-y-2'} 
        ${!isMobile ? 'mt-4' : ''}`}>
        <li className={`nav-item ${router.pathname === '/' ? 'text-mauve' : 'text-text'}`}>
          <InstantLink href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-overlay/40 hover:backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-mauve/20">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </InstantLink>
        </li>
        <li className={`nav-item ${router.pathname === '/library' ? 'text-mauve' : 'text-text'}`}>
          <InstantLink href="/library" className="flex items-center gap-3 p-3 rounded-xl hover:bg-overlay/40 hover:backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-mauve/20">
            <i className="fas fa-book"></i>
            <span>Library</span>
          </InstantLink>
        </li>
        <li className={`nav-item ${router.pathname === '/playlists' ? 'text-mauve' : 'text-text'}`}>
          <InstantLink href="/playlists" className="flex items-center gap-3 p-3 rounded-xl hover:bg-overlay/40 hover:backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-mauve/20">
            <i className="fas fa-list"></i>
            <span>Top 100</span>
          </InstantLink>
        </li>
        <li className={`nav-item ${router.pathname === '/request' ? 'text-mauve' : 'text-text'}`}>
          <InstantLink href="/request" className="flex items-center gap-3 p-3 rounded-xl hover:bg-overlay/40 hover:backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-mauve/20">
            <i className="fas fa-lightbulb"></i>
            <span>Request</span>
          </InstantLink>
        </li>
        <li className={`nav-item ${router.pathname === '/support' ? 'text-mauve' : 'text-text'}`}>
          <InstantLink href="/support" className="flex items-center gap-3 p-3 rounded-xl hover:bg-overlay/40 hover:backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-mauve/20">
            <i className="fas fa-headset"></i>
            <span>Support</span>
          </InstantLink>
        </li>
        <li className={`nav-item ${router.pathname === '/dashboard' ? 'text-mauve' : 'text-text'}`}>
          <InstantLink href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-overlay/40 hover:backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-mauve/20">
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </InstantLink>
        </li>
        {role === 'admin' && (
          <li className={`nav-item ${router.pathname === '/user-management' ? 'text-mauve' : 'text-text'}`}>
            <InstantLink href="/user-management" className="flex items-center gap-3 p-3 rounded-xl hover:bg-overlay/40 hover:backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-mauve/20">
              <i className="fas fa-users-cog"></i>
              <span>User Management</span>
            </InstantLink>
          </li>
        )}
      </ul>

      {!isMobile && (
        <div className="sidebar-footer absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between border-t border-overlay/30 bg-surface/60 backdrop-blur-md">
          <div className="song-count flex items-center gap-2" title={`${pagination?.total ?? 0} songs in library`}>
            <i className="fas fa-music text-muted"></i>
            <span className="text-muted">{pagination?.total ?? 0}</span>
          </div>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle p-2 rounded-full hover:bg-overlay/40 hover:backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
            aria-label={isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            <i className={`fas ${isLightTheme ? 'fa-moon' : 'fa-sun'} text-muted`}></i>
          </button>
        </div>
      )}

      {/* Mobile Logout Button (fixed bottom) */}
      {isMobile && user && (
        <button
          onClick={handleLogout}
          className="fixed bottom-4 left-4 right-4 z-50 bg-love/90 backdrop-blur-md text-background text-lg font-semibold py-3 rounded-xl shadow-2xl hover:bg-love transition-all duration-300"
          style={{ minWidth: '80%', maxWidth: 400, margin: '0 auto' }}
        >
          <i className="fas fa-sign-out-alt mr-2"></i>Logout
        </button>
      )}

      {/* Desktop Logout Button (original) */}
      {!isMobile && user && (
        <button
          onClick={handleLogout}
          className="w-full mt-8 px-4 py-3 bg-love/90 backdrop-blur-md text-background rounded-xl hover:bg-love hover:shadow-lg transition-all duration-300 border border-love/20"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>Logout
        </button>
      )}

      <LogoutToast show={logoutToast} />
    </nav>
  );
}
