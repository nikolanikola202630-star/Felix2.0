import { db } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    await db.clearHistory(parseInt(userId));

    return res.status(200).json({
      ok: true,
      message: 'History cleared'
    });
  } catch (error) {
    console.error('Clear API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
