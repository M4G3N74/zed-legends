import { useState, useEffect, useRef } from 'react';

export default function EditMetadataModal({ song, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: song.title || '',
    artist: song.artist || '',
    album: song.album || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const initialFocusRef = useRef(null);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving metadata:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    // Set focus on first input
    if (initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
    
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
          <h2 className="text-lg font-semibold">Edit Metadata</h2>
          <button 
            className="text-muted hover:text-text"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body p-4 space-y-4">
            <div className="form-group">
              <label htmlFor="edit-title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                type="text"
                id="edit-title"
                name="title"
                ref={initialFocusRef}
                className="w-full px-3 py-2 bg-background rounded-md border border-overlay focus:outline-none focus:border-mauve"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-artist" className="block text-sm font-medium mb-1">
                Artist
              </label>
              <input
                type="text"
                id="edit-artist"
                name="artist"
                className="w-full px-3 py-2 bg-background rounded-md border border-overlay focus:outline-none focus:border-mauve"
                value={formData.artist}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-album" className="block text-sm font-medium mb-1">
                Album
              </label>
              <input
                type="text"
                id="edit-album"
                name="album"
                className="w-full px-3 py-2 bg-background rounded-md border border-overlay focus:outline-none focus:border-mauve"
                value={formData.album}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="modal-footer flex justify-end gap-2 p-4 border-t border-overlay">
            <button
              type="button"
              className="px-4 py-2 bg-background text-text rounded-md hover:bg-overlay"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-mauve text-background rounded-md hover:bg-lavender disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
