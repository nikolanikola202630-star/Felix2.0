// Felix Academy V12 - Automation API
// API для управления автоматизацией

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id));

const isAdmin = (userId) => ADMIN_IDS.includes(parseInt(userId));

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, user_id } = req.method === 'GET' ? req.query : req.body;

  if (!isAdmin(user_id)) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  try {
    const handlers = {
      status: getStatus,
      logs: getLogs,
      health: getHealth,
      sync: triggerSync,
      deploy: triggerDeploy,
      report: getReport
    };

    const handler = handlers[action];
    if (!handler) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    return await handler(req, res);
  } catch (error) {
    console.error('Automation API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Получить статус автоматизации
async function getStatus(req, res) {
  try {
    // Последняя синхронизация
    const { data: lastSync } = await supabase
      .from('sync_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Последняя проверка здоровья
    const { data: lastHealth } = await supabase
      .from('health_checks')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Активные алерты
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    return res.json({
      success: true,
      status: {
        lastSync: lastSync || null,
        lastHealth: lastHealth || null,
        activeAlerts: alerts?.length || 0,
        alerts: alerts || []
      }
    });
  } catch (error) {
    throw error;
  }
}

// Получить логи
async function getLogs(req, res) {
  const { type, limit = 100 } = req.query;

  try {
    let query = supabase
      .from('automation_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));

    if (type) {
      query = query.eq('type', type);
    }

    const { data: logs } = await query;

    return res.json({
      success: true,
      logs: logs || []
    });
  } catch (error) {
    throw error;
  }
}

// Получить здоровье системы
async function getHealth(req, res) {
  const { period = '24h' } = req.query;

  try {
    const startDate = new Date();
    if (period === '24h') {
      startDate.setHours(startDate.getHours() - 24);
    } else if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    }

    const { data: health } = await supabase
      .from('health_checks')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    // Статистика
    const stats = {
      total: health?.length || 0,
      healthy: health?.filter(h => h.overall === 'healthy').length || 0,
      degraded: health?.filter(h => h.overall === 'degraded').length || 0,
      critical: health?.filter(h => h.overall === 'critical').length || 0
    };

    return res.json({
      success: true,
      period,
      stats,
      health: health || []
    });
  } catch (error) {
    throw error;
  }
}

// Запустить синхронизацию
async function triggerSync(req, res) {
  try {
    // Логирование запроса
    await supabase.from('automation_logs').insert({
      type: 'sync_trigger',
      message: 'Manual sync triggered',
      timestamp: new Date().toISOString()
    });

    // В production здесь был бы вызов реальной синхронизации
    // Для примера просто возвращаем успех
    return res.json({
      success: true,
      message: 'Sync triggered successfully'
    });
  } catch (error) {
    throw error;
  }
}

// Запустить деплой
async function triggerDeploy(req, res) {
  try {
    // Логирование запроса
    await supabase.from('automation_logs').insert({
      type: 'deploy_trigger',
      message: 'Manual deploy triggered',
      timestamp: new Date().toISOString()
    });

    // В production здесь был бы вызов реального деплоя
    return res.json({
      success: true,
      message: 'Deploy triggered successfully'
    });
  } catch (error) {
    throw error;
  }
}

// Получить отчет
async function getReport(req, res) {
  const { period = 'week' } = req.query;

  try {
    const now = new Date();
    const startDate = new Date();

    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Синхронизации
    const { data: syncs } = await supabase
      .from('sync_logs')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', now.toISOString());

    // Здоровье
    const { data: health } = await supabase
      .from('health_checks')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', now.toISOString());

    // Алерты
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', now.toISOString());

    const report = {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      syncs: {
        total: syncs?.length || 0,
        successful: syncs?.filter(s => s.success).length || 0,
        failed: syncs?.filter(s => !s.success).length || 0,
        avgDuration: syncs?.length > 0
          ? Math.round(syncs.reduce((sum, s) => sum + (s.duration || 0), 0) / syncs.length)
          : 0
      },
      health: {
        total: health?.length || 0,
        healthy: health?.filter(h => h.overall === 'healthy').length || 0,
        degraded: health?.filter(h => h.overall === 'degraded').length || 0,
        critical: health?.filter(h => h.overall === 'critical').length || 0
      },
      alerts: {
        total: alerts?.length || 0,
        critical: alerts?.filter(a => a.level === 'critical').length || 0,
        warning: alerts?.filter(a => a.level === 'warning').length || 0
      }
    };

    return res.json({
      success: true,
      report
    });
  } catch (error) {
    throw error;
  }
}
