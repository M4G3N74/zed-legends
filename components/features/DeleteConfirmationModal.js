import { useEffect, useRef, useState } from 'react';

export default function DeleteConfirmationModal({ song, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const modalRef = useRef(null);
  
  // Handle delete confirmation
  const handleConfirm = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await onConfirm();
    } catch (error) {
      console.error('Error deleting song:', error);
      setIsDeleting(false);
    }
  };
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="modal-content bg-surface rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="modal-header flex items-center justify-between p-4 border-b border-overlay">
          <h2 className="text-lg font-semibold text-love">Delete Song</h2>
          <button 
            className="text-muted hover:text-text"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body p-4 space-y-4">
          <p className="delete-message">
            Are you sure you want to delete "<span className="font-medium">{song.title}</span>"?
          </p>
          <p className="delete-warning text-sm text-love">
            This action cannot be undone. The file will be permanently deleted from your music folder.
          </p>
        </div>
        
        <div className="modal-footer flex justify-end gap-2 p-4 border-t border-overlay">
          <button
            type="button"
            className="px-4 py-2 bg-background text-text rounded-md hover:bg-overlay"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-love text-background rounded-md hover:bg-love/80 disabled:opacity-50"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-spinner fa-spin"></i> Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
