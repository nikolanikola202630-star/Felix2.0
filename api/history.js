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
      `SELECT role, content, created_at
       FROM messages
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [parseInt(userId)]
    );

    return res.status(200).json({
      ok: true,
      messages: result.rows.reverse()
    });
  } catch (error) {
    console.error('History API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
