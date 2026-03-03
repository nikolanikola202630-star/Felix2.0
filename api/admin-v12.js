// Felix Academy V12 - Admin API
// Полный API для админ панели с реальными данными

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id));

const isAdmin = (userId) => ADMIN_IDS.includes(parseInt(userId));

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, user_id } = req.method === 'GET' ? req.query : req.body;

  if (!isAdmin(user_id)) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  try {
    const handlers = {
      stats: getStats,
      users: getUsers,
      courses: getCourses,
      partners: getPartners,
      purchases: getPurchases,
      activity: getActivity
    };

    const handler = handlers[action];
    if (!handler) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    return await handler(req, res);
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

async function getStats(req, res) {
  const [users, courses, purchases, partners, aiChats] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('purchases').select('*', { count: 'exact', head: true }),
    supabase.from('partners').select('*', { count: 'exact', head: true }),
    supabase.from('ai_chat_history').select('*', { count: 'exact', head: true })
  ]);

  const { data: revenue } = await supabase
    .from('purchases')
    .select('amount')
    .eq('status', 'completed');

  return res.json({
    success: true,
    stats: {
      totalUsers: users.count || 0,
      totalCourses: courses.count || 0,
      totalPurchases: purchases.count || 0,
      totalPartners: partners.count || 0,
      aiRequests: aiChats.count || 0,
      totalRevenue: revenue?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    }
  });
}

async function getUsers(req, res) {
  const { limit = 100, offset = 0 } = req.query;

  const { data: users } = await supabase
    .from('users')
    .select('*, user_stats(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return res.json({ success: true, users: users || [] });
}

async function getCourses(req, res) {
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  return res.json({ success: true, courses: courses || [] });
}

async function getPartners(req, res) {
  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });

  return res.json({ success: true, partners: partners || [] });
}

async function getPurchases(req, res) {
  const { limit = 100 } = req.query;

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, users(first_name, username), courses(title)')
    .order('created_at', { ascending: false })
    .limit(limit);

  return res.json({ success: true, purchases: purchases || [] });
}

async function getActivity(req, res) {
  const { limit = 50 } = req.query;

  const { data: activity } = await supabase
    .from('user_history')
    .select('*, users(first_name, username)')
    .order('created_at', { ascending: false })
    .limit(limit);

  return res.json({ success: true, activity: activity || [] });
}
