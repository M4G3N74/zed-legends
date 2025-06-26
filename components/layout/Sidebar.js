import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import { useUser } from '../context/UserContext';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';

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
    <nav className={`sidebar bg-surface ${isMobile ? 'h-16' : 'w-48 md:w-48 lg:w-64 h-full fixed left-0 top-0'}`}>
      {!isMobile && (
        <div className="logo p-4 md:p-3 flex items-center gap-2">
          <i className="fas fa-music text-mauve text-xl"></i>
          <h1 className="text-xl font-bold">Zambian Legends</h1>
        </div>
      )}

      <ul className={`nav-menu ${isMobile ? 'flex items-center justify-around w-full' : 'p-4 md:p-3 space-y-2'}`}>
        <li className={`nav-item ${router.pathname === '/' ? 'text-mauve' : 'text-text'}`}>
          <Link href="/" className="flex items-center gap-3 p-2 rounded-md hover:bg-overlay">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
        </li>
        <li className={`nav-item ${router.pathname === '/library' ? 'text-mauve' : 'text-text'}`}>
          <Link href="/library" className="flex items-center gap-3 p-2 rounded-md hover:bg-overlay">
            <i className="fas fa-book"></i>
            <span>Library</span>
          </Link>
        </li>
        <li className={`nav-item ${router.pathname === '/playlists' ? 'text-mauve' : 'text-text'}`}>
          <Link href="/playlists" className="flex items-center gap-3 p-2 rounded-md hover:bg-overlay">
            <i className="fas fa-list"></i>
            <span>Top 100</span>
          </Link>
        </li>
        <li className={`nav-item ${router.pathname === '/dashboard' ? 'text-mauve' : 'text-text'}`}>
          <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-overlay">
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        {role === 'admin' && (
          <li className={`nav-item ${router.pathname === '/user-management' ? 'text-mauve' : 'text-text'}`}>
            <Link href="/user-management" className="flex items-center gap-3 p-2 rounded-md hover:bg-overlay">
              <i className="fas fa-users-cog"></i>
              <span>User Management</span>
            </Link>
          </li>
        )}
      </ul>

      {!isMobile && (
        <div className="sidebar-footer absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between border-t border-overlay">
          <div className="song-count flex items-center gap-2" title={`${pagination?.total ?? 0} songs in library`}>
            <i className="fas fa-music text-muted"></i>
            <span className="text-muted">{pagination?.total ?? 0}</span>
          </div>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle p-2 rounded-full hover:bg-overlay"
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
          className="fixed bottom-4 left-4 right-4 z-50 bg-love text-background text-lg font-semibold py-3 rounded-xl shadow-lg hover:bg-love/90 transition-colors"
          style={{ minWidth: '80%', maxWidth: 400, margin: '0 auto' }}
        >
          <i className="fas fa-sign-out-alt mr-2"></i>Logout
        </button>
      )}

      {/* Desktop Logout Button (original) */}
      {!isMobile && user && (
        <button
          onClick={handleLogout}
          className="w-full mt-8 px-4 py-2 bg-love text-background rounded-lg hover:bg-love/90 transition-colors"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>Logout
        </button>
      )}

      <LogoutToast show={logoutToast} />
    </nav>
  );
}
