import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/SimplePlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { useDJ } from '../context/DJContext';
import AIVoiceService from './AIVoiceService';
import { DJ_MESSAGES, SONG_INTRO_MESSAGES } from '../../lib/constants/djMessages';
import { GENERIC_DJ_MESSAGES } from '../../lib/constants/genericDjMessages';
import { DJ_SPEAK_MODES } from '../../lib/constants/djConstants';
import { formatWithPronunciation } from '../../lib/constants/pronunciationGuide';
import Link from 'next/link';

export default function DJPurple() {
  const { currentSong, playSong, pauseSong, isPlaying, userHasInteracted } = usePlayer();
  const { songs } = useLibrary();
  const [djMode, setDjMode] = useState(false);
  const [djMessage, setDjMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // Always enabled by default
  const { djControlMode, setDjControlMode } = useDJ();
  const djIntervalRef = useRef(null);
  const wasPlayingRef = useRef(false);
  const lastAnnouncementRef = useRef(0); // Track when the last announcement was made
  const trackCounterRef = useRef(0); // Count tracks played since last DJ announcement
  const nextSpeakThresholdRef = useRef(3); // Number of tracks to wait before next announcement
  const userSkippedDjRef = useRef(false); // Track if user skipped during DJ announcement
  const [djSpeakMode, setDjSpeakMode] = useState(DJ_SPEAK_MODES.BOOKENDS); // Default to bookends mode
  const [djPersistent, setDjPersistent] = useState(false); // Whether DJ can be stopped
  const [djStartOnAudio, setDjStartOnAudio] = useState(false); // Whether DJ starts automatically on audio playback
  const [djUseCachedVoices, setDjUseCachedVoices] = useState(true); // Whether to use cached voices
  const [cachedMessages, setCachedMessages] = useState([]); // Cached DJ messages
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if voice is currently speaking

  // Initialize DJ mode from localStorage on component mount
  useEffect(() => {
    // Check if we're in production and if DJ is enabled in production
    const isProduction = process.env.NODE_ENV === 'production';
    const djEnabledInProd = process.env.NEXT_PUBLIC_DJ_ENABLED_IN_PROD === 'true';
    
    // Don't start DJ in production unless explicitly enabled
    if (isProduction && !djEnabledInProd) {
      console.log('DJ disabled in production environment');
      return;
    }
    
    const savedDjMode = localStorage.getItem('djMode') === 'true';
    if (savedDjMode) {
      setDjMode(true);
      setDjControlMode(true);
    }
    
    // Listen for audio playback events to detect when browser allows audio
    const handleAudioPlay = () => {
      if (!djMode && process.env.NEXT_PUBLIC_DJ_START_ON_AUDIO === 'true') {
        // Check production setting again
        if (isProduction && !djEnabledInProd) {
          console.log('DJ auto-start on audio disabled in production');
          return;
        }
        console.log('Audio playback detected, starting DJ automatically');
        startDJMode();
      }
    };
    
    // Listen for user skipping during DJ announcement
    const handleSkip = () => {
      if (isSpeaking) {
        console.log('User skipped during DJ announcement');
        userSkippedDjRef.current = true;
      }
    };
    
    document.addEventListener('play', handleAudioPlay, true);
    document.addEventListener('click', handleSkip, true);
    
    return () => {
      document.removeEventListener('play', handleAudioPlay, true);
      document.removeEventListener('click', handleSkip, true);
    };
  }, [djMode, isSpeaking]);
  
  // Start DJ automatically when user interaction is detected
  useEffect(() => {
    if (userHasInteracted && !djMode && djStartOnAudio) {
      console.log('User interaction detected, starting DJ automatically');
      startDJMode();
    }
  }, [userHasInteracted, djMode, djStartOnAudio]);
  
  // Load user profile and pronunciations
  useEffect(() => {
    // Load DJ profile
    const profile = localStorage.getItem('djPurpleProfile');
    if (profile) {
      setUserProfile(JSON.parse(profile));
    } else {
      const newProfile = {
        favoriteGenres: [],
        favoriteArtists: [],
        listeningTimes: [],
        skipPatterns: [],
        moodPreferences: {},
        lastUpdated: Date.now()
      };
      setUserProfile(newProfile);
      localStorage.setItem('djPurpleProfile', JSON.stringify(newProfile));
    }
    
    // Load DJ speak mode from environment variable
    const envSpeakMode = process.env.NEXT_PUBLIC_DJ_SPEAK_MODE;
    if (envSpeakMode) {
      // Validate that the mode is valid
      if (Object.values(DJ_SPEAK_MODES).includes(envSpeakMode)) {
        setDjSpeakMode(envSpeakMode);
        console.log('DJ speak mode set to:', envSpeakMode);
      } else {
        console.warn('Invalid DJ speak mode in environment variable:', envSpeakMode);
        console.warn('Using default mode:', DJ_SPEAK_MODES.BOOKENDS);
      }
    }
    
    // Check if DJ is persistent (can't be stopped)
    const djPersistentSetting = process.env.NEXT_PUBLIC_DJ_PERSISTENT === 'true';
    setDjPersistent(djPersistentSetting);
    console.log('DJ persistent mode:', djPersistentSetting);
    
    // Check if DJ should start automatically on audio playback
    const djStartOnAudioSetting = process.env.NEXT_PUBLIC_DJ_START_ON_AUDIO === 'true';
    setDjStartOnAudio(djStartOnAudioSetting);
    console.log('DJ start on audio mode:', djStartOnAudioSetting);
    
    // Check if DJ should use cached voices
    const djUseCachedVoicesSetting = process.env.NEXT_PUBLIC_DJ_USE_CACHED_VOICES === 'true';
    setDjUseCachedVoices(djUseCachedVoicesSetting);
    console.log('DJ use cached voices mode:', djUseCachedVoicesSetting);
    
    // Set initial random threshold for next DJ announcement
    nextSpeakThresholdRef.current = Math.floor(Math.random() * 2) + 3; // 3-4 tracks initially
    console.log('DJ will speak after', nextSpeakThresholdRef.current, 'tracks');
    
    // Load user interaction data
    try {
      const djInteractionData = localStorage.getItem('djInteractionData');
      if (djInteractionData) {
        const data = JSON.parse(djInteractionData);
        if (data.skipCount > 0) {
          // If user has skipped DJ announcements before, speak less frequently
          nextSpeakThresholdRef.current = Math.floor(Math.random() * 3) + 4; // 4-6 tracks
          console.log('User has skipped DJ before, adjusted to speak after', nextSpeakThresholdRef.current, 'tracks');
        }
      } else {
        // Initialize interaction data
        localStorage.setItem('djInteractionData', JSON.stringify({
          skipCount: 0,
          listenCount: 0
        }));
      }
    } catch (error) {
      console.error('Error loading DJ interaction data:', error);
    }
    
    // Pre-cache generic DJ messages if using cached voices
    const preCacheMessages = async () => {
      if (!djUseCachedVoicesSetting) {
        console.log('Skipping DJ message pre-caching (disabled in settings)');
        return;
      }
      
      console.log('Pre-caching generic DJ messages');
      const cachedUrls = [];
      
      // Get number of messages to cache from environment variable
      const cacheCount = parseInt(process.env.NEXT_PUBLIC_DJ_CACHED_MESSAGES_COUNT || '3', 10);
      
      // Cache random messages to save API calls
      const messagesToCache = [...GENERIC_DJ_MESSAGES]
        .sort(() => 0.5 - Math.random())
        .slice(0, cacheCount);
      
      for (const message of messagesToCache) {
        try {
          const audioUrl = await AIVoiceService.generateVoice(message, 'EXAVITQu4vr4xnSDxMaL');
          if (audioUrl) {
            cachedUrls.push({ message, audioUrl });
          }
        } catch (error) {
          console.error('Failed to cache message:', error);
        }
      }
      
      setCachedMessages(cachedUrls);
      console.log(`Successfully cached ${cachedUrls.length} DJ messages`);
    };
    
    // Start pre-caching messages
    preCacheMessages();
    
    // Load dynamic pronunciations
    import('../../lib/constants/pronunciationGuide')
      .then(module => {
        module.loadDynamicPronunciations();
      })
      .catch(error => {
        console.error('Failed to load pronunciation module:', error);
      });
  }, []);

  // Smart song recommendation based on user behavior
  const getSmartRecommendation = () => {
    if (!songs || songs.length === 0 || !userProfile) return null;

    const playHistory = JSON.parse(localStorage.getItem('playHistory') || '[]');
    const skipHistory = JSON.parse(localStorage.getItem('skipHistory') || '[]');
    const likeHistory = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    const currentHour = new Date().getHours();

    // Score songs based on multiple factors
    const scoredSongs = songs.map(song => {
      let score = Math.random() * 0.3; // Base randomness

      // Boost score for previously played songs (but not recently)
      if (playHistory.includes(song.id) && playHistory.slice(-10).indexOf(song.id) === -1) {
        score += 0.4;
      }

      // Reduce score for recently skipped songs
      if (skipHistory.slice(-20).includes(song.id)) {
        score -= 0.3;
      }
      
      // Boost score for liked songs
      if (likeHistory.includes(song.id)) {
        score += 0.5;
      }

      // Time-based preferences
      if (userProfile.listeningTimes[currentHour]) {
        const timePrefs = userProfile.listeningTimes[currentHour];
        if (timePrefs.artists.includes(song.artist)) score += 0.2;
        if (timePrefs.genres && song.genre && timePrefs.genres.includes(song.genre)) score += 0.2;
      }

      // Artist preference
      if (userProfile.favoriteArtists.includes(song.artist)) {
        score += 0.3;
      }

      // Avoid current song and recently played songs
      if (currentSong && song.id === currentSong.id) {
        score = 0;
      }
      
      // Avoid the last 3 played songs to prevent repetition
      if (playHistory.slice(-3).includes(song.id)) {
        score = 0;
      }

      return { song, score };
    });

    // Sort by score and return top recommendation
    scoredSongs.sort((a, b) => b.score - a.score);
    return scoredSongs[0]?.song || null;
  };

  // Update user profile based on interactions
  const updateUserProfile = (action, songData) => {
    if (!userProfile) return;

    const updatedProfile = { ...userProfile };
    const currentHour = new Date().getHours();

    switch (action) {
      case 'play':
        // Track favorite artists
        if (!updatedProfile.favoriteArtists.includes(songData.artist)) {
          updatedProfile.favoriteArtists.push(songData.artist);
        }

        // Track listening times
        if (!updatedProfile.listeningTimes[currentHour]) {
          updatedProfile.listeningTimes[currentHour] = { artists: [], count: 0 };
        }
        updatedProfile.listeningTimes[currentHour].count++;
        if (!updatedProfile.listeningTimes[currentHour].artists.includes(songData.artist)) {
          updatedProfile.listeningTimes[currentHour].artists.push(songData.artist);
        }
        break;

      case 'skip':
        // Track skip patterns
        updatedProfile.skipPatterns.push({
          artist: songData.artist,
          hour: currentHour,
          timestamp: Date.now()
        });
        // Keep only recent skip patterns
        updatedProfile.skipPatterns = updatedProfile.skipPatterns.slice(-100);
        break;
    }

    updatedProfile.lastUpdated = Date.now();
    setUserProfile(updatedProfile);
    localStorage.setItem('djPurpleProfile', JSON.stringify(updatedProfile));
  };

  // Track if voice is currently speaking - moved to top level
  
  // Check if we should allow the DJ to speak based on current playback position and track count
  const shouldAllowDjToSpeak = () => {
    // Check if we've reached the track threshold for speaking
    if (trackCounterRef.current < nextSpeakThresholdRef.current) {
      console.log(`DJ speak check: Track counter ${trackCounterRef.current}/${nextSpeakThresholdRef.current} - not speaking yet`);
      return false;
    }
    
    // If not in bookends mode, always allow speaking
    if (djSpeakMode !== DJ_SPEAK_MODES.BOOKENDS) return true;
    
    // Get the audio element
    const audioElement = document.querySelector('audio');
    if (!audioElement) return true; // If no audio element found, default to allowing speech
    
    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;
    
    // Only speak if we're at the beginning (first 10 seconds) or end (last 20 seconds) of the track
    const isAtBeginning = currentTime <= 10;
    const isAtEnd = duration && (duration - currentTime <= 20);
    
    console.log(`DJ speak check: Time=${currentTime.toFixed(1)}s, Duration=${duration?.toFixed(1)}s, At beginning=${isAtBeginning}, At end=${isAtEnd}`);
    
    return isAtBeginning || isAtEnd;
  };
  
  // Reset the track counter and set a new random threshold based on user behavior
  const resetTrackCounter = () => {
    trackCounterRef.current = 0;
    
    try {
      // Load interaction data
      const djInteractionData = localStorage.getItem('djInteractionData');
      if (djInteractionData) {
        const data = JSON.parse(djInteractionData);
        
        // Calculate speak frequency based on skip ratio
        const totalInteractions = data.skipCount + data.listenCount;
        if (totalInteractions > 0) {
          const skipRatio = data.skipCount / totalInteractions;
          
          // Adjust threshold based on skip ratio
          let baseFrequency = 3; // Default
          if (skipRatio > 0.5) {
            // User skips often, speak less frequently
            baseFrequency = 6;
          } else if (skipRatio > 0.2) {
            // User skips sometimes
            baseFrequency = 4;
          }
          
          // Add randomness
          nextSpeakThresholdRef.current = Math.floor(Math.random() * 3) + baseFrequency;
        } else {
          // No data yet, use default
          nextSpeakThresholdRef.current = Math.floor(Math.random() * 2) + 3;
        }
      } else {
        // No data, use default
        nextSpeakThresholdRef.current = Math.floor(Math.random() * 2) + 3;
      }
    } catch (error) {
      console.error('Error calculating DJ speak frequency:', error);
      // Fallback to default
      nextSpeakThresholdRef.current = Math.floor(Math.random() * 2) + 3;
    }
    
    console.log('DJ will speak again after', nextSpeakThresholdRef.current, 'tracks');
  };

  // Track when user skips during DJ announcement
  const trackUserSkip = (skipped) => {
    try {
      const djInteractionData = localStorage.getItem('djInteractionData');
      if (djInteractionData) {
        const data = JSON.parse(djInteractionData);
        if (skipped) {
          data.skipCount++;
          console.log('User skipped during DJ announcement, new skip count:', data.skipCount);
        } else {
          data.listenCount++;
          console.log('User listened to DJ announcement, new listen count:', data.listenCount);
        }
        localStorage.setItem('djInteractionData', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error tracking DJ interaction:', error);
    }
  };
  
  // Play cached audio with proper state management
  const playCachedAudio = async (audioUrl) => {
    if (!voiceEnabled || isSpeaking) return;
    
    // Check if we should allow the DJ to speak based on current playback position and track count
    if (!shouldAllowDjToSpeak()) {
      console.log('DJ speech skipped: conditions not met');
      return;
    }
    
    // Reset track counter after speaking
    resetTrackCounter();
    
    // Track if user was listening at start of announcement
    const startTime = Date.now();
    userSkippedDjRef.current = false;
    
    // Store current playing state
    wasPlayingRef.current = isPlaying;
    console.log('Was playing before DJ spoke:', wasPlayingRef.current);
    
    // Pause music if it's playing
    if (isPlaying) {
      console.log('Pausing music for DJ announcement');
      pauseSong();
    }
    
    setIsSpeaking(true);
    
    try {
      console.log('Playing cached audio');
      await AIVoiceService.playAudio(audioUrl);
    } catch (error) {
      console.error('Audio playback failed:', error);
    } finally {
      setIsSpeaking(false);
      
      // Check if user skipped during announcement
      const announcementDuration = Date.now() - startTime;
      const userListened = announcementDuration > 2000 && !userSkippedDjRef.current;
      trackUserSkip(!userListened);
      
      // Resume music if it was playing before
      console.log('DJ finished speaking, resuming music:', wasPlayingRef.current);
      setTimeout(() => {
        if (wasPlayingRef.current) {
          console.log('Resuming music playback');
          playSong();
        }
      }, 500); // Small delay to ensure audio contexts don't conflict
    }
  };
  
  // Function to get a random cached message and its audio URL
  const getRandomCachedMessage = () => {
    if (cachedMessages.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * cachedMessages.length);
    return cachedMessages[randomIndex];
  };

  // DJ Messages based on context with personality
  const getDJMessage = () => {
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21 || hour < 6) timeOfDay = 'night';

    const timeMessages = DJ_MESSAGES[timeOfDay];
    const message = timeMessages[Math.floor(Math.random() * timeMessages.length)];
    
    // Add occasional DJ catchphrases
    const catchphrases = [
      "",
      " Let's keep the music flowing!",
      " We're just getting started!",
      " The beat doesn't stop!",
      " Music is life, am I right?"
    ];
    
    return message + (Math.random() > 0.7 ? catchphrases[Math.floor(Math.random() * catchphrases.length)] : "");
  };

  // DJ song introductions with personality, context, and proper pronunciation
  const getSongIntro = (song) => {
    const intro = SONG_INTRO_MESSAGES[Math.floor(Math.random() * SONG_INTRO_MESSAGES.length)];
    
    // Apply pronunciation guide to the song intro
    const baseIntro = formatWithPronunciation(
      intro(song),
      song.artist,
      song.title
    );
    
    // DJ personality additions
    const djPhrases = [
      "",
      " That's how we do it!",
      " You know the vibes!",
      " This is what I'm talking about!",
      " DJ Purple approved!",
      " Let me know if you're feeling this!",
      " This is my jam right here!"
    ];
    
    // Add time context occasionally
    const hour = new Date().getHours();
    if (Math.random() > 0.6) {
      let timeContext = "";
      if (hour >= 5 && hour < 12) {
        timeContext = "Perfect morning energy right here!"; 
      } else if (hour >= 12 && hour < 17) {
        timeContext = "This is how we do afternoons!"; 
      } else if (hour >= 17 && hour < 21) {
        timeContext = "Evening vibes on point with this one!"; 
      } else {
        timeContext = "Late night session getting real with this track!"; 
      }
      
      return `${baseIntro} ${timeContext}`;
    }
    
    // Add DJ phrase occasionally
    if (Math.random() > 0.5) {
      return `${baseIntro}${djPhrases[Math.floor(Math.random() * djPhrases.length)]}`;
    }
    
    return baseIntro;
  };

  // Start DJ Mode
  const startDJMode = () => {
    setDjMode(true);
    setDjControlMode(true);
    
    // Reset track counter when DJ starts
    resetTrackCounter();
    
    // Save DJ mode state to localStorage
    localStorage.setItem('djMode', 'true');
    
    // Use cached message if available, otherwise use welcome message without voice
    const cachedItem = getRandomCachedMessage();
    if (cachedItem) {
      setDjMessage(cachedItem.message);
      lastAnnouncementRef.current = Date.now();
      setTimeout(() => {
        // Don't check track counter for welcome message
        const audioUrl = cachedItem.audioUrl;
        if (!voiceEnabled || isSpeaking) return;
        
        // Store current playing state
        wasPlayingRef.current = isPlaying;
        
        // Pause music if it's playing
        if (isPlaying) {
          pauseSong();
        }
        
        setIsSpeaking(true);
        
        AIVoiceService.playAudio(audioUrl)
          .then(() => {
            setIsSpeaking(false);
            if (wasPlayingRef.current) {
              setTimeout(() => playSong(), 500);
            }
          })
          .catch(() => {
            setIsSpeaking(false);
            if (wasPlayingRef.current) playSong();
          });
      }, 500);
    } else {
      const welcomeMessage = getDJMessage();
      setDjMessage(welcomeMessage);
      // No voice if no cached messages available
    }
    
    // Let the current song finish naturally, DJ will pick next song when it ends
    // No interval needed - the player's auto-play will trigger DJ recommendations
  };

  // Stop DJ Mode
  const stopDJMode = () => {
    setDjMode(false);
    setDjControlMode(false);
    setDjMessage('');
    if (djIntervalRef.current) {
      clearInterval(djIntervalRef.current);
      djIntervalRef.current = null;
    }
  };

  // Track user interactions and handle DJ song transitions
  useEffect(() => {
    if (currentSong && djMode) {
      updateUserProfile('play', currentSong);
      
      // Increment track counter when a new song starts
      const audioElement = document.querySelector('audio');
      const isAtBeginning = !audioElement || audioElement.currentTime <= 3;
      
      if (isAtBeginning) {
        trackCounterRef.current += 1;
        console.log(`Track counter incremented to ${trackCounterRef.current}/${nextSpeakThresholdRef.current}`);
      }
      
      // Use cached generic messages instead of song-specific announcements
      if (!isSpeaking && cachedMessages.length > 0) {
        // Only announce at the beginning of playback, not on every song change
        
        // Check if enough time has passed since last announcement (at least 5 seconds)
        const now = Date.now();
        const timeSinceLastAnnouncement = now - lastAnnouncementRef.current;
        const canAnnounce = timeSinceLastAnnouncement > 5000;
        
        if (isAtBeginning && canAnnounce) {
          const cachedItem = getRandomCachedMessage();
          if (cachedItem) {
            setDjMessage(cachedItem.message);
            lastAnnouncementRef.current = now;
            
            // Add a small delay before speaking to allow the audio to start loading
            setTimeout(() => {
              playCachedAudio(cachedItem.audioUrl);
            }, 1000);
          }
        }
      }
    }
  }, [currentSong, djMode, isSpeaking, cachedMessages]);

  // Override the player's next song selection when DJ is active
  useEffect(() => {
    if (djMode) {
      window.djGetNextSong = () => {
        console.log('DJ getting next song recommendation');
        const recommendation = getSmartRecommendation();
        if (recommendation) {
          console.log('DJ recommends:', recommendation.title, 'by', recommendation.artist);
          updateUserProfile('play', recommendation);
          
          // Use cached generic messages instead of generating new ones
          setTimeout(() => {
            if (!isSpeaking && cachedMessages.length > 0) {
              const cachedItem = getRandomCachedMessage();
              if (cachedItem) {
                // Check if enough time has passed since last announcement
                const now = Date.now();
                const timeSinceLastAnnouncement = now - lastAnnouncementRef.current;
                const canAnnounce = timeSinceLastAnnouncement > 5000;
                
                if (canAnnounce) {
                  setDjMessage(cachedItem.message);
                  lastAnnouncementRef.current = now;
                  
                  // Play the cached audio directly without generating new voice
                  if (shouldAllowDjToSpeak()) {
                    playCachedAudio(cachedItem.audioUrl);
                  }
                }
              }
            }
          }, 2000);
        } else {
          console.log('DJ could not find a recommendation');
        }
        return recommendation;
      };
    } else {
      window.djGetNextSong = null;
    }
    
    return () => {
      window.djGetNextSong = null;
    };
  }, [djMode, isSpeaking, cachedMessages]);

  return (
    <div className="dj-purple bg-gradient-to-r from-mauve/20 to-lavender/20 rounded-xl p-4 mb-6 border border-mauve/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-mauve to-lavender rounded-full flex items-center justify-center">
            <i className="fas fa-robot text-background text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-mauve">DJ Purple</h3>
            <p className="text-sm text-muted">Your AI Music Curator</p>
          </div>
        </div>
        
        <div>
          {!djMode && (
            <button
              onClick={startDJMode}
              className="px-4 py-2 rounded-lg font-semibold transition-all bg-mauve text-background hover:bg-mauve/90"
            >
              <i className="fas fa-play mr-2"></i>
              Start DJ
            </button>
          )}
        </div>
      </div>


      {djControlMode && (
        <div className="dj-control-notice bg-mauve/20 rounded-lg p-3 mb-4 border border-mauve/30 text-center">
          <div className="flex items-center justify-center gap-2 text-mauve">
            <i className="fas fa-headphones"></i>
            <span className="text-sm font-medium">Enjoy the musical journey with DJ Purple!</span>
          </div>
        </div>
      )}

      {djMode && (
        <div className="dj-stats grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-surface/30 rounded-lg p-3">
            <div className="text-lg font-bold text-mauve">
              {userProfile?.favoriteArtists?.length || 0}
            </div>
            <div className="text-xs text-muted">Favorite Artists</div>
          </div>
          <div className="bg-surface/30 rounded-lg p-3">
            <div className="text-lg font-bold text-mauve">
              {Object.keys(userProfile?.listeningTimes || {}).length}
            </div>
            <div className="text-xs text-muted">Active Hours</div>
          </div>
          <div className="bg-surface/30 rounded-lg p-3">
            <div className="text-lg font-bold text-mauve">
              {userProfile?.skipPatterns?.length || 0}
            </div>
            <div className="text-xs text-muted">Learning Points</div>
          </div>
          <div className="bg-surface/30 rounded-lg p-3">
            <div className="text-lg font-bold text-mauve">
              {djMode ? '🎧' : '💤'}
            </div>
            <div className="text-xs text-muted">DJ Status</div>
          </div>
        </div>
      )}
      


      {!djMode && (
        <div className="text-center text-muted text-sm">
          <p>Let DJ Purple learn your music taste and create personalized playlists!</p>
          <p className="mt-1">🤖 Smart recommendations • 🎵 Time-based curation • 📊 Behavior learning</p>
          <div className="mt-3">
            <Link href="/dj-stats" className="text-mauve hover:text-lavender text-xs">
              <i className="fas fa-chart-line mr-1"></i> View DJ Learning Stats
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}