import { db } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const messages = await db.getHistory(parseInt(userId), 50);

    return res.status(200).json({
      ok: true,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at
      }))
    });
  } catch (error) {
    console.error('History API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
