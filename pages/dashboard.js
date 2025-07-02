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
    if (role === 'admin' && user) {
      setUsersLoading(true);
      setUsersError('');
      
      // Get the session token
      import('../lib/supabase').then(({ supabase }) => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            setUsersError('No session found');
            setUsersLoading(false);
            return;
          }
          
          fetch('/api/users', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          })
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => {
            setUsers(data.users || []);
            setUsersLoading(false);
          })
          .catch(err => {
            console.error('Users fetch error:', err);
            setUsersError(`Failed to load users: ${err.message}`);
            setUsersLoading(false);
          });
        });
      });
    }
  }, [role, user]);

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
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }
      
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Role change error:', error);
      alert(`Failed to update role: ${error.message}`);
    }
  };

  return (
    <>
      <SEO
        title="Dashboard | Zed Legends"
        description="Manage your music library, upload new songs, and view stats."
      />
      <Layout>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Modern Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-mauve to-lavender bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-muted mt-2">Manage your music library and settings</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-surface/50 backdrop-blur-sm rounded-xl p-4 border border-overlay/30">
                <div className="text-2xl font-bold text-mauve">{users.length}</div>
                <div className="text-xs text-muted">Total Users</div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl rounded-2xl border border-overlay/30 shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-mauve to-lavender rounded-xl flex items-center justify-center">
                  <i className="fas fa-upload text-background text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Upload New Song</h2>
                  <p className="text-sm text-muted">Add new tracks to your library</p>
                </div>
              </div>
              {canUploadOrRename && <FileUploader onUploadSuccess={handleUploadSuccess} />}
            </div>
          </div>

          {/* File Browser Section */}
          <div className="bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl rounded-2xl border border-overlay/30 shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue to-sky rounded-xl flex items-center justify-center">
                  <i className="fas fa-folder text-background text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">File Management</h2>
                  <p className="text-sm text-muted">Browse and manage your music files</p>
                </div>
              </div>
              <R2FileBrowser key={fileBrowserKey} onEdit={canEditMeta ? handleEdit : undefined} canRename={canUploadOrRename} />
            </div>
          </div>

          {/* User Management Section */}
          {role === 'admin' && (
            <div className="bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl rounded-2xl border border-overlay/30 shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green to-teal rounded-xl flex items-center justify-center">
                      <i className="fas fa-users text-background text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">User Management</h2>
                      <p className="text-sm text-muted">Manage user roles and permissions</p>
                    </div>
                  </div>
                  <button
                    onClick={handleTriggerSync}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mauve to-lavender text-background rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
                    disabled={syncing}
                  >
                    {syncing ? (
                      <><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background"></span> Syncing...</>
                    ) : (
                      <><i className="fas fa-sync-alt"></i> Sync Library</>
                    )}
                  </button>
                </div>
                
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauve"></div>
                  </div>
                ) : usersError ? (
                  <div className="bg-love/10 border border-love/30 rounded-xl p-4 text-love">{usersError}</div>
                ) : (
                  <div className="bg-background/50 rounded-xl overflow-hidden border border-overlay/30">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-surface/50">
                          <tr>
                            <th className="text-left p-4 font-medium text-muted">Email</th>
                            <th className="text-left p-4 font-medium text-muted">Name</th>
                            <th className="text-left p-4 font-medium text-muted">Role</th>
                            <th className="text-left p-4 font-medium text-muted">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u.id} className="border-t border-overlay/30 hover:bg-surface/30 transition-colors">
                              <td className="p-4 font-mono text-sm">{u.email}</td>
                              <td className="p-4">{u.name}</td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  u.role === 'admin' ? 'bg-mauve/20 text-mauve' :
                                  u.role === 'mod1' ? 'bg-blue/20 text-blue' :
                                  'bg-green/20 text-green'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-4">
                                <select
                                  value={u.role}
                                  onChange={e => handleRoleChange(u.id, e.target.value)}
                                  disabled={u.id === user.id}
                                  className="bg-surface/80 border border-overlay/50 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-mauve/50"
                                >
                                  <option value="admin">Admin</option>
                                  <option value="mod1">Moderator 1</option>
                                  <option value="mod2">Moderator 2</option>
                                </select>
                                {u.id === user.id && <span className="ml-2 text-xs text-muted">(You)</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {syncResult && (
                  <div className="mt-4 bg-green/10 border border-green/30 rounded-xl p-4 text-green">
                    <i className="fas fa-check-circle mr-2"></i>{syncResult}
                  </div>
                )}
                {syncError && (
                  <div className="mt-4 bg-love/10 border border-love/30 rounded-xl p-4 text-love">
                    <i className="fas fa-exclamation-circle mr-2"></i>{syncError}
                  </div>
                )}
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