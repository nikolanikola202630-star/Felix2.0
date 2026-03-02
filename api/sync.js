// User Sync API Endpoint
const userSync = require('../lib/sync/user-sync');
const adaptiveLearning = require('../lib/learning/adaptive-learning');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, userId, data } = req.method === 'GET' ? req.query : req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    switch (action) {
      case 'getUserData':
        const userData = await userSync.syncUserData(userId);
        return res.json({ success: true, data: userData });

      case 'updateStats':
        await userSync.updateStats(userId, data);
        return res.json({ success: true });

      case 'trackActivity':
        const reward = await userSync.trackActivity(userId, data);
        return res.json({ success: true, reward });

      case 'getLearningProfile':
        const profile = adaptiveLearning.getUserProfile(userId);
        return res.json({ success: true, profile });

      case 'getRecommendation':
        const recommendation = await adaptiveLearning.recommendNextLesson(
          userId,
          data?.completedLessons || []
        );
        return res.json({ success: true, recommendation });

      case 'trackProgress':
        const updatedProfile = await adaptiveLearning.trackProgress(
          userId,
          data.lessonId,
          data.score,
          data.timeSpent
        );
        return res.json({ success: true, profile: updatedProfile });

      case 'generateContent':
        const content = await adaptiveLearning.generatePersonalizedContent(
          userId,
          data.topic,
          data.contentType || 'lesson'
        );
        return res.json({ success: true, content });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Sync API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
