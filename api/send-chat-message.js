// api/send-chat-message.js

// Using require for better compatibility in Vercel's Node.js environment
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Add CORS headers to allow requests from your game
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle the browser's pre-flight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { room_code, sender, message } = req.body;

    // Basic validation
    if (!room_code || !sender || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    
    // Get the specific channel for this game room
    const channel = supabase.channel(room_code);

    // Broadcast the message directly to everyone in the channel
    await channel.send({
      type: 'broadcast',
      event: 'chat_message',
      payload: { 
        sender: sender, 
        message: message, // Sending the original message without filtering
        sent_at: new Date().toISOString() 
      },
    });

    // Send a success response
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error in send-chat-message:', error.message);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
}