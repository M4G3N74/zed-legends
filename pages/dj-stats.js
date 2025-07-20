import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import { useUser } from '../components/context/UserContext';

export default function DJStatsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    playHistory: [],
    skipHistory: [],
    likeHistory: [],
    djProfile: null
  });
  
  useEffect(() => {
    // Load data from localStorage
    try {
      const playHistory = JSON.parse(localStorage.getItem('playHistory') || '[]');
      const skipHistory = JSON.parse(localStorage.getItem('skipHistory') || '[]');
      const likeHistory = JSON.parse(localStorage.getItem('likedSongs') || '[]');
      const djProfile = JSON.parse(localStorage.getItem('djPurpleProfile') || 'null');
      
      setStats({
        playHistory,
        skipHistory,
        likeHistory,
        djProfile
      });
    } catch (error) {
      console.error('Error loading DJ stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return (
    <>
      <Head>
        <title>DJ Learning Stats | Zed Legends</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">DJ Learning Stats</h1>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauve"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview */}
              <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-overlay/30">
                <h2 className="text-xl font-semibold mb-4">Learning Overview</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-background/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-mauve">{stats.playHistory.length}</div>
                    <div className="text-sm text-muted">Songs Played</div>
                  </div>
                  <div className="bg-background/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-mauve">{stats.skipHistory.length}</div>
                    <div className="text-sm text-muted">Songs Skipped</div>
                  </div>
                  <div className="bg-background/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-mauve">{stats.likeHistory.length}</div>
                    <div className="text-sm text-muted">Songs Liked</div>
                  </div>
                  <div className="bg-background/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-mauve">
                      {stats.djProfile?.favoriteArtists?.length || 0}
                    </div>
                    <div className="text-sm text-muted">Favorite Artists</div>
                  </div>
                </div>
              </div>
              
              {/* Favorite Artists */}
              {stats.djProfile?.favoriteArtists?.length > 0 && (
                <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-overlay/30">
                  <h2 className="text-xl font-semibold mb-4">Favorite Artists</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {stats.djProfile.favoriteArtists.map((artist, index) => (
                      <div key={index} className="bg-background/30 rounded-lg p-3 flex items-center">
                        <div className="w-8 h-8 bg-mauve/20 rounded-full flex items-center justify-center mr-3">
                          <i className="fas fa-music text-mauve"></i>
                        </div>
                        <div className="truncate">{artist}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Active Hours */}
              {stats.djProfile?.listeningTimes && Object.keys(stats.djProfile.listeningTimes).length > 0 && (
                <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-overlay/30">
                  <h2 className="text-xl font-semibold mb-4">Active Listening Hours</h2>
                  
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => {
                      const isActive = stats.djProfile.listeningTimes[hour];
                      const count = isActive ? stats.djProfile.listeningTimes[hour].count : 0;
                      const timeLabel = `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`;
                      
                      return (
                        <div 
                          key={hour} 
                          className={`rounded-lg p-2 text-center ${
                            isActive 
                              ? 'bg-mauve/20 border border-mauve/30' 
                              : 'bg-background/30 border border-overlay/10'
                          }`}
                          title={`${timeLabel}: ${count} plays`}
                        >
                          <div className="text-xs">{timeLabel}</div>
                          <div className={`text-sm font-medium ${isActive ? 'text-mauve' : 'text-muted'}`}>
                            {count || '-'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Smart Shuffle Status */}
              <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-overlay/30">
                <h2 className="text-xl font-semibold mb-4">Smart Shuffle Status</h2>
                
                <div className="bg-background/30 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-mauve/20 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-brain text-mauve"></i>
                    </div>
                    <div>
                      <div className="font-medium">Smart Shuffle</div>
                      <div className="text-sm text-muted">DJ is learning from your listening habits</div>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 bg-green/20 text-green text-xs rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted">
                    <p>The DJ is using your play history, skips, and likes to learn your preferences.</p>
                    <p className="mt-2">The more you listen, the smarter the recommendations will become!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}