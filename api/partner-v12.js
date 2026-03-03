// Felix Academy V12 - Partner API
// Полный API для партнерской панели

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, user_id } = req.method === 'GET' ? req.query : req.body;

  if (!user_id) {
    return res.status(400).json({ success: false, error: 'User ID required' });
  }

  try {
    const handlers = {
      stats: getPartnerStats,
      referrals: getReferrals,
      earnings: getEarnings,
      courses: getPartnerCourses,
      settings: getSettings,
      'update-settings': updateSettings
    };

    const handler = handlers[action];
    if (!handler) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    return await handler(req, res, user_id);
  } catch (error) {
    console.error('Partner API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

async function getPartnerStats(req, res, userId) {
  // Проверка партнера
  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!partner) {
    return res.status(404).json({ success: false, error: 'Partner not found' });
  }

  // Рефералы
  const { count: totalReferrals } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('partner_id', partner.id);

  // Активные рефералы (купили что-то)
  const { count: activeReferrals } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('partner_id', partner.id)
    .eq('status', 'active');

  // Заработок
  const { data: earnings } = await supabase
    .from('partner_earnings')
    .select('amount')
    .eq('partner_id', partner.id);

  const totalEarnings = earnings?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  // Конверсия
  const conversionRate = totalReferrals > 0 
    ? ((activeReferrals / totalReferrals) * 100).toFixed(2)
    : 0;

  return res.json({
    success: true,
    stats: {
      totalReferrals: totalReferrals || 0,
      activeReferrals: activeReferrals || 0,
      totalEarnings,
      conversionRate,
      referralLink: `https://t.me/your_bot?start=ref_${partner.id}`
    }
  });
}

async function getReferrals(req, res, userId) {
  const { limit = 100 } = req.query;

  const { data: partner } = await supabase
    .from('partners')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!partner) {
    return res.json({ success: true, referrals: [] });
  }

  const { data: referrals } = await supabase
    .from('referrals')
    .select('*, users(first_name, username)')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  return res.json({ success: true, referrals: referrals || [] });
}

async function getEarnings(req, res, userId) {
  const { limit = 100 } = req.query;

  const { data: partner } = await supabase
    .from('partners')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!partner) {
    return res.json({ success: true, earnings: [] });
  }

  const { data: earnings } = await supabase
    .from('partner_earnings')
    .select('*')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  return res.json({ success: true, earnings: earnings || [] });
}

async function getPartnerCourses(req, res, userId) {
  const { data: partner } = await supabase
    .from('partners')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!partner) {
    return res.json({ success: true, courses: [] });
  }

  const { data: courses } = await supabase
    .from('partner_courses')
    .select('*, courses(*)')
    .eq('partner_id', partner.id);

  return res.json({ success: true, courses: courses || [] });
}

async function getSettings(req, res, userId) {
  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!partner) {
    return res.status(404).json({ success: false, error: 'Partner not found' });
  }

  return res.json({ success: true, settings: partner });
}

async function updateSettings(req, res, userId) {
  const { updates } = req.body;

  const { data, error } = await supabase
    .from('partners')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return res.json({ success: true, settings: data });
}
