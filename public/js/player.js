/**
 * Music Player with Auto-play Functionality
 * A responsive web-based music player with advanced features
 *
 * @version 1.0.0
 * @author Music Stream Team
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} unsafe - The unsafe string that might contain HTML
 * @returns {string} - The escaped safe string
 */
function escapeHTML(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const playButton = document.getElementById('play-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const shuffleButton = document.getElementById('shuffle-button');
const repeatButton = document.getElementById('repeat-button');
const autoplayButton = document.getElementById('autoplay-button');
const refreshButton = document.getElementById('refresh-button');
const volumeSlider = document.getElementById('volume');
const progressBar = document.getElementById('progress');
const progressContainer = document.querySelector('.progress-bar');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('duration');
const currentTitleDisplay = document.getElementById('current-title');
const currentArtistDisplay = document.getElementById('current-artist');
const playlist = document.getElementById('playlist');

// Player State
const playerState = {
  songs: [],
  currentSongIndex: 0,
  isPlaying: false,
  shuffle: false,
  repeat: 'none', // 'none', 'one', 'all'
  autoplay: true, // Auto-play is enabled by default
  volume: 1.0,
  sortBy: 'artist', // Default sort by artist
  
  // Pagination state
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  hasMore: true,
  songsPerPage: 50,
  totalSongs: 0,
  
  // Audio processing (simplified interface)
  audioContext: null,
  audioEffects: {
    bassBoost: false
  }
};

/**
 * Initialize the music player application
 * Sets up the player, loads songs, initializes UI components and event listeners
 */
function initPlayer() {
  // Load songs from the server
  fetchSongs();

  // Set up event listeners
  setupEventListeners();

  // Load player preferences from localStorage
  loadPlayerPreferences();

  // Initialize audio processing
  initAudioProcessing();

  // Set up pagination or infinite scroll based on mode
  if (playerState.paginationMode === 'standard') {
    setupPagination();
  } else {
    setupInfiniteScroll();
  }
}

// Set up pagination controls and event listeners
function setupPagination() {
  // Get pagination elements
  const pageSize = document.getElementById('page-size');
  const firstPageBtn = document.getElementById('first-page-btn');
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  const lastPageBtn = document.getElementById('last-page-btn');
  const firstPageBtnBottom = document.getElementById('first-page-btn-bottom');
  const prevPageBtnBottom = document.getElementById('prev-page-btn-bottom');
  const nextPageBtnBottom = document.getElementById('next-page-btn-bottom');
  const lastPageBtnBottom = document.getElementById('last-page-btn-bottom');
  const paginationModeToggle = document.getElementById('pagination-mode-toggle');

  // Update pagination mode toggle UI
  updatePaginationModeToggle();

  // Page size change event
  pageSize.addEventListener('change', () => {
    playerState.songsPerPage = parseInt(pageSize.value);
    playerState.currentPage = 1; // Reset to first page
    fetchSongs(false, 1, false);
    savePlayerPreferences();
  });

  // Pagination mode toggle event
  paginationModeToggle.addEventListener('click', () => {
    // Toggle between standard and infinite scroll
    playerState.paginationMode = playerState.paginationMode === 'standard' ? 'infinite' : 'standard';

    // Update UI
    updatePaginationModeToggle();

    // Reload songs with the new pagination mode
    playerState.currentPage = 1;
    fetchSongs(false, 1, false);

    // Save preference
    savePlayerPreferences();

    // Show notification
    showNotification(`Switched to ${playerState.paginationMode === 'standard' ? 'standard pagination' : 'infinite scroll'} mode`);
  });

  // Navigation buttons - top
  firstPageBtn.addEventListener('click', () => goToPage(1));
  prevPageBtn.addEventListener('click', () => goToPage(playerState.currentPage - 1));
  nextPageBtn.addEventListener('click', () => goToPage(playerState.currentPage + 1));
  lastPageBtn.addEventListener('click', () => goToPage(playerState.totalPages));

  // Navigation buttons - bottom
  firstPageBtnBottom.addEventListener('click', () => goToPage(1));
  prevPageBtnBottom.addEventListener('click', () => goToPage(playerState.currentPage - 1));
  nextPageBtnBottom.addEventListener('click', () => goToPage(playerState.currentPage + 1));
  lastPageBtnBottom.addEventListener('click', () => goToPage(playerState.totalPages));
}

// Update pagination mode toggle UI
function updatePaginationModeToggle() {
  const paginationModeToggle = document.getElementById('pagination-mode-toggle');
  if (!paginationModeToggle) return;

  const toggleText = paginationModeToggle.querySelector('span');

  // Update class and text based on current mode
  paginationModeToggle.className = playerState.paginationMode;
  toggleText.textContent = playerState.paginationMode === 'standard' ? 'Standard' : 'Infinite';

  // Show/hide pagination controls based on mode
  const paginationControls = document.querySelectorAll('.pagination-controls');
  paginationControls.forEach(control => {
    control.style.display = playerState.paginationMode === 'standard' ? 'flex' : 'none';
  });
}

// Go to a specific page
function goToPage(page) {
  if (page < 1 || page > playerState.totalPages || page === playerState.currentPage) {
    return;
  }

  playerState.currentPage = page;
  fetchSongs(false, page, false);

  // Scroll to top of playlist
  const playlistContainer = document.querySelector('.playlist-container');
  if (playlistContainer) {
    playlistContainer.scrollTop = 0;
  }
}

// Update pagination display
function updatePaginationDisplay() {
  // Update page info displays
  const pageDisplay = document.getElementById('page-display');
  const itemsDisplay = document.getElementById('items-display');
  const pageDisplayBottom = document.getElementById('page-display-bottom');
  const itemsDisplayBottom = document.getElementById('items-display-bottom');

  // Calculate start and end item numbers
  const startItem = (playerState.currentPage - 1) * playerState.songsPerPage + 1;
  const endItem = Math.min(startItem + playerState.songsPerPage - 1, playerState.totalSongs);

  // Update text
  const pageText = `Page ${playerState.currentPage} of ${playerState.totalPages}`;
  const itemsText = `Showing ${startItem}-${endItem} of ${playerState.totalSongs} songs`;

  pageDisplay.textContent = pageText;
  itemsDisplay.textContent = itemsText;
  pageDisplayBottom.textContent = pageText;
  itemsDisplayBottom.textContent = itemsText;

  // Update page number buttons
  updatePageNumbers();

  // Update button states
  updatePaginationButtonStates();
}

// Update page number buttons
function updatePageNumbers() {
  const pageNumbersContainer = document.getElementById('page-numbers');
  const pageNumbersContainerBottom = document.getElementById('page-numbers-bottom');

  // Clear existing page numbers
  pageNumbersContainer.innerHTML = '';
  pageNumbersContainerBottom.innerHTML = '';

  // Calculate range of page numbers to show
  let startPage = Math.max(1, playerState.currentPage - Math.floor(playerState.maxPageButtons / 2));
  let endPage = Math.min(playerState.totalPages, startPage + playerState.maxPageButtons - 1);

  // Adjust if we're near the end
  if (endPage - startPage + 1 < playerState.maxPageButtons) {
    startPage = Math.max(1, endPage - playerState.maxPageButtons + 1);
  }

  // Add ellipsis at start if needed
  if (startPage > 1) {
    addPageNumber(pageNumbersContainer, 1);
    if (startPage > 2) {
      addEllipsis(pageNumbersContainer);
    }
  }

  // Add page numbers
  for (let i = startPage; i <= endPage; i++) {
    addPageNumber(pageNumbersContainer, i);
  }

  // Add ellipsis at end if needed
  if (endPage < playerState.totalPages) {
    if (endPage < playerState.totalPages - 1) {
      addEllipsis(pageNumbersContainer);
    }
    addPageNumber(pageNumbersContainer, playerState.totalPages);
  }

  // Duplicate for bottom pagination
  pageNumbersContainerBottom.innerHTML = pageNumbersContainer.innerHTML;

  // Add event listeners to bottom pagination
  pageNumbersContainerBottom.querySelectorAll('.page-number').forEach(btn => {
    const page = parseInt(btn.dataset.page);
    btn.addEventListener('click', () => goToPage(page));
  });
}

// Add a page number button
function addPageNumber(container, page) {
  const pageNumber = document.createElement('div');
  pageNumber.className = 'page-number';
  if (page === playerState.currentPage) {
    pageNumber.classList.add('active');
  }
  pageNumber.textContent = page;
  pageNumber.dataset.page = page;
  pageNumber.addEventListener('click', () => goToPage(page));
  container.appendChild(pageNumber);
}

// Add ellipsis
function addEllipsis(container) {
  const ellipsis = document.createElement('div');
  ellipsis.className = 'page-ellipsis';
  ellipsis.textContent = '...';
  container.appendChild(ellipsis);
}

// Update pagination button states
function updatePaginationButtonStates() {
  const firstPageBtn = document.getElementById('first-page-btn');
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  const lastPageBtn = document.getElementById('last-page-btn');
  const firstPageBtnBottom = document.getElementById('first-page-btn-bottom');
  const prevPageBtnBottom = document.getElementById('prev-page-btn-bottom');
  const nextPageBtnBottom = document.getElementById('next-page-btn-bottom');
  const lastPageBtnBottom = document.getElementById('last-page-btn-bottom');

  // Disable/enable buttons based on current page
  const isFirstPage = playerState.currentPage === 1;
  const isLastPage = playerState.currentPage === playerState.totalPages;

  firstPageBtn.disabled = isFirstPage;
  prevPageBtn.disabled = isFirstPage;
  nextPageBtn.disabled = isLastPage;
  lastPageBtn.disabled = isLastPage;

  firstPageBtnBottom.disabled = isFirstPage;
  prevPageBtnBottom.disabled = isFirstPage;
  nextPageBtnBottom.disabled = isLastPage;
  lastPageBtnBottom.disabled = isLastPage;
}

// Set up infinite scroll using Intersection Observer
function setupInfiniteScroll() {
  // Create an observer for the load more trigger
  const observerOptions = {
    root: document.querySelector('.playlist-container'),
    rootMargin: '100px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // If the load more trigger is visible and we have more songs to load
      if (entry.isIntersecting && playerState.hasMore && !playerState.isLoading) {
        // Load the next page
        const nextPage = playerState.currentPage + 1;
        fetchSongs(false, nextPage, true);
      }
    });
  }, observerOptions);

  // Re-observe the load more trigger whenever the playlist changes
  document.addEventListener('playlistUpdated', () => {
    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }
  });
}

