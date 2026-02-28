import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const db = {
  // Get or create user
  async getOrCreateUser(telegramUser) {
    const { id, username, first_name, last_name } = telegramUser;
    
    const result = await pool.query(
      `INSERT INTO users (id, username, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
       SET username = $2, first_name = $3, last_name = $4, updated_at = NOW()
       RETURNING *`,
      [id, username, first_name, last_name]
    );
    
    return result.rows[0];
  },

  // Save message
  async saveMessage(userId, role, content) {
    const result = await pool.query(
      `INSERT INTO messages (user_id, role, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, role, content]
    );
    
    return result.rows[0];
  },

  // Get conversation history (last N messages)
  async getHistory(userId, limit = 10) {
    const result = await pool.query(
      `SELECT role, content, created_at
       FROM messages
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows.reverse(); // Oldest first
  },

  // Clear user history
  async clearHistory(userId) {
    await pool.query(
      `DELETE FROM messages WHERE user_id = $1`,
      [userId]
    );
  },

  // Save voice message
  async saveVoiceMessage(userId, fileId, transcription, duration) {
    const result = await pool.query(
      `INSERT INTO voice_messages (user_id, file_id, transcription, duration)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, fileId, transcription, duration]
    );
    
    return result.rows[0];
  },

  // Get user stats
  async getUserStats(userId) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN role = 'assistant' THEN 1 END) as bot_messages,
        MIN(created_at) as first_message,
        MAX(created_at) as last_message
       FROM messages
       WHERE user_id = $1`,
      [userId]
    );
    
    return result.rows[0];
  }
};
