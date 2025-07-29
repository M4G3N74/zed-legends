'use client';

import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalStreams: 0,
    topSongs: [],
    dailyStreams: []
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/streams');
      const data = await res.json();
      setStats({
        totalStreams: data.totalStreams || 0,
        topSongs: data.topSongs || [],
        dailyStreams: [120, 150, 180, 200, 170, 190, 220] // Mock data
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
              <i className="fas fa-arrow-left"></i>
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 text-sm">View streaming statistics and insights</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-play text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalStreams.toLocaleString()}</p>
                <p className="text-gray-600 text-sm">Total Streams</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">24.7%</p>
                <p className="text-gray-600 text-sm">Growth Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">4.2m</p>
                <p className="text-gray-600 text-sm">Avg. Session</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Streamed Songs</h3>
            <div className="space-y-4">
              {stats.topSongs.length > 0 ? (
                stats.topSongs.slice(0, 5).map((song, index) => (
                  <div key={song.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{song.title}</p>
                      <p className="text-sm text-gray-600">{song.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{song.count}</p>
                      <p className="text-xs text-gray-500">streams</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No streaming data available</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Streams</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {stats.dailyStreams.map((streams, index) => (
                <div key={index} className="flex-1 bg-blue-100 rounded-t flex flex-col justify-end">
                  <div 
                    className="bg-blue-500 rounded-t transition-all"
                    style={{ height: `${(streams / Math.max(...stats.dailyStreams)) * 100}%` }}
                  ></div>
                  <p className="text-xs text-center text-gray-600 py-2">{streams}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}