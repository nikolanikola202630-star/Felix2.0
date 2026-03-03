// Felix Academy - Enhanced Partner API
// EGOIST ECOSYSTEM Edition
// Full referral system with database

const { db } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Routes
    if (pathname === '/api/partner-enhanced/info') {
      return await getPartnerInfo(req, res);
    }

    if (pathname === '/api/partner-enhanced/stats') {
      return await getPartnerStats(req, res);
    }

    if (pathname === '/api/partner-enhanced/referrals') {
      return await getPartnerReferrals(req, res);
    }

    if (pathname === '/api/partner-enhanced/apply') {
      return await applyForPartnership(req, res);
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('Partner API error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get partner info
async function getPartnerInfo(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    const partner = await db.getPartnerAccount(userId);

    if (!partner) {
      return res.json({
        is_partner: false,
        message: 'Вы еще не являетесь партнером'
      });
    }

    // Get user info
    const user = await db.getUser(userId);

    return res.json({
      is_partner: true,
      is_active: partner.is_active,
      referral_code: partner.referral_code,
      referral_link: `https://t.me/felix_ref_bot?start=ref_${userId}`,
      created_at: partner.created_at,
      user: {
        id: user.id,
        first_name: user.first_name,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Get partner info error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get partner stats
async function getPartnerStats(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    const partner = await db.getPartnerAccount(userId);

    if (!partner) {
      return res.json({
        is_partner: false,
        stats: null
      });
    }

    // Get referral stats
    const stats = await db.getPartnerReferralStats(userId, 10);

    // Get earnings from purchases table
    let earnings = {
      total: 0,
      pending: 0,
      paid: 0,
      available: 0
    };
    
    try {
      const earningsResult = await db.query(`
        SELECT 
          COALESCE(SUM(partner_commission), 0) as total,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN partner_commission ELSE 0 END), 0) as pending,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN partner_commission ELSE 0 END), 0) as paid
        FROM purchases 
        WHERE partner_id = $1
      `, [userId]);
      
      if (earningsResult && earningsResult.rows.length > 0) {
        earnings = {
          total: parseFloat(earningsResult.rows[0].total) || 0,
          pending: parseFloat(earningsResult.rows[0].pending) || 0,
          paid: parseFloat(earningsResult.rows[0].paid) || 0,
          available: parseFloat(earningsResult.rows[0].paid) || 0
        };
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      // Keep default earnings object
    }

    // Get recent referrals
    const recentReferrals = stats.clicks.slice(0, 5).map(click => ({
      date: click.clicked_at,
      is_unique: click.is_unique,
      blocked: !!click.blocked_reason
    }));

    return res.json({
      is_partner: true,
      stats: {
        total_clicks: stats.total,
        unique_clicks: stats.unique,
        blocked_clicks: stats.blocked,
        conversion_rate: stats.unique > 0 ? ((stats.unique / stats.total) * 100).toFixed(1) : 0
      },
      earnings,
      recent_referrals: recentReferrals
    });
  } catch (error) {
    console.error('Get partner stats error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get partner referrals list
async function getPartnerReferrals(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('user_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (!userId) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    const partner = await db.getPartnerAccount(userId);

    if (!partner) {
      return res.json({
        is_partner: false,
        referrals: []
      });
    }

    const stats = await db.getPartnerReferralStats(userId, limit);

    return res.json({
      is_partner: true,
      referrals: stats.clicks.map(click => ({
        id: click.id,
        date: click.clicked_at,
        referer: click.referer,
        is_unique: click.is_unique,
        blocked: !!click.blocked_reason,
        blocked_reason: click.blocked_reason
      })),
      total: stats.total
    });
  } catch (error) {
    console.error('Get partner referrals error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Apply for partnership
async function applyForPartnership(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, first_name, username, message } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    // Check if already partner
    const existing = await db.getPartnerAccount(user_id);

    if (existing) {
      return res.json({
        success: false,
        message: existing.is_active 
          ? 'Вы уже являетесь партнером' 
          : 'Ваша заявка на рассмотрении'
      });
    }

    // Save application (for now, just log it)
    await db.logError('partner-application', `New application from ${user_id}`, {
      user_id,
      first_name,
      username,
      message
    });

    return res.json({
      success: true,
      message: 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.'
    });
  } catch (error) {
    console.error('Apply for partnership error:', error);
    return res.status(500).json({ error: error.message });
  }
}
