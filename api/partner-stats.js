// API для статистики партнеров
const { db } = require('../lib/db-academy');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { user_id, action } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }

  try {
    if (req.method === 'GET') {
      // Получить статистику партнера
      const stats = await db.getPartnerStats(user_id);
      return res.json(stats);
    }

    if (req.method === 'POST') {
      if (action === 'request-payout') {
        // Запросить выплату
        const { amount, method, details } = req.body;
        
        const payout = await db.requestPayout(user_id, amount, method, details);
        return res.json(payout);
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Partner stats API error:', error);
    return res.status(500).json({ error: error.message });
  }
};
