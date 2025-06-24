// Track User Interaction API endpoint
// This endpoint receives user interaction data (plays, skips, likes, dislikes)
// and stores it for use by the smart shuffle algorithm

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), 'data/user-interactions.json');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, songId, interactionType, timestamp } = req.body;

    // Validate required fields
    if (!userId || !songId || !interactionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate interaction type
    const validInteractionTypes = ['play', 'skip', 'like', 'dislike'];
    if (!validInteractionTypes.includes(interactionType)) {
      return res.status(400).json({ error: 'Invalid interaction type' });
    }

    // Read existing data or initialize
    let interactions = [];
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      try {
        interactions = JSON.parse(raw);
      } catch (e) {
        interactions = [];
      }
    }

    // Append new interaction
    interactions.push({ userId, songId, interactionType, timestamp: timestamp || new Date().toISOString() });

    // Write back to file
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(interactions, null, 2));

    // Here you would typically:
    // 1. Store the interaction in your database
    // 2. Update the user's profile or preferences
    // 3. Update song popularity metrics
    // 4. Train or update your recommendation model

    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving interaction:', error);
    return res.status(500).json({ error: 'Failed to save interaction' });
  }
}
