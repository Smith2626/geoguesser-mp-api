import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // --- Standard CORS Headers ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { room_code } = req.body;
    if (!room_code) {
      return res.status(400).json({ error: 'Room code is required.' });
    }

    // This function doesn't actually find the location itself.
    // It simply tells all clients that the game has begun.
    // The clients will then fetch their first location individually.
    // (A more advanced version would have the server find one location and broadcast it).

    const channel = supabase.channel(`game-${room_code}`);
    await channel.send({
      type: 'broadcast',
      event: 'game_started',
      payload: { message: 'The game is starting now!' },
    });

    // Update the room status to 'in-progress'
    await supabase
      .from('rooms')
      .update({ status: 'in-progress' })
      .eq('room_code', room_code);

    return res.status(200).json({ message: 'Game start event broadcasted.' });

  } catch (error) {
    console.error('Error starting game:', error.message);
    return res.status(500).json({ error: 'An internal error occurred.' });
  }
}