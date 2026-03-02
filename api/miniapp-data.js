// Mini App Data API
const db = require('../lib/db').db;

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    // Get user data
    const user = await db.getUser(parseInt(userId));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user stats
    const stats = await db.getUserStats(parseInt(userId));
    
    // Get user settings
    const settings = await db.getUserSettings(parseInt(userId));
    
    // Get user courses
    let courses = [];
    try {
      courses = await db.getUserCourses(parseInt(userId));
    } catch (e) {
      console.log('Courses not available:', e.message);
    }
    
    // Get user achievements
    let achievements = [];
    try {
      achievements = await db.getUserAchievements(parseInt(userId));
    } catch (e) {
      console.log('Achievements not available:', e.message);
    }

    // Get analytics
    let analytics = null;
    try {
      analytics = await db.getAnalytics(parseInt(userId));
    } catch (e) {
      console.log('Analytics not available:', e.message);
    }

    // Get partners
    let partners = [];
    try {
      partners = await db.getPartners();
    } catch (e) {
      console.log('Partners not available:', e.message);
    }

    // Get library
    let library = [];
    try {
      library = await db.getLibrary(parseInt(userId));
    } catch (e) {
      console.log('Library not available:', e.message);
    }

    // Return all data
    return res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        username: user.username,
        created_at: user.created_at
      },
      stats: {
        messages: stats.total_messages || 0,
        ai_requests: stats.by_command?.organize || 0,
        voice_messages: stats.by_type?.voice || 0,
        documents: stats.by_type?.document || 0
      },
      settings: {
        level: settings.level || 1,
        xp: settings.xp || 0,
        theme: settings.theme || 'dark',
        avatar: settings.avatar || null
      },
      courses: courses.map(c => ({
        id: c.id,
        title: c.title,
        progress: c.progress || 0,
        category: c.category
      })),
      achievements: achievements.map(a => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        earned_at: a.earned_at
      })),
      analytics: analytics || {
        totalTime: 0,
        lessonsCompleted: 0,
        streak: 0,
        avgScore: 0,
        dailyActivity: [],
        topicsProgress: []
      },
      partners: partners.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        logo_url: p.logo_url
      })),
      library: library.map(l => ({
        id: l.id,
        title: l.title,
        type: l.item_type,
        created_at: l.created_at
      }))
    });

  } catch (error) {
    console.error('Mini App API error:', error);
    return res.status(500).json({ 
      error: 'Internal error',
      message: error.message 
    });
  }
};
