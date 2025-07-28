'use client';

import { useState, useEffect } from 'react';
import R2FileBrowser from '../../../components/features/R2FileBrowser.tsx';
import EditMetadataModal from '../../../components/features/EditMetadataModal.tsx';

export default function LibraryPage() {
  const [fileBrowserKey, setFileBrowserKey] = useState(Date.now());
  const [editingFile, setEditingFile] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleEdit = (file) => {
    setEditingFile({
      key: file.path || file.Key,
      path: file.path || file.Key,
      title: file.title || '',
      artist: file.artist || '',
      album: file.album || ''
    });
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/webhook-sync', { method: 'POST' });
      const data = await res.json();
      setSyncResult('Library synced successfully');
      setFileBrowserKey(Date.now());
    } catch (error) {
      setSyncResult('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveMetadata = async (metadata) => {
    try {
      const response = await fetch('/api/songs/metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...metadata, file: editingFile.key }),
      });
      if (response.ok) {
        setEditingFile(null);
        setFileBrowserKey(Date.now());
      }
    } catch (error) {
      console.error('Failed to save metadata:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
                <i className="fas fa-arrow-left"></i>
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Music Library</h1>
                <p className="text-gray-600 text-sm">Manage all music files and metadata</p>
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <i className={`fas ${syncing ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
              {syncing ? 'Syncing...' : 'Sync Library'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {syncResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {syncResult}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <R2FileBrowser key={fileBrowserKey} onEdit={handleEdit} canRename={true} />
        </div>
      </main>

      {editingFile && (
        <EditMetadataModal
          song={editingFile}
          onClose={() => setEditingFile(null)}
          onSave={handleSaveMetadata}
        />
      )}
    </div>
  );
}