import { usePlayer } from '../context/SimplePlayerContext';
import { useState, useEffect, useRef } from 'react';

export default function NowPlayingBar({ isMobile }) {
  const {
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    repeat,
    shuffle,
    smartShuffleEnabled,
    bassBoost,
    megaBoost,
    autoplay,
    audioRef,
    playSong,
    pauseSong,
    playNextSong,
    playPreviousSong,
    toggleBassBoost,
    trackUserInteraction,
    setVolume,
    setRepeat,
    setShuffle,
    setSmartShuffleEnabled,
    setAutoplay
  } = usePlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const progressBarRef = useRef(null);
  const touchStartXRef = useRef(null);

  // Format time in MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Update progress bar width
  useEffect(() => {
    if (progressBarRef.current) {
      const progressPercent = (currentTime / duration) * 100 || 0;
      progressBarRef.current.style.width = `${progressPercent}%`;
    }
  }, [currentTime, duration]);

  // Handle progress bar click/touch
  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const position = (e.clientX || e.touches[0].clientX) - rect.left;
    const clickPosition = position / rect.width;
    audioRef.current.currentTime = clickPosition * duration;
  };

  // Handle swipe gestures for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartXRef.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next song
        playNextSong();
      } else {
        // Swipe right - previous song
        playPreviousSong();
      }
    }

    touchStartXRef.current = null;
  };

  const handlePlayPause = () => {
    console.log('Play/Pause button clicked. Current state:', isPlaying ? 'playing' : 'paused');

    if (isPlaying) {
      console.log('Pausing song');
      pauseSong();
    } else {
      console.log('Playing song');
      playSong();
    }
  };

  // Toggle expanded player view (mobile only)
  const toggleExpandedView = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`now-playing-bar fixed bottom-0 left-0 right-0 md:left-64 p-3 z-10
        ${megaBoost ? 'mega-boost-active' : ''}
        ${isExpanded ? 'expanded-player h-full sm:h-auto' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile expanded view */}
      {isMobile && isExpanded ? (
        <div className="expanded-player-content h-full flex flex-col p-4">
          {/* Close button */}
          <button
            className="self-end text-muted p-2"
            onClick={toggleExpandedView}
            aria-label="Close expanded view"
          >
            <i className="fas fa-times"></i>
          </button>

          {/* Album art - large */}
          <div className="album-art-large flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-xs aspect-square rounded-lg overflow-hidden shadow-lg">
              {currentSong?.albumArt ? (
                <img
                  src={currentSong.albumArt}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <i className="fas fa-music text-5xl text-muted"></i>
                </div>
              )}
            </div>
          </div>

          {/* Song info */}
          <div className="song-info text-center my-6">
            <h2 className="text-xl font-bold truncate">
              {currentSong?.title || 'No track selected'}
            </h2>
            <p className="text-muted truncate">
              {currentSong?.artist || 'Select a track to play'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="progress-container flex items-center gap-2 mb-6">
            <span className="text-sm text-muted">{formatTime(currentTime)}</span>

            <div
              className="progress-bar flex-1 h-2 bg-overlay rounded-full overflow-hidden cursor-pointer"
              onClick={handleProgressClick}
            >
              <div ref={progressBarRef} className="h-full bg-mauve"></div>
            </div>

            <span className="text-sm text-muted">{formatTime(duration)}</span>
          </div>

          {/* Main controls */}
          <div className="main-controls flex items-center justify-center gap-8 mb-6">
            <button
              className="control-button text-2xl text-muted hover:text-text"
              aria-label="Previous song"
              title="Previous"
              onClick={playPreviousSong}
            >
              <i className="fas fa-step-backward"></i>
            </button>

            <button
              className="control-button w-16 h-16 bg-mauve text-background rounded-full flex items-center justify-center hover:bg-lavender text-2xl"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
              onClick={handlePlayPause}
            >
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </button>

            <button
              className="control-button text-2xl text-muted hover:text-text"
              aria-label="Next song"
              title="Next"
              onClick={playNextSong}
            >
              <i className="fas fa-step-forward"></i>
            </button>
          </div>

          {/* Secondary controls */}
          <div className="secondary-controls flex items-center justify-center gap-6">
            <button
              className={`control-button ${shuffle ? 'text-mauve' : 'text-muted'}`}
              aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'}
              title="Shuffle"
              onClick={() => setShuffle(!shuffle)}
            >
              <i className="fas fa-random"></i>
            </button>

            <button
              className={`control-button relative ${!bassBoost ? 'text-muted' : megaBoost ? 'text-pink-500' : 'text-mauve'}`}
              aria-label={!bassBoost ? 'Bass boost off' : megaBoost ? 'Mega boost on' : 'Bass boost on'}
              title={!bassBoost ? 'Bass boost off' : megaBoost ? 'Mega boost on' : 'Bass boost on'}
              onClick={toggleBassBoost}
            >
              <i className="fas fa-drum"></i>
              {megaBoost && <span className="absolute -top-1 -right-1 text-xs font-bold">+</span>}
            </button>

            <button
              className={`control-button ${repeat !== 'none' ? 'text-mauve' : 'text-muted'}`}
              aria-label={`Repeat ${repeat}`}
              title={`Repeat ${repeat}`}
              onClick={() => {
                // Cycle through repeat modes: none -> all -> one -> none
                if (repeat === 'none') setRepeat('all');
                else if (repeat === 'all') setRepeat('one');
                else setRepeat('none');
              }}
            >
              <i className={`fas ${repeat === 'one' ? 'fa-repeat-1' : 'fa-redo'}`}></i>
            </button>

            <button
              className="control-button text-muted hover:text-pink-400"
              aria-label="Like song"
              title="Like this song"
              onClick={() => trackUserInteraction('like', currentSong?.id)}
            >
              <i className="fas fa-heart"></i>
            </button>

            <button
              className="download-button text-muted hover:text-text"
              aria-label="Download song"
              title="Download song"
            >
              <i className="fas fa-download"></i>
            </button>
          </div>
        </div>
      ) : (
        // Regular player view (collapsed on mobile, default on desktop)
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Song info - clickable on mobile to expand */}
          <div
            className={`now-playing-info flex items-center gap-3 flex-1 ${isMobile ? 'cursor-pointer' : ''}`}
            onClick={isMobile ? toggleExpandedView : undefined}
          >
            <div className="album-art w-12 h-12 rounded-md bg-background flex items-center justify-center overflow-hidden">
              {currentSong?.albumArt ? (
                <img
                  src={currentSong.albumArt}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-music text-muted"></i>
              )}
            </div>

            <div className="track-info flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">
                {currentSong?.title || 'No track selected'}
              </h3>
              <p className="text-xs text-muted truncate">
                {currentSong?.artist || 'Select a track to play'}
              </p>
            </div>

            {/* Mobile-only play/pause button for quick access */}
            {isMobile && (
              <button
                className="control-button w-10 h-10 bg-mauve text-background rounded-full flex items-center justify-center hover:bg-lavender"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                title={isPlaying ? 'Pause' : 'Play'}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent expanding the player
                  handlePlayPause();
                }}
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
            )}

            {/* Song actions - only visible on desktop or larger screens */}
            {!isMobile && currentSong && (
              <div className="song-actions hidden sm:flex gap-1">
                <button
                  className="control-button text-muted hover:text-pink-400"
                  aria-label="Like song"
                  title="Like this song (improves smart shuffle)"
                  onClick={() => trackUserInteraction('like', currentSong.id)}
                >
                  <i className="fas fa-heart"></i>
                </button>
                <button
                  className="control-button text-muted hover:text-blue-400"
                  aria-label="Dislike song"
                  title="Dislike this song (improves smart shuffle)"
                  onClick={() => trackUserInteraction('dislike', currentSong.id)}
                >
                  <i className="fas fa-thumbs-down"></i>
                </button>
                <button
                  className="download-button p-2 text-muted hover:text-text"
                  aria-label="Download song"
                  title="Download song"
                >
                  <i className="fas fa-download"></i>
                </button>
              </div>
            )}
          </div>

          {/* Player controls - only visible on desktop or larger screens */}
          {!isMobile && (
            <div className="player-controls flex-1 max-w-md mx-auto">
              <div className="control-buttons flex items-center justify-center gap-3 mb-1">
                <button
                  className={`control-button ${shuffle ? 'text-mauve' : 'text-muted'}`}
                  aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'}
                  title="Shuffle"
                  onClick={() => setShuffle(!shuffle)}
                >
                  <i className="fas fa-random"></i>
                </button>

                {shuffle && (
                  <button
                    className={`control-button ${smartShuffleEnabled ? 'text-mauve' : 'text-muted'}`}
                    aria-label={smartShuffleEnabled ? 'Smart shuffle on' : 'Smart shuffle off'}
                    title="Smart shuffle (learns from your listening habits)"
                    onClick={() => setSmartShuffleEnabled(!smartShuffleEnabled)}
                  >
                    <i className="fas fa-brain"></i>
                  </button>
                )}

                <button
                  className="control-button text-muted hover:text-text"
                  aria-label="Previous song"
                  title="Previous"
                  onClick={playPreviousSong}
                >
                  <i className="fas fa-step-backward"></i>
                </button>

                <button
                  className="control-button w-10 h-10 bg-mauve text-background rounded-full flex items-center justify-center hover:bg-lavender"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  title={isPlaying ? 'Pause' : 'Play'}
                  onClick={handlePlayPause}
                >
                  <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                </button>

                <button
                  className="control-button text-muted hover:text-text"
                  aria-label="Next song"
                  title="Next"
                  onClick={playNextSong}
                >
                  <i className="fas fa-step-forward"></i>
                </button>

                <button
                  className={`control-button ${repeat !== 'none' ? 'text-mauve' : 'text-muted'}`}
                  aria-label={`Repeat ${repeat}`}
                  title={`Repeat ${repeat}`}
                  onClick={() => {
                    // Cycle through repeat modes: none -> all -> one -> none
                    if (repeat === 'none') setRepeat('all');
                    else if (repeat === 'all') setRepeat('one');
                    else setRepeat('none');
                  }}
                >
                  <i className={`fas ${repeat === 'one' ? 'fa-repeat-1' : 'fa-redo'}`}></i>
                </button>
              </div>

              <div className="progress-container flex items-center gap-2">
                <span className="text-xs text-muted">{formatTime(currentTime)}</span>

                <div
                  className="progress-bar flex-1 h-1 bg-overlay rounded-full overflow-hidden cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div ref={progressBarRef} className="h-full bg-mauve"></div>
                </div>

                <span className="text-xs text-muted">{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Playback controls - only visible on desktop or larger screens */}
          {!isMobile && (
            <div className="playback-controls flex items-center gap-3">
              <button
                className={`control-button relative ${!bassBoost ? 'text-muted' : megaBoost ? 'text-pink-500' : 'text-mauve'}`}
                aria-label={!bassBoost ? 'Bass boost off' : megaBoost ? 'Mega boost on' : 'Bass boost on'}
                title={!bassBoost ? 'Bass boost off' : megaBoost ? 'Mega boost on' : 'Bass boost on'}
                onClick={toggleBassBoost}
              >
                <i className="fas fa-drum"></i>
                {megaBoost && <span className="absolute -top-1 -right-1 text-xs font-bold">+</span>}
              </button>

              <button
                className={`control-button ${autoplay ? 'text-mauve' : 'text-muted'}`}
                aria-label={autoplay ? 'Auto-play on' : 'Auto-play off'}
                title="Auto-play"
                onClick={() => setAutoplay(!autoplay)}
              >
                <i className="fas fa-infinity"></i>
              </button>

              <div className="volume-container relative">
                <button
                  className="volume-button p-2 text-muted hover:text-text"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                  aria-label="Volume"
                  title="Volume"
                  onClick={() => {
                    // Toggle mute when clicking the volume button
                    if (volume > 0) {
                      setVolume(0);
                    } else {
                      setVolume(1);
                    }
                  }}
                >
                  <i className={`fas ${
                    volume === 0 ? 'fa-volume-mute' :
                    volume < 0.5 ? 'fa-volume-down' :
                    'fa-volume-up'
                  }`}></i>
                </button>

                {showVolumeSlider && (
                  <div
                    className="volume-slider absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-surface rounded-md shadow-lg blur-container"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-24 accent-mauve"
                      aria-label="Volume control"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
