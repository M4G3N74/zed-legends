import { useState, useEffect, useCallback } from 'react';

// Function to format bytes into a human-readable string
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const Breadcrumbs = ({ path, onNavigate }) => {
  const parts = path.split('/').filter(Boolean);
  return (
    <nav className="mb-4 text-lg">
      <a onClick={() => onNavigate('')} className="text-mauve hover:underline cursor-pointer">
        Home
      </a>
      {parts.map((part, index) => {
        const currentPath = parts.slice(0, index + 1).join('/') + '/';
        return (
          <span key={index}>
            <span className="mx-2">/</span>
            <a onClick={() => onNavigate(currentPath)} className="text-mauve hover:underline cursor-pointer">
              {part}
            </a>
          </span>
        );
      })}
    </nav>
  );
};

const FolderRow = ({ file, currentPath, handleNavigate, onRename }) => {
  const [size, setSize] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSize = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/r2/folder-size?prefix=${encodeURIComponent(file.Key)}`);
        if (response.ok) {
          const data = await response.json();
          setSize(data.totalSize);
        }
      } catch (error) {
        console.error(`Failed to fetch size for ${file.Key}`, error);
        // Keep size as null to show '—'
      } finally {
        setIsLoading(false);
      }
    };

    fetchSize();
  }, [file.Key]);

  return (
    <tr className="border-b border-overlay hover:bg-overlay/50">
      <td className="p-3 font-mono">
        <a onClick={() => handleNavigate(file.Key)} className="flex items-center gap-2 cursor-pointer text-text hover:text-mauve">
          <i className="fas fa-folder"></i>
          {file.Key.replace(currentPath, '').replace('/', '')}
        </a>
      </td>
      <td className="p-3">
        {isLoading ? (
          <div className="animate-pulse bg-slate-700 h-4 w-16 rounded"></div>
        ) : (
          size !== null ? formatBytes(size) : '—'
        )}
      </td>
      <td className="p-3">—</td>
      <td className="p-3">
        <button
          onClick={() => onRename(file)}
          className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
        >
          Rename
        </button>
      </td>
    </tr>
  );
};

export default function R2FileBrowser({ onEdit, canRename }) {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState('');

  const fetchFiles = useCallback(async (prefix) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/r2/list-files?prefix=${encodeURIComponent(prefix)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file list.');
      }
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, fetchFiles]);

  const handleNavigate = (path) => {
    setCurrentPath(path);
  };

  const handleRename = async (item) => {
    const currentName = item.isFolder
      ? item.Key.replace(currentPath, '').replace('/', '')
      : item.Key.replace(currentPath, '');

    const newName = window.prompt(`Enter new name for "${currentName}":`, currentName);

    if (!newName || newName.trim() === '' || newName === currentName) {
      return; // User cancelled or entered same/empty name
    }

    if (newName.includes('/')) {
      alert('Invalid name. It cannot contain slashes.');
      return;
    }

    const oldKey = item.Key;
    const newKey = item.isFolder
      ? `${currentPath}${newName}/`
      : `${currentPath}${newName}`;

    try {
      const response = await fetch('/api/r2/rename-object', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldKey, newKey }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to rename.');
      }

      // Refresh the file list
      fetchFiles(currentPath);

    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = window.prompt('Enter new folder name:');
    if (!folderName) {
      return; // User cancelled
    }
    
    // Basic validation for folder name
    if (folderName.includes('/') || folderName.trim() === '') {
      alert('Invalid folder name. It cannot contain slashes or be empty.');
      return;
    }

    const newFolderPath = `${currentPath}${folderName}/`;

    try {
      const response = await fetch('/api/r2/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: newFolderPath }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create folder.');
      }
      
      // Refresh list to show new folder
      fetchFiles(currentPath);

    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (fileKey) => {
    if (!window.confirm(`Are you sure you want to delete "${fileKey}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/r2/delete-file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete file.');
      }

      // Refresh the file list
      fetchFiles(currentPath);

    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mauve"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-love/20 text-love p-4 rounded-lg">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumbs path={currentPath} onNavigate={handleNavigate} />
        {canRename && (
          <button
            onClick={handleCreateFolder}
            className="px-4 py-2 bg-mauve text-background rounded-lg hover:bg-mauve/90 transition-colors"
          >
            <i className="fas fa-folder-plus mr-2"></i>
            Create Folder
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-surface rounded-lg">
          <thead>
            <tr className="border-b border-overlay">
              <th className="text-left p-3">File Name</th>
              <th className="text-left p-3">Size</th>
              <th className="text-left p-3">Last Modified</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) =>
              file.isFolder ? (
                <FolderRow
                  key={file.Key}
                  file={file}
                  currentPath={currentPath}
                  handleNavigate={handleNavigate}
                  onRename={canRename ? handleRename : undefined}
                />
              ) : (
                <tr key={file.Key} className="border-b border-overlay hover:bg-overlay/50">
                  <td className="p-3 font-mono">
                    {file.Key.replace(currentPath, '')}
                  </td>
                  <td className="p-3">{file.Size ? formatBytes(file.Size) : '—'}</td>
                  <td className="p-3">{file.LastModified ? new Date(file.LastModified).toLocaleString() : '—'}</td>
                  <td className="p-3">
                    {canRename && (
                      <>
                        <button
                          onClick={() => handleRename(file)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm mr-2"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDelete(file.Key)}
                          className="px-3 py-1 bg-love text-background rounded-md hover:bg-love/80 text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {onEdit && !file.isFolder && (
                      <button
                        onClick={() => onEdit(file)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm mr-2"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 