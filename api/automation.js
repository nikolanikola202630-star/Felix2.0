const selfLearning = require('../lib/automation/self-learning');
const userSync = require('../lib/sync/user-sync');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const health = await selfLearning.getSystemHealth();
      return res.status(200).json({
        success: true,
        health,
        cache: userSync.getCacheStats(),
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      const action = req.body?.action;

      if (action === 'runLearningCycle') {
        await selfLearning.runLearningCycle();
        return res.status(200).json({ success: true, message: 'Learning cycle completed' });
      }

      if (action === 'analyzeAllUsers') {
        await selfLearning.analyzeAllUsers();
        return res.status(200).json({ success: true, message: 'Users analyzed' });
      }

      if (action === 'syncUser') {
        const userId = req.body?.userId;
        if (!userId) return res.status(400).json({ success: false, error: 'userId required' });
        const data = await userSync.syncUserData(userId);
        return res.status(200).json({ success: true, data });
      }

      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Automation API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
