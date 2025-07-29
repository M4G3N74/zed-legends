'use client';

import React, { useState, useEffect } from 'react';

interface StatsOverviewProps {
  userId: string;
}

interface Stats {
  totalPlays: number;
  todayListeningTime: number;
  topArtists: any[];
  topSongs: any[];
}

export default function StatsOverview({ userId }: StatsOverviewProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch('/api/stats', {
        headers: { Authorization: `Bearer ${userId}` }
      });
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="stats-overview">
        <h2 className="text-lg font-bold mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-overlay rounded mb-2"></div>
              <div className="h-6 bg-overlay rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="stats-overview">
      <h2 className="text-lg font-bold mb-4">Your Stats</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface p-4 rounded-lg">
          <div className="text-sm text-muted mb-1">Total Plays</div>
          <div className="text-2xl font-bold text-mauve">{stats.totalPlays}</div>
        </div>
        
        <div className="bg-surface p-4 rounded-lg">
          <div className="text-sm text-muted mb-1">Today</div>
          <div className="text-2xl font-bold text-green">{formatTime(stats.todayListeningTime)}</div>
        </div>
      </div>

      {stats.topArtists.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Top Artists</h3>
          <div className="space-y-2">
            {stats.topArtists.slice(0, 3).map((artist, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-muted">{index + 1}.</span>
                <span className="flex-1">{artist.name}</span>
                <span className="text-muted">{artist.plays} plays</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}