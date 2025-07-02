import { createClient } from '@supabase/supabase-js';
import { getUserWithRole } from '../../lib/getUserWithRole';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { user, role } = await getUserWithRole(req);
  
  if (!user || role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin only.' });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role');
      if (error) throw error;
      return res.status(200).json({ users: data || [] });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, role: newRole } = req.body;
      if (!id || !['admin', 'mod1', 'mod2'].includes(newRole)) {
        return res.status(400).json({ error: 'Invalid request.' });
      }
      
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating user role:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'User ID required.' });
    }
    if (id === user.id) {
      return res.status(400).json({ error: 'You cannot delete yourself.' });
    }
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
} 