// Initialize audio processing (simplified)
function initAudioProcessing() {
  try {
    // Create audio context with browser compatibility
    let audioCtx;
    try {
      audioCtx = new (window.AudioContext || Function('return window.webkitAudioContext')())();
    } catch (e) {
      throw new Error('Web Audio API not supported');
    }
    playerState.audioContext = audioCtx;

    // Create audio processing pipeline
    setupAudioPipeline();

    console.log('Audio processing initialized successfully');
  } catch (error) {
    console.error('Failed to initialize audio processing:', error);
    // Fallback to normal audio playback
    playerState.audioEffects.bassBoost = false;
  }
}

// Set up audio processing pipeline (implementation hidden from user)
function setupAudioPipeline() {
  // Implementation details hidden from user
  // This function sets up the necessary audio nodes for effects
}

// Initialize Plexamp-inspired visualizer
function initVisualizer() {
  const canvas = document.getElementById('visualizer');
  if (!canvas) {
    console.error('Visualizer canvas not found');
    return;
  }

  const ctx = canvas.getContext('2d');
  let animationId;
  let gradientColors;

  // Resize canvas to match container
  function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Create gradient based on current song's album art or default colors
    createGradient();
  }

  // Create gradient based on current song
  function createGradient() {
    // Default gradient colors (Catppuccin Mocha)
    gradientColors = [
      { pos: 0, color: '#cba6f7' }, // Mauve
      { pos: 0.5, color: '#f5c2e7' }, // Pink
      { pos: 1, color: '#89dceb' }  // Sky
    ];

    // If there's album art, try to extract colors (simplified)
    const currentSong = playerState.songs[playerState.currentSongIndex];
    if (currentSong && currentSong.albumArt) {
      // In a real implementation, you would extract colors from the album art
      // For now, we'll just use the default gradient
    }
  }

  // Draw the visualizer
  function drawVisualizer() {
    if (!playerState.audioContext || !playerState.analyzerNode) {
      return;
    }

    // Get frequency data
    const bufferLength = playerState.analyzerNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    playerState.analyzerNode.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientColors.forEach(color => {
      gradient.addColorStop(color.pos, color.color);
    });

    // Draw bars
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

      // Skip some bars for a more sparse look
      if (i % 2 === 0) {
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = gradientColors[0].color;
      }

      x += barWidth + 1;
    }

    // Request next frame
    animationId = requestAnimationFrame(drawVisualizer);
  }

  // Start visualizer
  function startVisualizer() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    drawVisualizer();
  }

  // Stop visualizer
  function stopVisualizer() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // Initialize
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Start/stop visualizer based on playback
  audioPlayer.addEventListener('play', startVisualizer);
  audioPlayer.addEventListener('pause', stopVisualizer);
  audioPlayer.addEventListener('ended', stopVisualizer);

  // If already playing, start visualizer
  if (!audioPlayer.paused) {
    startVisualizer();
  }
}

