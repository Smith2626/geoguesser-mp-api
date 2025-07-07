// api/send-chat-message.js

// --- THE FIX: Changed from 'import' to 'require' for better compatibility ---
const { createClient } = require('@supabase/supabase-js');
const Filter = require('bad-words');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const profanityFilter = new Filter();

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { room_code, sender, message } = req.body;

    if (!room_code || !sender || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    
    // Clean the message using the profanity filter
    const cleanMessage = profanityFilter.clean(message);

    // Get the specific channel for this game room
    const channel = supabase.channel(room_code);

    // Broadcast the cleaned message to everyone in the channel
    await channel.send({
      type: 'broadcast',
      event: 'chat_message',
      payload: { sender, message: cleanMessage, sent_at: new Date().toISOString() },
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error sending chat message:', error.message);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
}
