const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load SQL from file
const sql = fs.readFileSync(path.join(__dirname, 'setup-supabase-db.sql'), 'utf8');

// Use direct connection details for reliability in a script
const config = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
  family: 4,
  ssl: {
    rejectUnauthorized: false,
  },
};

if (!config.host || !config.user || !config.password || !config.database) {
  console.error('Missing one or more required environment variables: POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE');
  process.exit(1);
}

const client = new Client(config);

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