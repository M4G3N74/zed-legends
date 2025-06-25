import Layout from '../components/layout/Layout';
import SEO from '../components/ui/SEO';
import R2FileBrowser from '../components/features/R2FileBrowser';
import FileUploader from '../components/features/FileUploader';
import EditMetadataModal from '../components/features/EditMetadataModal';
import SongListInfinite from '../components/features/SongListInfinite';
import { useState, useEffect } from 'react';
import { useUser } from '../components/context/UserContext';

export default function DashboardPage() {
  const { user, role, loading } = useUser();
  const [fileBrowserKey, setFileBrowserKey] = useState(Date.now());
  const [editingFile, setEditingFile] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [syncLogs, setSyncLogs] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      setUsersLoading(true);
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          setUsers(data.users || []);
          setUsersLoading(false);
        })
        .catch(err => {
          setUsersError('Failed to load users');
          setUsersLoading(false);
        });
    }
  }, [role]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  const canUploadOrRename = role === 'admin' || role === 'mod1';
  const canEditMeta = role === 'admin' || role === 'mod1' || role === 'mod2';

  const handleUploadSuccess = () => {
    setFileBrowserKey(Date.now());
  };

  const handleEdit = (file) => {
    setEditingFile({
      key: file.path || file.Key,
      path: file.path || file.Key,
      title: file.title || '',
      artist: file.artist || '',
      album: file.album || ''
    });
  };

  const handleSyncSongs = async () => {
    setSyncing(true);
    setSyncLogs(null);
    setSyncError(null);
    try {
      const res = await fetch('/api/trigger-sync', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setSyncLogs(data.logs);
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const res = await fetch('/api/webhook-sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setSyncResult(data.message || 'Sync triggered successfully');
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveMetadata = async (metadata) => {
    try {
      const response = await fetch('/api/songs/metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metadata,
          file: editingFile.key
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save metadata');
      }

      setEditingFile(null);
      handleUploadSuccess(); 
    } catch (error) {
      console.error('Failed to save metadata:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role: newRole }),
    });
    setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  return (
    <>
      <SEO
        title="Dashboard | Zed Legends"
        description="Manage your music library, upload new songs, and view stats."
      />
      <Layout>
        <div className="content-area space-y-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur p-4 rounded-b-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Upload New Song</h2>
            {canUploadOrRename && <FileUploader onUploadSuccess={handleUploadSuccess} />}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">R2 Bucket Files</h2>
            <R2FileBrowser key={fileBrowserKey} onEdit={canEditMeta ? handleEdit : undefined} canRename={canUploadOrRename} />
          </div>

          {role === 'admin' && (
            <div className="bg-surface p-6 rounded-lg shadow-md mt-8">
              <h2 className="text-2xl font-semibold mb-4">User Management</h2>
              {usersLoading ? (
                <div>Loading users...</div>
              ) : usersError ? (
                <div className="text-love">{usersError}</div>
              ) : (
                <table className="min-w-full bg-background rounded-lg">
                  <thead>
                    <tr>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-overlay">
                        <td className="p-3 font-mono">{u.email}</td>
                        <td className="p-3">{u.name}</td>
                        <td className="p-3">{u.role}</td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            disabled={u.id === user.id}
                            className="bg-surface border rounded px-2 py-1"
                          >
                            <option value="admin">admin</option>
                            <option value="mod1">mod1</option>
                            <option value="mod2">mod2</option>
                          </select>
                          {u.id === user.id && <span className="ml-2 text-xs text-muted">(You)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="my-4">
                <button
                  onClick={handleTriggerSync}
                  className="px-4 py-2 bg-mauve text-background rounded-lg hover:bg-mauve/90 transition-colors disabled:opacity-60"
                  disabled={syncing}
                >
                  {syncing ? (
                    <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-background"></span> Triggering Sync...</span>
                  ) : (
                    <span><i className="fas fa-sync-alt mr-2"></i>Trigger Sync</span>
                  )}
                </button>
                {syncResult && <div className="mt-2 text-green-600">{syncResult}</div>}
                {syncError && <div className="mt-2 text-love">{syncError}</div>}
              </div>
            </div>
          )}
        </div>
      </Layout>

      {editingFile && canEditMeta && (
        <EditMetadataModal
          song={editingFile}
          onClose={() => setEditingFile(null)}
          onSave={handleSaveMetadata}
        />
      )}
    </>
  );
} 