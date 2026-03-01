import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN role = 'assistant' THEN 1 END) as bot_messages,
        MIN(created_at) as first_message_at,
        MAX(created_at) as last_message_at
       FROM messages
       WHERE user_id = $1`,
      [parseInt(userId)]
    );

    const voiceResult = await pool.query(
      `SELECT COUNT(*) as voice_messages
       FROM voice_messages
       WHERE user_id = $1`,
      [parseInt(userId)]
    );

    return res.status(200).json({
      ok: true,
      total_messages: parseInt(result.rows[0].total_messages) || 0,
      user_messages: parseInt(result.rows[0].user_messages) || 0,
      bot_messages: parseInt(result.rows[0].bot_messages) || 0,
      voice_messages: parseInt(voiceResult.rows[0].voice_messages) || 0,
      first_message_at: result.rows[0].first_message_at,
      last_message_at: result.rows[0].last_message_at
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
