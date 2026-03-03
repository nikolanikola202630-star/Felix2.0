// Felix Academy - Enhanced Admin API
// EGOIST ECOSYSTEM Edition
// Full database integration

const { db } = require('../lib/db');

const ADMIN_IDS = [1907288209, 8264612178]; // Telegram ID администраторов

// Check admin rights
function isAdmin(userId) {
  return ADMIN_IDS.includes(parseInt(userId));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const adminId = url.searchParams.get('admin_id');

    // Check admin rights
    if (!adminId || !isAdmin(adminId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Routes
    if (pathname === '/api/admin-enhanced/stats') {
      return await getStats(req, res);
    }

    if (pathname === '/api/admin-enhanced/users') {
      return await getUsers(req, res);
    }

    if (pathname === '/api/admin-enhanced/partners') {
      return await getPartners(req, res);
    }

    if (pathname === '/api/admin-enhanced/partner/activate') {
      return await activatePartner(req, res);
    }

    if (pathname === '/api/admin-enhanced/partner/deactivate') {
      return await deactivatePartner(req, res);
    }

    if (pathname === '/api/admin-enhanced/referrals') {
      return await getReferrals(req, res);
    }

    if (pathname === '/api/admin-enhanced/logs') {
      return await getLogs(req, res);
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get system stats
async function getStats(req, res) {
  try {
    const [usersResult, messagesResult, partnersResult, coursesResult] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM messages'),
      db.query('SELECT COUNT(*) as count FROM partner_accounts WHERE is_active = true'),
      db.query('SELECT COUNT(*) as count FROM courses')
    ]);

    // AI stats
    const aiStatsResult = await db.query(`
      SELECT 
        SUM(ai_requests_today) as today,
        SUM(ai_requests_total) as total
      FROM user_settings
    `);

    // Recent activity
    const recentActivity = await db.query(`
      SELECT 
        u.first_name,
        u.username,
        m.content,
        m.created_at
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT 10
    `);

    return res.json({
      users: {
        total: parseInt(usersResult.rows[0].count),
        active_today: 0 // TODO: implement
      },
      messages: {
        total: parseInt(messagesResult.rows[0].count)
      },
      ai: {
        requests_today: parseInt(aiStatsResult.rows[0]?.today || 0),
        requests_total: parseInt(aiStatsResult.rows[0]?.total || 0)
      },
      partners: {
        active: parseInt(partnersResult.rows[0].count)
      },
      courses: {
        total: parseInt(coursesResult.rows[0].count)
      },
      recent_activity: recentActivity.rows
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get users list
async function getUsers(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const result = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.created_at,
        us.ai_requests_total,
        us.ai_requests_today,
        COUNT(DISTINCT m.id) as messages_count
      FROM users u
      LEFT JOIN user_settings us ON u.id = us.user_id
      LEFT JOIN messages m ON u.id = m.user_id
      GROUP BY u.id, us.ai_requests_total, us.ai_requests_today
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await db.query('SELECT COUNT(*) as count FROM users');

    return res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get partners list
async function getPartners(req, res) {
  try {
    const partners = await db.listPartnerAccounts(200);
    return res.json({ partners });
  } catch (error) {
    console.error('Get partners error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Activate partner
async function activatePartner(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, admin_id } = req.body;

    if (!user_id || !admin_id) {
      return res.status(400).json({ error: 'Missing user_id or admin_id' });
    }

    if (!isAdmin(admin_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const partner = await db.createOrActivatePartnerAccount(user_id, admin_id);

    return res.json({
      success: true,
      partner
    });
  } catch (error) {
    console.error('Activate partner error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Deactivate partner
async function deactivatePartner(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, admin_id } = req.body;

    if (!user_id || !admin_id) {
      return res.status(400).json({ error: 'Missing user_id or admin_id' });
    }

    if (!isAdmin(admin_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const partner = await db.deactivatePartnerAccount(user_id, admin_id);

    return res.json({
      success: true,
      partner
    });
  } catch (error) {
    console.error('Deactivate partner error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get referrals stats
async function getReferrals(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const partnerId = url.searchParams.get('partner_id');

    if (partnerId) {
      // Stats for specific partner
      const stats = await db.getPartnerReferralStats(partnerId, 100);
      return res.json(stats);
    } else {
      // Overall stats
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_clicks,
          COUNT(*) FILTER (WHERE is_unique = true) as unique_clicks,
          COUNT(*) FILTER (WHERE blocked_reason IS NOT NULL) as blocked_clicks,
          COUNT(DISTINCT partner_user_id) as active_partners
        FROM referral_clicks
      `);

      return res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Get referrals error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get system logs
async function getLogs(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const result = await db.query(`
      SELECT *
      FROM system_logs
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    return res.json({
      logs: result.rows
    });
  } catch (error) {
    console.error('Get logs error:', error);
    return res.status(500).json({ error: error.message });
  }
}
