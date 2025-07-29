import React, { useState, useCallback } from 'react';
import { usePlayer } from '../context/SimplePlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { useFavorites } from '../../hooks/useFavorites';
import { useRecentlyPlayed } from '../../hooks/useRecentlyPlayed';
import EditMetadataModal from './EditMetadataModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import MoodTagger from './MoodTagger';
import PlaylistSelector from './PlaylistSelector';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  path: string;
  duration: number;
  url?: string;
}

interface SongItemProps {
  song: Song;
  isActive: boolean;
}

export default function SongItem({ song, isActive }: SongItemProps) {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showActions, setShowActions] = useState<boolean>(false);
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [showMoodTagger, setShowMoodTagger] = useState<boolean>(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState<boolean>(false);

  const { isPlaying, pauseSong, playSong, resumeSong } = usePlayer();
  const { updateSongMetadata } = useLibrary();
  const { isFavorite, toggleFavorite } = useFavorites('temp-user-id'); // Replace with actual user ID
  const { addToRecentlyPlayed } = useRecentlyPlayed('temp-user-id');

  const handleItemClick = useCallback(() => {
    if (isClicking) return;
    
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 500);
    
    if (isActive) {
      if (isPlaying) {
        pauseSong();
      } else {
        resumeSong();
      }
    } else {
      playSong({ ...song, album: song.album ?? '' });
      // Add to recently played when song starts
      setTimeout(() => addToRecentlyPlayed(song.id), 100);
    }
  }, [isActive, isPlaying, pauseSong, resumeSong, playSong, song, isClicking, addToRecentlyPlayed]);



  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  // Handle metadata update
  const handleMetadataUpdate = useCallback(async (metadata: Partial<Song>) => {
    try {
      await updateSongMetadata(song.id, metadata);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating metadata:', error);
      // Show error notification
    }
  }, [song.id, song.path, updateSongMetadata]);

  const handleCloseModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  // Handle song deletion
  const handleDeleteConfirm = async () => {
    try {
      // Delete functionality disabled
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  return (
    <>
      <li
        className={`song-item group relative flex items-center p-2 sm:p-3 rounded-md transition-colors cursor-pointer ${
          isActive ? 'bg-surface' : 'hover:bg-surface/50'
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onTouchStart={() => setShowActions(true)}
      >
        {/* Song thumbnail & Play/Pause button */}
        <div 
          className="relative w-10 h-10 sm:w-12 sm:h-12 rounded bg-background flex items-center justify-center overflow-hidden mr-3 cursor-pointer flex-shrink-0"
          onClick={handleItemClick}
        >
          {song.albumArt ? (
            <img
              src={song.albumArt}
              alt={song.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <img
            src="/images/logo.png"
            alt={song.title}
            className={`w-full h-full object-cover ${song.albumArt ? 'hidden' : ''}`}
            loading="lazy"
          />
          <div
            className={`absolute inset-0 flex items-center justify-center w-full h-full bg-black/50 transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isActive && isPlaying ? (
              <i className="fas fa-pause text-white text-sm sm:text-lg"></i>
            ) : (
              <i className="fas fa-play text-white text-sm sm:text-lg"></i>
            )}
          </div>
        </div>

        {/* Song info */}
        <div className="song-info flex-1 min-w-0 cursor-pointer" onClick={handleItemClick}>
          <div className="song-title font-medium truncate text-sm sm:text-base">
            {song.title}
          </div>
          <div className="song-details text-xs sm:text-sm text-muted truncate">
            <span className="song-artist">{song.artist}</span>
            {song.album && (
              <span className="song-album hidden sm:inline"> • {song.album}</span>
            )}
          </div>
        </div>

        {/* Song actions - visible on hover or on mobile touch */}
        <div className={`song-actions flex items-center gap-1 sm:gap-2 transition-opacity ${
          showActions || isActive ? 'opacity-100' : 'opacity-0 sm:opacity-0'
        }`}>
          <button
            className={`favorite-button p-1 sm:p-2 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ${
              isFavorite(song.id) ? 'text-pink-400' : 'text-muted hover:text-pink-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(song.id);
            }}
            aria-label={isFavorite(song.id) ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite(song.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            <i className={`fas ${isFavorite(song.id) ? 'fa-heart' : 'fa-heart'} text-xs sm:text-sm`}></i>
          </button>
          
          <button
            className="queue-button p-1 sm:p-2 text-muted hover:text-blue min-w-[32px] min-h-[32px] flex items-center justify-center"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await fetch('/api/queue', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer temp-user-id'
                  },
                  body: JSON.stringify({ song_id: song.id, position: Date.now() })
                });
              } catch (error) {
                console.error('Failed to add to queue:', error);
              }
            }}
            aria-label="Add to queue"
            title="Add to queue"
          >
            <i className="fas fa-plus text-xs sm:text-sm"></i>
          </button>
          
          <button
            className="playlist-button p-1 sm:p-2 text-muted hover:text-green min-w-[32px] min-h-[32px] flex items-center justify-center hidden sm:flex"
            onClick={(e) => {
              e.stopPropagation();
              setShowPlaylistSelector(true);
            }}
            aria-label="Add to playlist"
            title="Add to playlist"
          >
            <i className="fas fa-list-ul text-xs sm:text-sm"></i>
          </button>
          
          <button
            className="edit-button p-1 sm:p-2 text-muted hover:text-text min-w-[32px] min-h-[32px] flex items-center justify-center"
            onClick={handleEditClick}
            aria-label="Edit metadata"
            title="Edit metadata"
          >
            <i className="fas fa-edit text-xs sm:text-sm"></i>
          </button>
        </div>

        {/* Playing indicator */}
        {isActive && isPlaying && (
          <div className="playing-indicator absolute left-0 top-0 bottom-0 w-1 bg-mauve rounded-l-md"></div>
        )}
      </li>

      {/* Edit metadata modal */}
      {showEditModal && (
        <EditMetadataModal
          song={song}
          onClose={handleCloseModal}
          onSave={handleMetadataUpdate}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          song={song}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      
      {/* Mood tagger modal */}
      {showMoodTagger && (
        <MoodTagger
          songId={song.id}
          userId="temp-user-id"
          isVisible={showMoodTagger}
          onClose={() => setShowMoodTagger(false)}
        />
      )}
      
      {/* Playlist selector modal */}
      {showPlaylistSelector && (
        <PlaylistSelector
          songId={song.id}
          userId="temp-user-id"
          isVisible={showPlaylistSelector}
          onClose={() => setShowPlaylistSelector(false)}
        />
      )}
    </>
  );
}