// Pronunciation guide for difficult artist names and song titles
// Format: { 'original text': 'phonetic spelling or pronunciation hint' }

export const ARTIST_PRONUNCIATIONS = {
  // Zambian artists
  'PilAto': 'Pee-LAH-toh',
  'Chef 187': 'Chef One-Eight-Seven',
  'Macky 2': 'Macky Two',
  'Slap Dee': 'Slap Dee',
  'Mampi': 'Mam-pee',
  'Cleo Ice Queen': 'Cleo Ice Queen',
  'Roberto': 'Ro-BEAR-to',
  'Kaladoshas': 'Kala-DOH-shas',
  'Yo Maps': 'Yo Maps',
  'Izrael': 'Iz-ray-el',
  
  // Add more artist pronunciations as needed
};

export const SONG_PRONUNCIATIONS = {
  // Difficult song titles
  'Nizakupanga': 'Nee-zah-koo-PAHN-gah',
  'Amakofi': 'Ah-mah-KOH-fee',
  'Kumwesu': 'Koom-WEH-soo',
  'Tuleisakamana': 'Too-lay-sah-kah-MAH-nah',
  'Mwati Uziba': 'Mwah-tee Oo-ZEE-bah',
  'Lituation': 'Lit-choo-AY-shun',
  'Mutima': 'Moo-TEE-mah',
  'Nalema': 'Nah-LEH-mah',
  
  // Add more song pronunciations as needed
};

// In-memory cache for dynamic pronunciations from database
let dynamicPronunciations = {};

// Helper function to get pronunciation for an artist
export function getArtistPronunciation(artist) {
  // Check dynamic pronunciations first
  if (dynamicPronunciations[artist] && dynamicPronunciations[artist].type === 'artist') {
    return dynamicPronunciations[artist].pronunciation;
  }
  // Fall back to static pronunciations
  return ARTIST_PRONUNCIATIONS[artist] || artist;
}

// Helper function to get pronunciation for a song title
export function getSongPronunciation(title) {
  // Check dynamic pronunciations first
  if (dynamicPronunciations[title] && dynamicPronunciations[title].type === 'song') {
    return dynamicPronunciations[title].pronunciation;
  }
  // Fall back to static pronunciations
  return SONG_PRONUNCIATIONS[title] || title;
}

// Helper function to format text with pronunciation guides
export function formatWithPronunciation(text, originalArtist, originalTitle) {
  const artist = getArtistPronunciation(originalArtist);
  const title = getSongPronunciation(originalTitle);
  
  // Replace the original artist and title with their pronunciations
  return text
    .replace(originalArtist, artist)
    .replace(originalTitle, title);
}

// Load dynamic pronunciations from the database
export async function loadDynamicPronunciations() {
  try {
    const response = await fetch('/api/pronunciation');
    if (response.ok) {
      const data = await response.json();
      
      // Reset the cache
      dynamicPronunciations = {};
      
      // Populate the cache with pronunciations from the database
      data.pronunciations.forEach(item => {
        dynamicPronunciations[item.originalText] = {
          pronunciation: item.pronunciation,
          type: item.type
        };
      });
      
      console.log(`Loaded ${data.pronunciations.length} dynamic pronunciations`);
    }
  } catch (error) {
    console.error('Failed to load dynamic pronunciations:', error);
  }
}