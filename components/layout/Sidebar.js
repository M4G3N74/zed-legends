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
      bg-surface/95 backdrop-blur-2xl border-r border-overlay/20 shadow-2xl`}>
      {!isMobile && (
        <div className="logo p-6 flex items-center gap-3 border-b border-overlay/20 bg-gradient-to-br from-mauve/5 via-lavender/5 to-blue/5">
          <div className="w-10 h-10 bg-gradient-to-br from-mauve to-lavender rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-music text-background text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-mauve to-lavender bg-clip-text text-transparent">Zed Legends</h1>
            <p className="text-xs text-muted">Zambian Music</p>
          </div>
        </div>
      )}

      <ul className={`nav-menu ${isMobile ? 'flex items-center justify-around w-full' : 'p-6 space-y-3'} 
        ${!isMobile ? 'mt-2' : ''}`}>
        <li className={`nav-item`}>
          <InstantLink href="/" className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            router.pathname === '/' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              router.pathname === '/' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className="fas fa-home"></i>
            </div>
            <span className="font-medium">Home</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/library" className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            router.pathname === '/library' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              router.pathname === '/library' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className="fas fa-book"></i>
            </div>
            <span className="font-medium">Library</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/playlists" className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            router.pathname === '/playlists' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              router.pathname === '/playlists' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className="fas fa-list"></i>
            </div>
            <span className="font-medium">Top 100</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/request" className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            router.pathname === '/request' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              router.pathname === '/request' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className="fas fa-lightbulb"></i>
            </div>
            <span className="font-medium">Request</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/support" className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            router.pathname === '/support' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              router.pathname === '/support' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className="fas fa-headset"></i>
            </div>
            <span className="font-medium">Support</span>
          </InstantLink>
        </li>
        <li className={`nav-item`}>
          <InstantLink href="/dashboard" className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            router.pathname === '/dashboard' 
              ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
              : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              router.pathname === '/dashboard' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
            }`}>
              <i className="fas fa-tachometer-alt"></i>
            </div>
            <span className="font-medium">Dashboard</span>
          </InstantLink>
        </li>
        {role === 'admin' && (
          <li className={`nav-item`}>
            <InstantLink href="/user-management" className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
              router.pathname === '/user-management' 
                ? 'bg-gradient-to-r from-mauve/20 to-lavender/20 text-mauve border border-mauve/30 shadow-lg' 
                : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent hover:border-overlay/50'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                router.pathname === '/user-management' ? 'bg-mauve/20' : 'group-hover:bg-overlay/30'
              }`}>
                <i className="fas fa-users-cog"></i>
              </div>
              <span className="font-medium">Users</span>
            </InstantLink>
          </li>
        )}
      </ul>

      {!isMobile && (
        <div className="sidebar-footer absolute bottom-0 left-0 right-0 p-6 border-t border-overlay/20 bg-gradient-to-t from-surface/95 to-surface/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-background/50 backdrop-blur-sm rounded-xl px-3 py-2 border border-overlay/30">
              <div className="flex items-center gap-2">
                <i className="fas fa-music text-mauve text-sm"></i>
                <span className="text-sm font-medium">{pagination?.total ?? 0}</span>
                <span className="text-xs text-muted">songs</span>
              </div>
            </div>
            <button 
              onClick={toggleTheme} 
              className="w-10 h-10 rounded-xl bg-surface/50 hover:bg-overlay/50 border border-overlay/30 flex items-center justify-center transition-all duration-300 hover:shadow-lg"
              aria-label={isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              <i className={`fas ${isLightTheme ? 'fa-moon' : 'fa-sun'} text-muted`}></i>
            </button>
          </div>
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

      {/* Desktop Logout Button */}
      {!isMobile && user && (
        <div className="absolute bottom-20 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-gradient-to-r from-love to-love/80 text-background rounded-xl hover:shadow-lg transition-all duration-300 border border-love/20 font-medium"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>Logout
          </button>
        </div>
      )}

      <LogoutToast show={logoutToast} />
    </nav>
  );
}
