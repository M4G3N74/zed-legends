// Debug component to show DJ learning status
import { useState, useEffect } from 'react';

export default function SmartDJDebug() {
  const [playHistory, setPlayHistory] = useState([]);
  const [skipHistory, setSkipHistory] = useState([]);
  const [likeHistory, setLikeHistory] = useState([]);
  const [djProfile, setDjProfile] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  
  useEffect(() => {
    // Load data from localStorage
    const loadData = () => {
      try {
        const playHistoryData = JSON.parse(localStorage.getItem('playHistory') || '[]');
        const skipHistoryData = JSON.parse(localStorage.getItem('skipHistory') || '[]');
        const likeHistoryData = JSON.parse(localStorage.getItem('likedSongs') || '[]');
        const djProfileData = JSON.parse(localStorage.getItem('djPurpleProfile') || 'null');
        
        setPlayHistory(playHistoryData);
        setSkipHistory(skipHistoryData);
        setLikeHistory(likeHistoryData);
        setDjProfile(djProfileData);
        
        console.log('DJ Learning Status:');
        console.log(`- Songs played: ${playHistoryData.length}`);
        console.log(`- Songs skipped: ${skipHistoryData.length}`);
        console.log(`- Songs liked: ${likeHistoryData.length}`);
        console.log(`- Favorite artists: ${djProfileData?.favoriteArtists?.length || 0}`);
        console.log(`- Active hours: ${Object.keys(djProfileData?.listeningTimes || {}).length}`);
      } catch (error) {
        console.error('Error loading DJ debug data:', error);
      }
    };
    
    // Load initial data
    loadData();
    
    // Set up interval to refresh data
    const interval = setInterval(loadData, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="text-xs text-muted hover:text-mauve"
      >
        Show DJ Learning Status
      </button>
    );
  }
  
  return (
    <div className="bg-surface/50 rounded-lg p-3 text-xs border border-overlay/30 mt-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">DJ Learning Status</h4>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-muted hover:text-mauve"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p><span className="text-mauve">Songs played:</span> {playHistory.length}</p>
          <p><span className="text-mauve">Songs skipped:</span> {skipHistory.length}</p>
          <p><span className="text-mauve">Songs liked:</span> {likeHistory.length}</p>
        </div>
        <div>
          <p><span className="text-mauve">Favorite artists:</span> {djProfile?.favoriteArtists?.length || 0}</p>
          <p><span className="text-mauve">Active hours:</span> {Object.keys(djProfile?.listeningTimes || {}).length}</p>
          <p><span className="text-mauve">Learning points:</span> {djProfile?.skipPatterns?.length || 0}</p>
        </div>
      </div>
      
      {djProfile?.favoriteArtists?.length > 0 && (
        <div className="mt-2">
          <p className="text-mauve">Top artists:</p>
          <p className="text-muted">{djProfile.favoriteArtists.slice(0, 3).join(', ')}</p>
        </div>
      )}
    </div>
  );
}