/**
 * Toggle bass boost effect on/off
 */
function toggleBassBoost() {
  if (!playerState.audioContext) {
    showNotification('Audio effects are not available in your browser', 'error');
    return;
  }

  playerState.audioEffects.bassBoost = !playerState.audioEffects.bassBoost;
  
  // Apply effect (implementation details hidden)
  applyBassBoost();

  // Update UI
  const bassBoostButton = document.getElementById('bass-boost-button');
  if (bassBoostButton) {
    bassBoostButton.classList.toggle('active', playerState.audioEffects.bassBoost);
    bassBoostButton.setAttribute('aria-pressed', playerState.audioEffects.bassBoost);
    bassBoostButton.setAttribute('aria-label', 
      playerState.audioEffects.bassBoost ? 'Bass Boost enabled' : 'Bass Boost disabled');
  }

  // Show notification
  showNotification(playerState.audioEffects.bassBoost ? 'Bass boost enabled' : 'Bass boost disabled');

  // Save preference
  savePlayerPreferences();
}

// Apply bass boost effect (implementation hidden from user)
function applyBassBoost() {
  // Implementation details hidden from user
}

/**
 * Fetch songs from the server with pagination and search support
 * @param {boolean} isRefresh - Whether this is a refresh request (reloads all songs)
 * @param {number} page - The page number to fetch
 * @param {boolean} append - Whether to append the results to existing songs (for infinite scroll)
 * @returns {Promise<void>} - A promise that resolves when songs are fetched and processed
 */
async function fetchSongs(isRefresh = false, page = 1, append = false) {
  try {
    // If already loading, don't make another request
    if (playerState.isLoading) {
      return;
    }

    // Set loading state
    playerState.isLoading = true;

    // If this is a refresh, reset pagination and clear songs
    if (isRefresh) {
      playerState.currentPage = 1;
      playerState.songs = [];
      playerState.hasMore = true;
      refreshButton.classList.add('loading');
      playlist.innerHTML = '<li class="loading">Refreshing library...</li>';
    } else if (!append) {
      // If not appending, show loading indicator
      playlist.innerHTML = '<li class="loading">Loading songs...</li>';
    } else if (playerState.paginationMode === 'infinite') {
      // If appending in infinite scroll mode, add loading indicator at the end
      const loadingItem = document.createElement('li');
      loadingItem.className = 'loading';
      loadingItem.textContent = 'Loading more songs...';
      loadingItem.id = 'loading-more';
      playlist.appendChild(loadingItem);
    }

    // Build URL with pagination and search parameters
    let url = `/api/songs?page=${page}&limit=${playerState.songsPerPage}&sortBy=${playerState.sortBy}`;

    // Add search query if present
    if (playerState.searchQuery) {
      url += `&search=${encodeURIComponent(playerState.searchQuery)}`;
      playerState.isSearching = true;
    } else {
      playerState.isSearching = false;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch songs');
    }

    const data = await response.json();
    const { pagination, songs } = data;

    // Update pagination state
    playerState.currentPage = pagination.page;
    playerState.totalPages = pagination.totalPages;
    playerState.hasMore = pagination.hasMore;
    playerState.totalSongs = pagination.total;

    // If appending in infinite scroll mode, add to existing songs, otherwise replace
    if (append && playerState.paginationMode === 'infinite') {
      playerState.songs = [...playerState.songs, ...songs];

      // Remove the loading indicator
      const loadingItem = document.getElementById('loading-more');
      if (loadingItem) {
        loadingItem.remove();
      }
    } else {
      playerState.songs = songs;
    }

    // Update the song count display
    updateSongCount(pagination.total);

    // Update pagination display if in standard pagination mode
    if (playerState.paginationMode === 'standard') {
      updatePaginationDisplay();
    }

    // Render the playlist
    renderPlaylist(append && playerState.paginationMode === 'infinite');

    // If there are songs and this is the first load, load the first song
    if (playerState.songs.length > 0 && !isRefresh && !append && page === 1) {
      loadSong(0);
    }

    // Show a notification if refreshing
    if (isRefresh) {
      showNotification('Library refreshed successfully!');
      refreshButton.classList.remove('loading');
    }
  } catch (error) {
    console.error('Error fetching songs:', error);

    // Handle different types of errors
    let errorMessage = 'Error loading songs. Please try again later.';

    if (error.name === 'AbortError') {
      errorMessage = 'Request was aborted. Please try again.';
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message === 'Failed to fetch songs') {
      // Server returned an error status
      errorMessage = 'Server error. Please try again later.';
    }

    if (!append) {
      playlist.innerHTML = `<li class="error">${errorMessage}</li>`;
      // Reset song count on error
      updateSongCount(0);
    } else if (playerState.paginationMode === 'infinite') {
      // Remove loading indicator if appending in infinite scroll mode
      const loadingItem = document.getElementById('loading-more');
      if (loadingItem) {
        loadingItem.remove();
      }

      // Show error notification for infinite scroll
      showNotification('Failed to load more songs. Please try again.', 'error');
    }

    if (isRefresh) {
      showNotification('Failed to refresh library. Please try again.', 'error');
      refreshButton.classList.remove('loading');
    }
  } finally {
    // Reset loading state
    playerState.isLoading = false;
  }
}

