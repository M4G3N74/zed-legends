import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    // Update user role to admin
    const { data, error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('email', email)
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ 
      success: true, 
      message: `User ${email} is now admin`,
      user: data[0]
    });
  } catch (error) {
    console.error('Make admin error:', error);
    return res.status(500).json({ error: error.message });
  }
}