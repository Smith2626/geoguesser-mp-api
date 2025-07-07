import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using the secret keys from Vercel
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Helper function to generate a random 4-letter code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow access from any domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const room_code = generateRoomCode();

    // Insert the new room into your 'rooms' table
    const { data, error } = await supabase
      .from('rooms')
      .insert({ room_code: room_code, status: 'waiting' })
      .select()
      .single();

    if (error) throw error;

    // Send the unique room code back to the player who created it
    return res.status(201).json({ room_code: data.room_code });

  } catch (error) {
    console.error('Error creating room:', error.message);
    return res.status(500).json({ error: 'Failed to create a new room.' });
  }
}