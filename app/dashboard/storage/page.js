'use client';

import { useState, useEffect } from 'react';

export default function StoragePage() {
  const [storageStats, setStorageStats] = useState({
    used: 2.4,
    total: 100,
    files: 0
  });

  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    try {
      const res = await fetch('/api/songs');
      const data = await res.json();
      setStorageStats(prev => ({
        ...prev,
        files: data.totalSongs || 0
      }));
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  const usagePercentage = (storageStats.used / storageStats.total) * 100;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
              <i className="fas fa-arrow-left"></i>
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Storage Management</h1>
              <p className="text-gray-600 text-sm">Monitor storage usage and manage files</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-database text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{storageStats.used}GB</p>
                <p className="text-gray-600 text-sm">Used Storage</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-hdd text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{storageStats.total - storageStats.used}GB</p>
                <p className="text-gray-600 text-sm">Available</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-audio text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{storageStats.files}</p>
                <p className="text-gray-600 text-sm">Total Files</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Storage Usage</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Used: {storageStats.used}GB</span>
              <span>Total: {storageStats.total}GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${
                  usagePercentage > 80 ? 'bg-red-500' : 
                  usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{usagePercentage.toFixed(1)}% used</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">File Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-file-audio text-blue-600 text-sm"></i>
                  </div>
                  <span className="font-medium">MP3 Files</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{Math.floor(storageStats.files * 0.8)}</p>
                  <p className="text-xs text-gray-500">files</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-file-audio text-green-600 text-sm"></i>
                  </div>
                  <span className="font-medium">WAV Files</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{Math.floor(storageStats.files * 0.15)}</p>
                  <p className="text-xs text-gray-500">files</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-file-audio text-purple-600 text-sm"></i>
                  </div>
                  <span className="font-medium">FLAC Files</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{Math.floor(storageStats.files * 0.05)}</p>
                  <p className="text-xs text-gray-500">files</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Storage Actions</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                <i className="fas fa-broom text-blue-600"></i>
                <div className="text-left">
                  <p className="font-medium text-blue-900">Clean Temporary Files</p>
                  <p className="text-sm text-blue-700">Remove temporary and cache files</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                <i className="fas fa-compress text-green-600"></i>
                <div className="text-left">
                  <p className="font-medium text-green-900">Optimize Storage</p>
                  <p className="text-sm text-green-700">Compress and optimize files</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                <i className="fas fa-download text-orange-600"></i>
                <div className="text-left">
                  <p className="font-medium text-orange-900">Backup Files</p>
                  <p className="text-sm text-orange-700">Create backup of all files</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}