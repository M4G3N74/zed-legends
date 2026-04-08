const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Load SQL from file
const sql = fs.readFileSync(path.join(__dirname, 'setup-supabase-db.sql'), 'utf8');

// Use direct connection string for reliability in a script
const connectionString = process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error('Missing required environment variable: POSTGRES_URL_NON_POOLING');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { 
    rejectUnauthorized: false,
    mode: 'require'
  },
});

async function run() {
  try {
    await client.connect();
    await client.query(sql);
    console.log('Supabase DB setup script ran successfully!');
  } catch (err) {
    console.error('Error running SQL script:', err);
  } finally {
    await client.end();
  }
}

run();