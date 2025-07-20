// Script to create the pronunciations table in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createPronunciationsTable() {
  console.log('Creating pronunciations table in Supabase...');
  
  try {
    // Check if table exists
    const { error: checkError } = await supabase
      .from('pronunciations')
      .select('id')
      .limit(1);
    
    if (!checkError) {
      console.log('Table already exists');
      return;
    }
    
    // Create table using SQL
    const { error } = await supabase.rpc('create_pronunciations_table', {});
    
    if (error) {
      console.error('Error creating table:', error);
      
      // Try creating the function first
      const createFunctionQuery = `
        CREATE OR REPLACE FUNCTION create_pronunciations_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS public.pronunciations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            original_text TEXT NOT NULL,
            pronunciation TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('artist', 'song')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES auth.users(id)
          );
          
          -- Create index for faster lookups
          CREATE INDEX IF NOT EXISTS idx_pronunciations_original_text ON public.pronunciations(original_text);
          
          -- Set up RLS policies
          ALTER TABLE public.pronunciations ENABLE ROW LEVEL SECURITY;
          
          -- Allow admins to do everything
          CREATE POLICY admin_all ON public.pronunciations 
            FOR ALL 
            TO authenticated 
            USING (auth.jwt() ->> 'role' = 'admin');
            
          -- Allow all users to read
          CREATE POLICY read_all ON public.pronunciations 
            FOR SELECT 
            TO authenticated 
            USING (true);
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { error: fnError } = await supabase.rpc('exec_sql', { sql: createFunctionQuery });
      
      if (fnError) {
        console.error('Error creating function:', fnError);
        return;
      }
      
      // Try creating the table again
      const { error: retryError } = await supabase.rpc('create_pronunciations_table', {});
      
      if (retryError) {
        console.error('Error creating table (retry):', retryError);
        return;
      }
    }
    
    console.log('Pronunciations table created successfully');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createPronunciationsTable().catch(console.error);