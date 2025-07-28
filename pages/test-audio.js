import { useState, useEffect } from 'react';

export default function TestAudio() {
  const [songs, setSongs] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch('/api/songs')
      .then(res => res.json())
      .then(data => setSongs(data.songs || []));
  }, []);

  const playAudio = (song) => {
    console.log('Play button clicked for:', song.title);
    console.log('Song URL:', song.url);
    
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio();
    audio.src = `/api/proxy-audio?url=${encodeURIComponent(song.url)}`;
    
    audio.addEventListener('loadstart', () => console.log('Load started'));
    audio.addEventListener('loadeddata', () => console.log('Data loaded'));
    audio.addEventListener('canplay', () => console.log('Can play'));
    audio.addEventListener('play', () => {
      console.log('Audio playing');
      setIsPlaying(true);
    });
    audio.addEventListener('pause', () => {
      console.log('Audio paused');
      setIsPlaying(false);
    });
    audio.addEventListener('ended', () => {
      console.log('Audio ended');
      setIsPlaying(false);
    });
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      console.error('Audio error details:', audio.error);
    });
    
    console.log('Attempting to play...');
    audio.play().then(() => {
      console.log('Play promise resolved');
      setCurrentAudio(audio);
    }).catch(error => {
      console.error('Play promise rejected:', error);
    });
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Audio Test Page</h1>
      
      {isPlaying && (
        <button onClick={stopAudio} style={{ marginBottom: '20px', padding: '10px' }}>
          Stop Audio
        </button>
      )}
      
      <div>
        {songs.slice(0, 10).map(song => (
          <div key={song.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
            <div><strong>{song.title}</strong> - {song.artist}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{song.url}</div>
            <button 
              onClick={() => playAudio(song)}
              style={{ marginTop: '5px', padding: '5px 10px' }}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}