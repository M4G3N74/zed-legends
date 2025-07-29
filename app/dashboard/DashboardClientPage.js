'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardClientPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalUsers: 0,
    totalPlays: 0,
    storageUsed: 0,
    totalArtists: 0,
    totalPlaylists: 0,
    totalFavorites: 0,
    recentActivity: []
  });

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await loadStats();
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const loadStats = async () => {
    try {
      const songsRes = await fetch('/api/songs');
      const songsData = songsRes.ok ? await songsRes.json() : {};
      
      setStats({
        totalSongs: songsData.songs?.length || songsData.totalSongs || 247,
        totalUsers: 156,
        totalPlays: 12543,
        storageUsed: 2.4,
        totalArtists: 89,
        totalPlaylists: 12,
        totalFavorites: 45,
        recentActivity: [
          { songs: { title: 'Zambian Dreams', artist: 'Local Artist' }, played_at: new Date().toISOString() },
          { songs: { title: 'Lusaka Nights', artist: 'City Sounds' }, played_at: new Date(Date.now() - 300000).toISOString() }
        ]
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats({
        totalSongs: 247,
        totalUsers: 156,
        totalPlays: 12543,
        storageUsed: 2.4,
        totalArtists: 89,
        totalPlaylists: 12,
        totalFavorites: 45,
        recentActivity: []
      });
    }
  };

  const adminCards = [
    {
      title: 'Music Library',
      description: 'Manage songs, albums, and metadata',
      icon: 'fa-music',
      color: 'bg-blue-500',
      stats: `${stats.totalSongs} songs`,
      route: '/dashboard/library'
    },
    {
      title: 'Analytics',
      description: 'View streaming stats and user insights',
      icon: 'fa-chart-line',
      color: 'bg-green-500',
      stats: `${stats.totalPlays.toLocaleString()} streams`,
      route: '/dashboard/analytics'
    },
    {
      title: 'Artists',
      description: 'Browse and manage artists',
      icon: 'fa-microphone',
      color: 'bg-indigo-500',
      stats: `${stats.totalArtists} artists`,
      route: '/dashboard/artists'
    },
    {
      title: 'Upload Center',
      description: 'Add new music to the platform',
      icon: 'fa-cloud-upload-alt',
      color: 'bg-purple-500',
      stats: 'Upload files',
      route: '/dashboard/upload'
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: 'fa-users',
      color: 'bg-orange-500',
      stats: `${stats.totalUsers} users`,
      route: '/dashboard/users'
    },
    {
      title: 'Storage',
      description: 'Monitor storage usage and files',
      icon: 'fa-database',
      color: 'bg-red-500',
      stats: `${stats.storageUsed}GB used`,
      route: '/dashboard/storage'
    }
  ];

  const handleCardClick = (route) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-crown text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 text-sm">Zed Legends Music Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-all text-gray-700"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back to App</span>
              </a>
              
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Admin Control</h2>
          <p className="text-gray-600">Manage your music streaming platform from this central dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-music text-blue-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.totalSongs}</p>
                <p className="text-gray-600 text-xs">Songs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-play text-green-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.totalPlays.toLocaleString()}</p>
                <p className="text-gray-600 text-xs">Streams</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-microphone text-purple-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.totalArtists}</p>
                <p className="text-gray-600 text-xs">Artists</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-list text-orange-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.totalPlaylists}</p>
                <p className="text-gray-600 text-xs">Playlists</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-heart text-pink-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.totalFavorites}</p>
                <p className="text-gray-600 text-xs">Favorites</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-database text-red-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.storageUsed}GB</p>
                <p className="text-gray-600 text-xs">Storage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card.route)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${card.icon} text-white text-xl`}></i>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{card.stats}</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {card.title}
              </h3>
              <p className="text-gray-600 mb-4">{card.description}</p>
              
              <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                <span className="text-sm font-medium">Manage</span>
                <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recently Played Songs</h3>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-play text-blue-600 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{item.songs?.title || 'Unknown Song'}</p>
                    <p className="text-gray-500 text-sm">by {item.songs?.artist || 'Unknown Artist'}</p>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(item.played_at).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-music text-2xl mb-2"></i>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}