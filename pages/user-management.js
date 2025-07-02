import { useEffect, useState } from 'react';
import { useUser } from '../components/context/UserContext';
import Layout from '../components/layout/Layout';
import SEO from '../components/ui/SEO';

export default function UserManagementPage() {
  const { user, role, loading } = useUser();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (role === 'admin' && user) {
      setUsersLoading(true);
      
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
          .then(res => res.json())
          .then(data => {
            setUsers(data.users || []);
            setUsersLoading(false);
          })
          .catch(err => {
            setUsersError('Failed to load users');
            setUsersLoading(false);
          });
        });
      });
    }
  }, [role, user]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user || role !== 'admin') {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  const handleRoleChange = async (userId, newRole) => {
    setActionError('');
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setActionError('No session found. Please log in again.');
        return;
      }
      
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    setActionError('');
    setDeletingId(userId);
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setActionError('No session found. Please log in again.');
        setDeletingId(null);
        return;
      }
      
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      setUsers(users => users.filter(u => u.id !== userId));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <SEO title="User Management | Zed Legends" description="Admin user management page." />
      <Layout>
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">User Management</h1>
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
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="px-3 py-1 bg-love text-background rounded hover:bg-love/90 disabled:opacity-60"
                        disabled={u.id === user.id || deletingId === u.id}
                        title={u.id === user.id ? 'You cannot delete yourself' : 'Delete user'}
                      >
                        {deletingId === u.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {actionError && <div className="text-love mt-4">{actionError}</div>}
        </div>
      </Layout>
    </>
  );
} 