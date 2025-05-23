// Track User Interaction API endpoint
// This endpoint receives user interaction data (plays, skips, likes, dislikes)
// and stores it for use by the smart shuffle algorithm

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    // In a real implementation, this would store the interaction in your database
    // For now, we'll just log it and return success
    console.log(`User ${userId} ${interactionType}d song ${songId} at ${timestamp || new Date().toISOString()}`);

    // Here you would typically:
    // 1. Store the interaction in your database
    // 2. Update the user's profile or preferences
    // 3. Update song popularity metrics
    // 4. Train or update your recommendation model

    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track interaction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
