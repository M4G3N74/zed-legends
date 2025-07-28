'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardClientPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalUsers: 0,
    totalPlays: 0,
    storageUsed: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [songsRes, streamsRes] = await Promise.all([
        fetch('/api/songs'),
        fetch('/api/streams')
      ]);
      
      const songsData = await songsRes.json();
      const streamsData = await streamsRes.json();
      
      setStats({
        totalSongs: songsData.totalSongs || 0,
        totalUsers: 156,
        totalPlays: streamsData.totalStreams || 0,
        storageUsed: 2.4
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
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
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: 'fa-cog',
      color: 'bg-gray-500',
      stats: 'Configure',
      route: '/dashboard/settings'
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-music text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalSongs}</p>
                <p className="text-gray-600 text-sm">Total Songs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-play text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlays.toLocaleString()}</p>
                <p className="text-gray-600 text-sm">Total Streams</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-orange-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-gray-600 text-sm">Active Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-database text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.storageUsed}GB</p>
                <p className="text-gray-600 text-sm">Storage Used</p>
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
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-upload text-green-600 text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">New song uploaded: "Zambian Dreams"</p>
                <p className="text-gray-500 text-sm">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-play text-blue-600 text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">Song reached 100 streams: "Lusaka Nights"</p>
                <p className="text-gray-500 text-sm">5 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fas fa-user-plus text-purple-600 text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">New user registered: john@example.com</p>
                <p className="text-gray-500 text-sm">10 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}