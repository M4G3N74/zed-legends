// ElevenLabs Voice Service with persistent caching
class ElevenLabsVoice {
  constructor() {
    this.memoryCache = new Map();
    this.persistentCache = {};
    this.isPlaying = false;
    this.currentAudio = null;
    
    // Load cache from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedCache = localStorage.getItem('voiceCache');
        if (savedCache) {
          this.persistentCache = JSON.parse(savedCache);
        }
      } catch (error) {
        console.error('Error loading voice cache:', error);
      }
    }
  }
  
  // Helper method to create MD5 hash
  async createMD5Hash(text) {
    // Use SubtleCrypto API in browser
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for environments without SubtleCrypto
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  async generateVoice(text, voiceId = 'EXAVITQu4vr4xnSDxMaL') {
    // Check memory cache first (for current session)
    const cacheKey = `${voiceId}-${text}`;
    if (this.memoryCache.has(cacheKey)) {
      console.log('Using memory cache for:', text);
      return this.memoryCache.get(cacheKey);
    }
    
    // Check persistent cache
    if (this.persistentCache[cacheKey]) {
      console.log('Using persistent cache for:', text);
      return this.persistentCache[cacheKey];
    }

    try {
      console.log('Generating new voice for:', text);
      // Use the Supabase API endpoint for persistent caching
      const response = await fetch('/api/voice-cache-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          voiceId
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store in both memory cache and persistent cache
        this.memoryCache.set(cacheKey, data.url);
        this.persistentCache[cacheKey] = data.url;
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('voiceCache', JSON.stringify(this.persistentCache));
        }
        
        console.log('Voice cached:', data.cached ? 'from server cache' : 'newly generated');
        console.log('Voice URL:', data.url);
        return data.url;
      }
    } catch (error) {
      console.error('Voice generation error:', error);
    }
    
    return null;
  }

  async playAudio(audioUrl) {
    if (!audioUrl) {
      console.error('No audio URL provided');
      return;
    }
    
    // If already playing, stop the current audio
    if (this.isPlaying && this.currentAudio) {
      console.log('Stopping current audio before playing new one');
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
      this.isPlaying = false;
    }
    
    // Prevent multiple simultaneous playbacks of the same URL
    if (this.isPlaying) {
      console.log('Already playing audio, skipping new request');
      return;
    }
    
    console.log('Playing audio from URL:', audioUrl);
    this.isPlaying = true;
    
    try {
      // Create and configure audio element
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      audio.volume = 0.7;
      
      // Add error handler for loading errors
      audio.onerror = (e) => {
        console.error('Audio loading error:', e);
        this.isPlaying = false;
        this.currentAudio = null;
      };
      
      // Add load handler to confirm audio is loaded
      audio.onloadeddata = () => {
        console.log('Audio loaded successfully');
      };
      
      // Ensure audio context is resumed (needed for some browsers)
      if (window.audioContext && window.audioContext.state === 'suspended') {
        await window.audioContext.resume();
      }
      
      return new Promise((resolve) => {
        // Set a timeout in case the audio doesn't play or end properly
        const timeoutId = setTimeout(() => {
          console.log('Audio playback timed out, resolving anyway');
          this.isPlaying = false;
          this.currentAudio = null;
          resolve();
        }, 10000); // 10 second timeout
        
        audio.onended = () => {
          console.log('Audio playback completed');
          clearTimeout(timeoutId);
          this.isPlaying = false;
          this.currentAudio = null;
          resolve();
        };
        
        // Play the audio
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Audio playback error:', error);
            clearTimeout(timeoutId);
            this.isPlaying = false;
            this.currentAudio = null;
            resolve();
          });
        }
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      this.isPlaying = false;
      this.currentAudio = null;
    }
  }
}

export default new ElevenLabsVoice();