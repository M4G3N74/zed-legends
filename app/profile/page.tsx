'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../components/layout';
import {
  UserIcon,
  SettingsIcon,
  HeartOutlineIcon,
  MusicIcon,
  DownloadIcon,
  ShareIcon,
  ChevronRightIcon,
  ClockIcon,
  LogOutIcon,
} from '../components/icons';
import { useFavorites, usePlaylists, useHistory, useAuth } from '@/lib/hooks';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: favorites = [] } = useFavorites();
  const { data: playlists = [] } = usePlaylists();
  const { data: history = [] } = useHistory();

  const totalListens = history.length;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Zed Legends',
          text: 'Listen to Zambian music on Zed Legends',
          url: window.location.origin,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="animate-fade-in">
      <Header title="Profile" />

      <div className="px-4 pt-4 space-y-8">
        <section className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-love/40 blur-xl opacity-50" />
            <div className="relative w-20 h-20 rounded-2xl glass flex items-center justify-center">
              <UserIcon size={40} className="text-muted" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {user ? user.name : 'Guest User'}
            </h2>
            <p className="text-sm text-muted">
              {user ? user.email : 'Sign in to sync your music'}
            </p>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="p-3 rounded-xl glass hover:bg-surface-hover transition-all text-muted hover:text-love"
              title="Logout"
            >
              <LogOutIcon size={20} />
            </button>
          )}
        </section>

        {!user && (
          <Link
            href="/login"
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-accent to-copper text-center font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        )}

        <section className="grid grid-cols-3 gap-3">
          <Link
            href="/favorites"
            className="rounded-2xl p-4 glass bg-gradient-to-br from-love/30 to-love/10 text-center hover:scale-[1.02] transition-transform"
          >
            <div className="flex justify-center mb-2">
              <HeartOutlineIcon size={20} className="text-love" />
            </div>
            <p className="text-xl font-bold">{favorites.length}</p>
            <p className="text-xs text-muted">Favorites</p>
          </Link>
          <Link
            href="/playlists"
            className="rounded-2xl p-4 glass bg-gradient-to-br from-accent/30 to-copper/10 text-center hover:scale-[1.02] transition-transform"
          >
            <div className="flex justify-center mb-2">
              <MusicIcon size={20} className="text-accent" />
            </div>
            <p className="text-xl font-bold">{playlists.length}</p>
            <p className="text-xs text-muted">Playlists</p>
          </Link>
          <Link
            href="/history"
            className="rounded-2xl p-4 glass bg-gradient-to-br from-success/30 to-accent/10 text-center hover:scale-[1.02] transition-transform"
          >
            <div className="flex justify-center mb-2">
              <ClockIcon size={20} className="text-success" />
            </div>
            <p className="text-xl font-bold">{totalListens}</p>
            <p className="text-xs text-muted">Listens</p>
          </Link>
        </section>

        <section className="space-y-2">
          <Link
            href="/favorites"
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl glass bg-gradient-to-br from-love/20 to-transparent flex items-center justify-center text-love group-hover:text-love transition-colors">
              <HeartOutlineIcon size={20} />
            </div>
            <span className="flex-1 font-medium text-sm">Liked Songs</span>
            <span className="text-sm text-muted">{favorites.length}</span>
            <ChevronRightIcon size={18} className="text-muted" />
          </Link>

          <Link
            href="/playlists"
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl glass bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center text-accent group-hover:text-accent transition-colors">
              <MusicIcon size={20} />
            </div>
            <span className="flex-1 font-medium text-sm">My Playlists</span>
            <span className="text-sm text-muted">{playlists.length}</span>
            <ChevronRightIcon size={18} className="text-muted" />
          </Link>

          <Link
            href="/history"
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl glass bg-gradient-to-br from-success/20 to-transparent flex items-center justify-center text-success group-hover:text-success transition-colors">
              <ClockIcon size={20} />
            </div>
            <span className="flex-1 font-medium text-sm">Recently Played</span>
            <span className="text-sm text-muted">{history.length}</span>
            <ChevronRightIcon size={18} className="text-muted" />
          </Link>

          <button
            onClick={handleShare}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl glass bg-gradient-to-br from-copper/20 to-transparent flex items-center justify-center text-copper group-hover:text-copper transition-colors">
              <ShareIcon size={20} />
            </div>
            <span className="flex-1 font-medium text-sm">Share App</span>
            <ChevronRightIcon size={18} className="text-muted" />
          </button>

          <Link
            href="/support"
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl glass bg-gradient-to-br from-muted/20 to-transparent flex items-center justify-center text-muted group-hover:text-text transition-colors">
              <SettingsIcon size={20} />
            </div>
            <span className="flex-1 font-medium text-sm">Support</span>
            <ChevronRightIcon size={18} className="text-muted" />
          </Link>
        </section>

        <section className="text-center py-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-copper/30 to-love/30 blur-xl opacity-50" />
            <div className="relative">
              <p className="text-lg font-bold gradient-text mb-2">
                Zed Legends
              </p>
              <p className="text-xs text-muted">Bold. Creative. Zambian.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
