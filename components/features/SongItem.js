import { useState } from 'react';
import { usePlayer } from '../context/SimplePlayerContext';
import { useLibrary } from '../context/LibraryContext';
import EditMetadataModal from './EditMetadataModal';
// import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function SongItem({ song, isActive }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const { isPlaying, pauseSong, playSong } = usePlayer();

  const { updateSongMetadata, deleteSong } = useLibrary();

  const handleItemClick = () => {
    if (isActive) {
      if (isPlaying) {
        pauseSong();
      } else {
        playSong();
      }
    } else {
      playSong(song);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    handleItemClick();
  };

  // Handle edit button click
  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  // Handle metadata update
  const handleMetadataUpdate = async (metadata) => {
    try {
      await updateSongMetadata(song.id, {
        ...metadata,
        file: song.file
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating metadata:', error);
      // Show error notification
    }
  };

  // Handle song deletion
  const handleDeleteConfirm = async () => {
    try {
      await deleteSong(song.id, song.file);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting song:', error);
      // Show error notification
    }
  };

  return (
    <>
      <li
        className={`song-item group relative flex items-center p-2 rounded-md transition-colors cursor-pointer ${
          isActive ? 'bg-surface' : 'hover:bg-surface/50'
        }`}
        onClick={handleItemClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Song thumbnail & Play/Pause button */}
        <div className="relative w-10 h-10 rounded bg-background flex items-center justify-center overflow-hidden mr-3">
          {song.albumArt ? (
            <img
              src={song.albumArt}
              alt={song.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <i className="fas fa-music text-muted"></i>
          )}
          <button
            onClick={handlePlayClick}
            className={`absolute inset-0 flex items-center justify-center w-full h-full bg-black/50 transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            aria-label={isActive && isPlaying ? 'Pause' : 'Play'}
          >
            {isActive && isPlaying ? (
              <i className="fas fa-pause text-white text-lg"></i>
            ) : (
              <i className="fas fa-play text-white text-lg"></i>
            )}
          </button>
        </div>

        {/* Song info */}
        <div className="song-info flex-1 min-w-0">
          <div className="song-title font-medium truncate">
            {song.title}
          </div>
          <div className="song-details text-sm text-muted truncate">
            <span className="song-artist">{song.artist}</span>
            {song.album && (
              <span className="song-album"> • {song.album}</span>
            )}
          </div>
        </div>

        {/* Song actions - visible on hover or on mobile touch */}
        <div className={`song-actions flex items-center gap-2 transition-opacity ${
          showActions || isActive ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            className="edit-button p-2 text-muted hover:text-text"
            onClick={handleEditClick}
            aria-label="Edit metadata"
            title="Edit metadata"
          >
            <i className="fas fa-edit"></i>
          </button>

          {/* <button
            className="delete-button p-2 text-muted hover:text-love"
            onClick={handleDeleteClick}
            aria-label="Delete song"
            title="Delete song"
          >
            <i className="fas fa-trash-alt"></i>
          </button> */}
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
          onClose={() => setShowEditModal(false)}
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
    </>
  );
}
