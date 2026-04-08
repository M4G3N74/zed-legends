'use client';

import { Header } from '../components/layout';
import {
  UserIcon,
  SettingsIcon,
  HeartOutlineIcon,
  MusicIcon,
  DownloadIcon,
  ShareIcon,
  ChevronRightIcon,
} from '../components/icons';

export default function ProfilePage() {
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
          <div>
            <h2 className="text-xl font-bold">Guest User</h2>
            <p className="text-sm text-muted">Sign in to sync your music</p>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Favorites',
              value: '0',
              icon: <HeartOutlineIcon size={20} className="text-love" />,
              gradient: 'from-love/30 to-love/10',
            },
            {
              label: 'Playlists',
              value: '0',
              icon: <MusicIcon size={20} className="text-accent" />,
              gradient: 'from-accent/30 to-copper/10',
            },
            {
              label: 'Listens',
              value: '0',
              icon: <MusicIcon size={20} className="text-success" />,
              gradient: 'from-success/30 to-accent/10',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl p-4 glass bg-gradient-to-br ${stat.gradient} text-center hover:scale-[1.02] transition-transform`}
            >
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="space-y-2">
          {[
            {
              icon: <HeartOutlineIcon size={20} />,
              label: 'Liked Songs',
              value: '0 songs',
              gradient: 'from-love/20 to-transparent',
            },
            {
              icon: <MusicIcon size={20} />,
              label: 'My Playlists',
              value: '',
              gradient: 'from-accent/20 to-transparent',
            },
            {
              icon: <DownloadIcon size={20} />,
              label: 'Downloads',
              value: '0',
              gradient: 'from-success/20 to-transparent',
            },
            {
              icon: <ShareIcon size={20} />,
              label: 'Share App',
              value: '',
              gradient: 'from-copper/20 to-transparent',
            },
            {
              icon: <SettingsIcon size={20} />,
              label: 'Settings',
              value: '',
              gradient: 'from-muted/20 to-transparent',
            },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover transition-all text-left group"
            >
              <div
                className={`w-12 h-12 rounded-xl glass bg-gradient-to-br ${item.gradient} flex items-center justify-center text-muted group-hover:text-text transition-colors`}
              >
                {item.icon}
              </div>
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              {item.value && (
                <span className="text-sm text-muted">{item.value}</span>
              )}
              <ChevronRightIcon
                size={18}
                className="text-muted opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          ))}
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
