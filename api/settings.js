// Felix Academy - Settings API
// EGOIST ECOSYSTEM Edition
// Full personalization system

const { db } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return res.status(400).json({ error: 'user_id required' });
    }

    if (req.method === 'GET') {
      // Get user settings
      const settings = await db.getUserSettings(userId);
      return res.json({ 
        success: true,
        settings: settings || {}
      });
    }

    if (req.method === 'POST') {
      // Save user settings
      const { settings } = req.body;
      
      if (!settings) {
        return res.status(400).json({ error: 'settings required' });
      }

      // Update settings in database
      await db.updateUserSettings(userId, {
        ai_temperature: settings['ai-temperature'],
        ai_model: settings['ai-model'],
        theme: settings.theme,
        notifications_enabled: settings['notifications-lessons']
      });

      // Save full settings as JSON
      await db.query(
        `UPDATE user_settings 
         SET preferences = $2, updated_at = NOW()
         WHERE user_id = $1`,
        [userId, JSON.stringify(settings)]
      );

      return res.json({ 
        success: true,
        message: 'Settings saved'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({ error: error.message });
  }
};
