// Admin API
const partners = [
  { id: 1, name: 'TechCorp', logo: '🏢', status: 'active', category: 'Технологии' },
  { id: 2, name: 'EduPlatform', logo: '📚', status: 'active', category: 'Образование' },
  { id: 3, name: 'StartupHub', logo: '🚀', status: 'pending', category: 'Стартапы' }
];

module.exports = async (req, res) => {
  const { action, userId } = req.query;

  try {
    if (action === 'getPartners') {
      return res.json({
        success: true,
        partners: partners
      });
    }

    if (action === 'getUserSettings') {
      return res.json({
        success: true,
        settings: {
          avatar: '👤',
          username: 'User',
          style: 'casual',
          theme: 'dark',
          notifications: true
        }
      });
    }

    if (req.method === 'POST') {
      const body = req.body;
      
      if (body.action === 'saveSettings') {
        return res.json({
          success: true,
          message: 'Настройки сохранены'
        });
      }

      if (body.action === 'completeTask') {
        return res.json({
          success: true,
          xpEarned: body.xp || 50,
          newLevel: false
        });
      }
    }

    res.json({ success: false, error: 'Unknown action' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