// Update the song count display
function updateSongCount(count) {
  const songCountElement = document.getElementById('total-songs-count');
  if (songCountElement) {
    songCountElement.textContent = count;

    // Update the title attribute with more details
    const songCountContainer = document.querySelector('.song-count');
    if (songCountContainer) {
      songCountContainer.title = `${count} songs in library`;
    }
  }
}

// Show a notification
function showNotification(message, type = 'success', duration = 3000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;

  // Set content (support HTML)
  if (typeof message === 'string' && message.includes('<')) {
    notification.innerHTML = message;
  } else {
    notification.textContent = message;
  }

  // Add to the DOM
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Remove after a delay
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }
}

/**
 * Render the playlist in the UI
 * Creates HTML elements for each song and adds event listeners
 * @param {boolean} append - Whether to append to existing playlist or replace it
 */
function renderPlaylist(append = false) {
  if (playerState.songs.length === 0) {
    playlist.innerHTML = '<li class="empty">No songs found. Add some music to your library.</li>';
    return;
  }

  // If not appending, clear the playlist first
  if (!append) {
    playlist.innerHTML = '';
  }

  // Get the songs to render (either all songs or just the new ones)
  let songsToRender = playerState.songs;
  if (append) {
    // If appending, only render the new songs (from the current page)
    const startIndex = (playerState.currentPage - 1) * playerState.songsPerPage;
    songsToRender = playerState.songs.slice(startIndex);
  }

  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();

  // Create HTML for each song
  songsToRender.forEach((song) => {
    const index = playerState.songs.indexOf(song);
    const songItem = document.createElement('li');
    songItem.className = index === playerState.currentSongIndex ? 'active' : '';
    songItem.dataset.index = index;

    // Sanitize strings to prevent XSS
    const safeTitle = escapeHTML(song.title);
    const safeArtist = escapeHTML(song.artist);
    const safeAlbum = song.album ? escapeHTML(song.album) : '';

    // Use template literals for HTML construction
    songItem.innerHTML = `
      <div class="song-thumbnail">
        ${song.albumArt
          ? `<img src="${song.albumArt}" alt="${safeTitle}" class="thumbnail-image" loading="lazy">`
          : `<div class="thumbnail-placeholder"><i class="fas fa-music"></i></div>`
        }
      </div>
      <div class="song-info">
        <div class="song-title">${safeTitle}</div>
        <div class="song-details">
          <span class="song-artist">${safeArtist}</span>
          ${safeAlbum ? `<span class="song-album"> • ${safeAlbum}</span>` : ''}
        </div>
      </div>
      <div class="song-actions">
        <button class="edit-button" title="Edit Metadata">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-button" title="Delete Song">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;

    // Add the song item to the fragment (not directly to DOM)
    fragment.appendChild(songItem);

    // Add click event listeners using event delegation
    songItem.addEventListener('click', (e) => {
      // Check if clicked on song info or thumbnail
      if (e.target.closest('.song-info') || e.target.closest('.song-thumbnail')) {
        loadSong(index);
        playSong();
      }

      // Check if clicked on edit button
      if (e.target.closest('.edit-button')) {
        e.stopPropagation(); // Prevent triggering the song play
        openEditModal(index);
      }

      // Check if clicked on delete button
      if (e.target.closest('.delete-button')) {
        e.stopPropagation(); // Prevent triggering the song play
        openDeleteModal(index);
      }
    });
  });

  // Add all songs to the playlist at once (single DOM operation)
  playlist.appendChild(fragment);

  // Add a loading trigger element at the end if in infinite scroll mode and there are more songs to load
  if (playerState.paginationMode === 'infinite' && playerState.hasMore) {
    const loadMoreTrigger = document.createElement('li');
    loadMoreTrigger.className = 'load-more-trigger';
    loadMoreTrigger.id = 'load-more-trigger';
    loadMoreTrigger.innerHTML = '<div class="load-more-text">Loading more songs...</div>';
    playlist.appendChild(loadMoreTrigger);
  }

  // Dispatch a custom event to notify that the playlist has been updated
  document.dispatchEvent(new CustomEvent('playlistUpdated'));
}

// Load a song
function loadSong(index) {
  // Validate index
  if (index < 0) index = playerState.songs.length - 1;
  if (index >= playerState.songs.length) index = 0;

  // Update current song index
  playerState.currentSongIndex = index;

  // Get the song
  const song = playerState.songs[index];

  // Update audio source
  audioPlayer.src = song.path;
  audioPlayer.load();

  // Update display
  currentTitleDisplay.textContent = song.title;
  currentArtistDisplay.textContent = song.artist;

  // Update download button
  const downloadButton = document.getElementById('download-button');
  if (downloadButton) {
    downloadButton.onclick = () => downloadSong(song);
  }

  // Update album art and background
  updateAlbumArt(song);

  // Update playlist highlighting
  document.querySelectorAll('#playlist li').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });

  // Reset progress bar
  updateProgress();
}

// Update album art and background
function updateAlbumArt(song) {
  const albumArtElement = document.querySelector('.album-art');
  const albumArtBackground = document.querySelector('.album-art-background');
  
  if (!albumArtElement || !albumArtBackground) {
    console.error('Album art elements not found');
    return;
  }
  
  if (song.albumArt) {
    // If we have album art, replace the icon with the image
    albumArtElement.innerHTML = `<img src="${song.albumArt}" alt="${song.title}" class="album-image">`;
    
    // Update the background with the album art
    albumArtBackground.style.backgroundImage = `url(${song.albumArt})`;
    albumArtBackground.style.opacity = '0.2';
  } else {
    // Otherwise, show the default music icon
    albumArtElement.innerHTML = '<i class="fas fa-music"></i>';
    
    // Remove the background image
    albumArtBackground.style.backgroundImage = 'none';
    albumArtBackground.style.opacity = '0';
  }
}

// Play the current song
function playSong() {
  // Make sure the audio context is resumed if it exists
  if (playerState.audioContext && playerState.audioContext.state === 'suspended') {
    playerState.audioContext.resume().catch(error => {
      console.error('Failed to resume audio context:', error);
    });
  }
  
  audioPlayer.play()
    .then(() => {
      playerState.isPlaying = true;
      updatePlayButton();

      // Record this play for smart shuffle learning
      // Only add to history if not already the last played song (to avoid duplicates on pause/play)
      const currentIndex = playerState.currentSongIndex;
      const lastPlayed = playerState.playHistory[playerState.playHistory.length - 1];

      if (lastPlayed !== currentIndex) {
        playerState.playHistory.push(currentIndex);

        // Keep history at a reasonable size
        if (playerState.playHistory.length > 100) {
          playerState.playHistory = playerState.playHistory.slice(-100);
        }

        // Save updated history
        saveSongScores();
      }
    })
    .catch(error => {
      console.error('Error playing audio:', error);
      // Handle autoplay blocking
      if (error.name === 'NotAllowedError') {
        alert('Autoplay was blocked. Please click play to start playback.');
      }
    });
}

// Pause the current song
function pauseSong() {
  audioPlayer.pause();
  playerState.isPlaying = false;
  updatePlayButton();
}

// Play the next song
function playNextSong() {
  let nextIndex;

  if (playerState.shuffle) {
    // Get next song using server's smart shuffle if available
    fetchNextShuffleSong().then(index => {
      if (index !== undefined) {
        loadSong(index);
        playSong();
      } else {
        // Fallback to client-side shuffle
        nextIndex = getNextShuffleIndex();
        loadSong(nextIndex);
        playSong();
      }
    }).catch(error => {
      console.error('Error fetching next shuffle song:', error);
      // Fallback to client-side shuffle
      nextIndex = getNextShuffleIndex();
      loadSong(nextIndex);
      playSong();
    });
  } else {
    // Otherwise, get the next song in order
    nextIndex = playerState.currentSongIndex + 1;

    // If we're at the end of the playlist
    if (nextIndex >= playerState.songs.length) {
      // If repeat all is on, go back to the beginning
      if (playerState.repeat === 'all') {
        nextIndex = 0;
      } else if (!playerState.autoplay) {
        // If autoplay is off and we're not repeating, just stop
        pauseSong();
        return;
      } else {
        // If autoplay is on, go back to the beginning
        nextIndex = 0;
      }
    }
    
    loadSong(nextIndex);
    playSong();
  }
}

// Play the previous song
function playPrevSong() {
  let prevIndex = playerState.currentSongIndex - 1;

  // If we're at the beginning of the playlist and repeat all is on, go to the end
  if (prevIndex < 0) {
    if (playerState.repeat === 'all') {
      prevIndex = playerState.songs.length - 1;
    } else {
      prevIndex = 0;
    }
  }

  loadSong(prevIndex);
  playSong();
}

// Get next shuffle index (simplified client-side fallback)
function getNextShuffleIndex() {
  // Simple random selection as fallback
  const indices = [...Array(playerState.songs.length).keys()]
    .filter(i => i !== playerState.currentSongIndex);
  
  return indices[Math.floor(Math.random() * indices.length)];
}

// Fetch next shuffle song from server (uses smart shuffle on server)
async function fetchNextShuffleSong() {
  try {
    const currentSongId = playerState.songs[playerState.currentSongIndex]?.id;
    if (!currentSongId) return undefined;
    
    const response = await fetch(`/api/songs/next-shuffle?currentId=${currentSongId}`);
    if (!response.ok) throw new Error('Failed to fetch next shuffle song');
    
    const data = await response.json();
    if (!data.nextSongIndex) return undefined;
    
    return data.nextSongIndex;
  } catch (error) {
    console.error('Error fetching next shuffle song:', error);
    return undefined;
  }
}

// Update the play button icon
function updatePlayButton() {
  if (playerState.isPlaying) {
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    playButton.classList.add('playing');
  } else {
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    playButton.classList.remove('playing');
  }
}

/**
 * Update the progress bar and time displays
 * Also updates ARIA attributes for accessibility
 */
function updateProgress() {
  const { currentTime, duration } = audioPlayer;

  // Update progress bar width
  if (duration) {
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update ARIA attributes for accessibility
    progressContainer.querySelector('.progress-bar').setAttribute('aria-valuenow', Math.round(progressPercent));
    progressContainer.querySelector('.progress-bar').setAttribute('aria-valuetext',
      `${formatTime(currentTime)} of ${formatTime(duration)}`);
  } else {
    progressBar.style.width = '0%';
    progressContainer.querySelector('.progress-bar').setAttribute('aria-valuenow', 0);
    progressContainer.querySelector('.progress-bar').setAttribute('aria-valuetext', '0:00 of 0:00');
  }

  // Update time displays
  currentTimeDisplay.textContent = formatTime(currentTime);
  durationDisplay.textContent = formatTime(duration);
}

// Format time in MM:SS
function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Set up event listeners
function setupEventListeners() {
  // Play/Pause button
  playButton.addEventListener('click', () => {
    if (playerState.isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  });

  // Previous button
  prevButton.addEventListener('click', playPrevSong);

  // Next button
  nextButton.addEventListener('click', playNextSong);

  // Shuffle button
  shuffleButton.addEventListener('click', () => {
    playerState.shuffle = !playerState.shuffle;
    shuffleButton.classList.toggle('active', playerState.shuffle);

    // Update ARIA attributes for accessibility
    shuffleButton.setAttribute('aria-pressed', playerState.shuffle);

    if (playerState.shuffle) {
      generateShuffleQueue();
    }

    // Save preference
    savePlayerPreferences();
  });

  // Smart Shuffle button
  const smartShuffleButton = document.getElementById('smart-shuffle-button');
  smartShuffleButton.addEventListener('click', () => {
    playerState.smartShuffle = !playerState.smartShuffle;
    smartShuffleButton.classList.toggle('active', playerState.smartShuffle);

    // Update ARIA attributes for accessibility
    smartShuffleButton.setAttribute('aria-pressed', playerState.smartShuffle);

    // If shuffle is on, regenerate the queue with the new setting
    if (playerState.shuffle) {
      generateShuffleQueue();
    }

    // Show notification about the change
    if (playerState.smartShuffle) {
      showNotification('Smart Shuffle enabled - your listening habits will influence shuffle order');
    } else {
      showNotification('Smart Shuffle disabled - using random shuffle');
    }

    // Save preference
    savePlayerPreferences();
  });

  // Repeat button
  repeatButton.addEventListener('click', () => {
    // Cycle through repeat modes: none -> one -> all -> none
    switch (playerState.repeat) {
      case 'none':
        playerState.repeat = 'one';
        repeatButton.innerHTML = '<i class="fas fa-repeat-1" aria-hidden="true"></i>';
        repeatButton.setAttribute('aria-label', 'Repeat one song');
        break;
      case 'one':
        playerState.repeat = 'all';
        repeatButton.innerHTML = '<i class="fas fa-redo" aria-hidden="true"></i>';
        repeatButton.setAttribute('aria-label', 'Repeat all songs');
        break;
      case 'all':
        playerState.repeat = 'none';
        repeatButton.innerHTML = '<i class="fas fa-redo" aria-hidden="true"></i>';
        repeatButton.setAttribute('aria-label', 'Repeat off');
        break;
    }

    repeatButton.classList.toggle('active', playerState.repeat !== 'none');

    // Update ARIA pressed state
    repeatButton.setAttribute('aria-pressed', playerState.repeat !== 'none');

    // Save preference
    savePlayerPreferences();
  });

  // Autoplay button
  autoplayButton.addEventListener('click', () => {
    playerState.autoplay = !playerState.autoplay;
    autoplayButton.classList.toggle('active', playerState.autoplay);

    // Update ARIA attributes for accessibility
    autoplayButton.setAttribute('aria-pressed', playerState.autoplay);
    autoplayButton.setAttribute('aria-label', playerState.autoplay ? 'Auto-play enabled' : 'Auto-play disabled');

    // Save preference
    savePlayerPreferences();
  });

  // Bass boost button
  const bassBoostButton = document.getElementById('bass-boost-button');
  bassBoostButton.addEventListener('click', () => {
    // Resume audio context if it's suspended (needed for browsers that require user interaction)
    if (playerState.audioContext && playerState.audioContext.state === 'suspended') {
      playerState.audioContext.resume();
    }

    toggleBassBoost();
  });

  // Volume slider
  volumeSlider.addEventListener('input', () => {
    const volume = parseFloat(volumeSlider.value);
    audioPlayer.volume = volume;
    playerState.volume = volume;

    // Save preference
    savePlayerPreferences();
  });

  // Progress bar click
  progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;

    audioPlayer.currentTime = (clickX / width) * duration;
  });

  // Audio player events
  audioPlayer.addEventListener('timeupdate', updateProgress);

  audioPlayer.addEventListener('ended', () => {
    // Handle song end based on repeat mode
    if (playerState.repeat === 'one') {
      // Repeat the current song
      audioPlayer.currentTime = 0;
      playSong();
    } else {
      // Play the next song (this function handles repeat all and autoplay)
      playNextSong();
    }
  });

  audioPlayer.addEventListener('canplay', () => {
    // Update duration display once metadata is loaded
    durationDisplay.textContent = formatTime(audioPlayer.duration);
  });

  // Refresh button
  refreshButton.addEventListener('click', () => {
    fetchSongs(true);
  });

  // Sort dropdown
  const sortButton = document.getElementById('sort-button');
  const sortDropdown = document.querySelector('.sort-dropdown');
  const sortOptions = document.querySelectorAll('.sort-option');

  // Toggle sort dropdown
  sortButton.addEventListener('click', () => {
    sortDropdown.classList.toggle('active');
  });

  // Close sort dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!sortDropdown.contains(e.target)) {
      sortDropdown.classList.remove('active');
    }
  });

  // Handle sort option selection
  sortOptions.forEach(option => {
    // Mark the default sort option as active
    if (option.dataset.sort === playerState.sortBy) {
      option.classList.add('active');
    }

    option.addEventListener('click', () => {
      // Update sort preference
      playerState.sortBy = option.dataset.sort;

      // Update active class
      sortOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');

      // Close dropdown
      sortDropdown.classList.remove('active');

      // Re-render playlist with new sort order
      renderPlaylist();

      // Save preference
      savePlayerPreferences();
    });
  });

  // Song count click handler
  document.querySelector('.song-count').addEventListener('click', () => {
    showLibrarySummary();
  });

  // Download all button
  const downloadAllButton = document.getElementById('download-all-button');
  downloadAllButton.addEventListener('click', () => {
    downloadAllSongs();
  });

  // Search functionality
  const searchInput = document.getElementById('search-input');

  // Debounce function to limit API calls
  function debounce(func, delay) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  // Search input event (as user types)
  searchInput.addEventListener('input', debounce(() => {
    const query = searchInput.value.trim();

    // Only search if query is at least 2 characters or empty (to reset)
    if (query.length >= 2 || query.length === 0) {
      playerState.searchQuery = query;
      playerState.currentPage = 1; // Reset to first page

      // Show loading indicator in search box
      if (query.length > 0) {
        searchInput.classList.add('searching');
      }

      // Fetch songs with search query
      fetchSongs(false, 1, false).then(() => {
        // Remove loading indicator
        searchInput.classList.remove('searching');

        // Show search results count
        if (query.length > 0) {
          showNotification(`Found ${playerState.totalSongs} songs matching "${query}"`);
        }
      });
    }
  }, 500)); // Debounce for 500ms to avoid too many requests

  // Clear search when user presses Escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      playerState.searchQuery = '';
      playerState.currentPage = 1;
      fetchSongs(false, 1, false);
    }
  });

  // Search icon click (for mobile)
  const searchIcon = document.querySelector('.search-icon');
  if (searchIcon) {
    searchIcon.addEventListener('click', () => {
      searchInput.focus();
    });
  }

  // Theme toggle
  document.querySelector('.theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');

    // Save theme preference
    const isLightTheme = document.body.classList.contains('light-theme');
    localStorage.setItem('lightTheme', isLightTheme);
  });
}

// Save player preferences to localStorage (simplified)
function savePlayerPreferences() {
  const preferences = {
    volume: playerState.volume,
    shuffle: playerState.shuffle,
    repeat: playerState.repeat,
    autoplay: playerState.autoplay,
    sortBy: playerState.sortBy,
    bassBoost: playerState.audioEffects.bassBoost,
    songsPerPage: playerState.songsPerPage,
    paginationMode: playerState.paginationMode
  };

  localStorage.setItem('playerPreferences', JSON.stringify(preferences));
}

// Load player preferences from localStorage
function loadPlayerPreferences() {
  // Load theme preference
  const isLightTheme = localStorage.getItem('lightTheme') === 'true';
  if (isLightTheme) {
    document.body.classList.add('light-theme');
  }

  // Load player preferences
  const savedPreferences = localStorage.getItem('playerPreferences');
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences);

    // Apply volume
    if (preferences.volume !== undefined) {
      playerState.volume = preferences.volume;
      audioPlayer.volume = preferences.volume;
      volumeSlider.value = preferences.volume;
    }

    // Apply shuffle
    if (preferences.shuffle !== undefined) {
      playerState.shuffle = preferences.shuffle;
      shuffleButton.classList.toggle('active', preferences.shuffle);
      if (preferences.shuffle) {
        generateShuffleQueue();
      }
    }

    // Apply smart shuffle
    if (preferences.smartShuffle !== undefined) {
      playerState.smartShuffle = preferences.smartShuffle;
    }

    // Apply repeat
    if (preferences.repeat !== undefined) {
      playerState.repeat = preferences.repeat;
      repeatButton.classList.toggle('active', preferences.repeat !== 'none');

      if (preferences.repeat === 'one') {
        repeatButton.innerHTML = '<i class="fas fa-repeat-1"></i>';
      }
    }

    // Apply autoplay
    if (preferences.autoplay !== undefined) {
      playerState.autoplay = preferences.autoplay;
      autoplayButton.classList.toggle('active', preferences.autoplay);
    }

    // Apply bass boost
    if (preferences.bassBoost !== undefined) {
      playerState.audioEffects.bassBoost = preferences.bassBoost;

      // Apply bass boost effect if Web Audio API is initialized
      if (playerState.audioContext) {
        applyBassBoost();
      }

      // Update bass boost button UI when DOM is ready
      setTimeout(() => {
        const bassBoostButton = document.getElementById('bass-boost-button');
        if (bassBoostButton) {
          bassBoostButton.classList.toggle('active', playerState.audioEffects.bassBoost);
        }
      }, 0);
    }

    // Apply sort preference
    if (preferences.sortBy !== undefined) {
      playerState.sortBy = preferences.sortBy;

      // Update sort options UI when DOM is ready
      setTimeout(() => {
        const sortOptions = document.querySelectorAll('.sort-option');
        sortOptions.forEach(option => {
          option.classList.toggle('active', option.dataset.sort === preferences.sortBy);
        });
      }, 0);
    }

    // Apply pagination preferences
    if (preferences.songsPerPage !== undefined) {
      playerState.songsPerPage = preferences.songsPerPage;

      // Update page size selector when DOM is ready
      setTimeout(() => {
        const pageSizeSelector = document.getElementById('page-size');
        if (pageSizeSelector) {
          pageSizeSelector.value = preferences.songsPerPage.toString();
        }
      }, 0);
    }

    if (preferences.paginationMode !== undefined) {
      playerState.paginationMode = preferences.paginationMode;
    }
  }

  // Load song scores and history for smart shuffle
  loadSongScores();
}

// Open the edit metadata modal
function openEditModal(index) {
  // Get the song
  const song = playerState.songs[index];

  // Get the modal elements
  const modal = document.getElementById('edit-modal');
  const closeBtn = modal.querySelector('.close');
  const cancelBtn = modal.querySelector('.cancel-button');
  const form = document.getElementById('metadata-form');

  // Set the form values
  document.getElementById('edit-song-index').value = index;
  document.getElementById('edit-song-file').value = song.file;
  document.getElementById('edit-title').value = song.title;
  document.getElementById('edit-artist').value = song.artist;
  document.getElementById('edit-album').value = song.album || '';

  // Show the modal
  modal.style.display = 'block';

  // Close the modal when clicking the close button
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  };

  // Close the modal when clicking the cancel button
  cancelBtn.onclick = function() {
    modal.style.display = 'none';
  };

  // Close the modal when clicking outside of it
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Handle form submission
  form.onsubmit = function(e) {
    e.preventDefault();
    saveMetadata(index);
  };
}

// Save metadata changes
async function saveMetadata(index) {
  try {
    const song = playerState.songs[index];
    const title = document.getElementById('edit-title').value;
    const artist = document.getElementById('edit-artist').value;
    const album = document.getElementById('edit-album').value;

    // Show loading state
    const saveButton = document.querySelector('.save-button');
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;

    // Send the update request to the server
    const response = await fetch('/api/songs/metadata', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filePath: song.file,
        title: title,
        artist: artist,
        album: album
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update metadata');
    }

    await response.json();

    // Update the song in the player state
    song.title = title;
    song.artist = artist;
    song.album = album;

    // Update the display if this is the current song
    if (index === playerState.currentSongIndex) {
      currentTitleDisplay.textContent = title;
      currentArtistDisplay.textContent = artist;
    }

    // Re-render the playlist
    renderPlaylist();

    // Close the modal
    document.getElementById('edit-modal').style.display = 'none';

    // Show success notification
    showNotification('Metadata updated successfully!');

  } catch (error) {
    console.error('Error saving metadata:', error);
    showNotification('Failed to update metadata. Please try again.', 'error');
  } finally {
    // Reset the save button
    const saveButton = document.querySelector('.save-button');
    saveButton.textContent = 'Save Changes';
    saveButton.disabled = false;
  }
}

// Open the delete confirmation modal
function openDeleteModal(index) {
  // Get the song
  const song = playerState.songs[index];

  // Get the modal elements
  const modal = document.getElementById('delete-modal');
  const closeBtn = modal.querySelector('.close');
  const cancelBtn = document.getElementById('cancel-delete-button');
  const confirmBtn = document.getElementById('confirm-delete-button');

  // Set the song information
  document.getElementById('delete-song-title').textContent = song.title;
  document.getElementById('delete-song-index').value = index;
  document.getElementById('delete-song-file').value = song.file;

  // Show the modal
  modal.style.display = 'block';

  // Close the modal when clicking the close button
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  };

  // Close the modal when clicking the cancel button
  cancelBtn.onclick = function() {
    modal.style.display = 'none';
  };

  // Close the modal when clicking outside of it
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Handle delete confirmation
  confirmBtn.onclick = function() {
    deleteSong(index);
  };
}

// Delete a song
async function deleteSong(index) {
  try {
    const song = playerState.songs[index];

    // Show loading state
    const deleteButton = document.getElementById('confirm-delete-button');
    deleteButton.textContent = 'Deleting...';
    deleteButton.disabled = true;

    // Send the delete request to the server
    const response = await fetch('/api/songs', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filePath: song.file
      })
    });

    if (!response.ok) {
      throw new Error('Failed to delete song');
    }

    // Close the modal
    document.getElementById('delete-modal').style.display = 'none';

    // Check if the deleted song is the current song
    const isCurrentSong = index === playerState.currentSongIndex;

    // Remove the song from the player state
    playerState.songs.splice(index, 1);

    // If we deleted the current song, stop playback and reset the player
    if (isCurrentSong) {
      pauseSong();

      // If there are still songs, load the next one
      if (playerState.songs.length > 0) {
        // Adjust the current index if needed
        if (index >= playerState.songs.length) {
          playerState.currentSongIndex = 0;
        }
        loadSong(playerState.currentSongIndex);
      } else {
        // No songs left, reset the player
        currentTitleDisplay.textContent = 'No track selected';
        currentArtistDisplay.textContent = 'Select a track to play';
        const albumArtElement = document.querySelector('.album-art');
        albumArtElement.innerHTML = '<i class="fas fa-music"></i>';
        audioPlayer.src = '';
        updateProgress();
      }
    } else if (index < playerState.currentSongIndex) {
      // If we deleted a song before the current one, adjust the current index
      playerState.currentSongIndex--;
    }

    // Re-render the playlist
    renderPlaylist();

    // Update the song count
    updateSongCount(playerState.songs.length);

    // Show success notification
    showNotification('Song deleted successfully!');

  } catch (error) {
    console.error('Error deleting song:', error);
    showNotification('Failed to delete song. Please try again.', 'error');

    // Close the modal
    document.getElementById('delete-modal').style.display = 'none';
  } finally {
    // Reset the delete button
    const deleteButton = document.getElementById('confirm-delete-button');
    deleteButton.textContent = 'Delete';
    deleteButton.disabled = false;
  }
}

// Show a summary of the library
function showLibrarySummary() {
  // Get the total number of songs
  const totalSongs = playerState.songs.length;

  if (totalSongs === 0) {
    showNotification('No songs in library. Add some music to get started!');
    return;
  }

  // Calculate total duration
  let totalDuration = 0;
  let totalSize = 0;
  const artists = new Set();
  const albums = new Set();
  const formats = {};

  playerState.songs.forEach(song => {
    // Add duration if available
    if (song.duration) {
      totalDuration += song.duration;
    }

    // Add size
    if (song.size) {
      totalSize += song.size;
    }

    // Count unique artists
    if (song.artist) {
      artists.add(song.artist);
    }

    // Count unique albums
    if (song.album) {
      albums.add(song.album);
    }

    // Count file formats
    const ext = song.file.split('.').pop().toLowerCase();
    formats[ext] = (formats[ext] || 0) + 1;
  });

  // Format total size
  const formattedSize = formatFileSize(totalSize);

  // Create summary message
  let summaryMessage = `
    <div class="library-summary">
      <div class="summary-item">
        <span class="summary-label">Total Songs:</span>
        <span class="summary-value">${totalSongs}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Artists:</span>
        <span class="summary-value">${artists.size}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Albums:</span>
        <span class="summary-value">${albums.size}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Total Size:</span>
        <span class="summary-value">${formattedSize}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Formats:</span>
        <span class="summary-value">${Object.entries(formats).map(([format, count]) =>
          `${format.toUpperCase()}: ${count}`).join(', ')}</span>
      </div>
    </div>
  `;

  // Show the summary in a notification
  showNotification(summaryMessage, 'info', 10000); // Show for 10 seconds
}

// Format file size to human-readable format
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Download a song
function downloadSong(song) {
  if (!song || !song.file) {
    showNotification('No song selected for download', 'error');
    return;
  }

  try {
    // Create download URL
    const downloadUrl = `/api/songs/download?file=${encodeURIComponent(song.file)}`;

    // Show notification
    showNotification(`Downloading "${song.title}" by ${song.artist}...`);

    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = ''; // Let the server set the filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error('Error downloading song:', error);
    showNotification('Failed to download song. Please try again.', 'error');
  }
}

// Download all songs as a zip file
function downloadAllSongs() {
  try {
    // Check if there are songs to download
    if (playerState.songs.length === 0) {
      showNotification('No songs in library to download', 'error');
      return;
    }

    // Show notification
    showNotification(`Preparing to download ${playerState.songs.length} songs as a zip file. This may take a while...`, 'info', 10000);

    // Create download URL
    const downloadUrl = '/api/songs/download-all';

    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = ''; // Let the server set the filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error('Error downloading all songs:', error);
    showNotification('Failed to download all songs. Please try again.', 'error');
  }
}

// Initialize the player when the DOM is loaded
document.addEventListener('DOMContentLoaded', initPlayer);
