'use client';

import { useState, useEffect } from 'react';

export default function ArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      const res = await fetch('/api/artists');
      const data = await res.json();
      setArtists(data.artists || []);
    } catch (error) {
      console.error('Failed to load artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
              <i className="fas fa-arrow-left"></i>
            </a>
            {selectedArtist && (
              <button onClick={() => setSelectedArtist(null)} className="text-blue-600 hover:text-blue-700">
                <i className="fas fa-arrow-left"></i>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedArtist ? selectedArtist.name : 'Artists Dashboard'}
              </h1>
              <p className="text-gray-600 text-sm">
                {selectedArtist ? 'Artist songs and statistics' : 'Browse artists and their music'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!selectedArtist ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-microphone text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{artists.length}</p>
                    <p className="text-gray-600 text-sm">Total Artists</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-music text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {artists.reduce((sum, artist) => sum + artist.songCount, 0)}
                    </p>
                    <p className="text-gray-600 text-sm">Total Songs</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-play text-purple-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {artists.reduce((sum, artist) => sum + artist.totalStreams, 0).toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm">Total Streams</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-star text-orange-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {artists.length > 0 ? Math.round(artists.reduce((sum, artist) => sum + artist.songCount, 0) / artists.length) : 0}
                    </p>
                    <p className="text-gray-600 text-sm">Avg Songs/Artist</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">All Artists</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {artists.map((artist, index) => (
                  <div
                    key={index}
                    onClick={() => handleArtistSelect(artist)}
                    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-user-music text-blue-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{artist.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{artist.songCount} songs</span>
                          <span>{artist.totalStreams.toLocaleString()} streams</span>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-gray-400"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-music text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{selectedArtist.songCount}</p>
                    <p className="text-gray-600 text-sm">Total Songs</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-play text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{selectedArtist.totalStreams.toLocaleString()}</p>
                    <p className="text-gray-600 text-sm">Total Streams</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedArtist.songCount > 0 ? Math.round(selectedArtist.totalStreams / selectedArtist.songCount) : 0}
                    </p>
                    <p className="text-gray-600 text-sm">Avg Streams/Song</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Songs by {selectedArtist.name}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {selectedArtist.songs.map((song, index) => (
                  <div key={song.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-music text-blue-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{song.title}</h4>
                        <p className="text-sm text-gray-600">{song.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}