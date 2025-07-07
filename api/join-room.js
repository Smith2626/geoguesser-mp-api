import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
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

    if (!room_code || room_code.length !== 4) {
      return res.status(400).json({ error: 'A valid 4-character room code is required.' });
    }

    // Check if a room exists with this code AND its status is 'waiting'
    const { data, error } = await supabase
      .from('rooms')
      .select('room_code')
      .eq('room_code', room_code.toUpperCase())
      .eq('status', 'waiting')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Room not found or is already in progress.' });
    }

    // If we found the room, send a success message
    return res.status(200).json({ message: 'Room found!', room_code: data.room_code });

  } catch (error) {
    console.error('Error joining room:', error.message);
    return res.status(500).json({ error: 'Failed to join room.' });
  }
}