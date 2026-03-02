// Mini App API - Main endpoint
module.exports = async (req, res) => {
  const { action, userId } = req.query;

  try {
    if (action === 'getProfile') {
      // Mock profile data
      return res.json({
        success: true,
        profile: {
          id: userId || 'demo',
          username: 'User',
          level: 5,
          xp: 2500,
          xpToNext: 3000,
          streak: 7,
          totalMessages: 150,
          achievements: 12,
          avatar: '👤',
          style: 'casual',
          theme: 'dark'
        }
      });
    }

    res.json({ success: false, error: 'Unknown action' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
