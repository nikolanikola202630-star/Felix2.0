// API для проверки подключения к базе данных
const { checkConnection, getStats } = require('../../lib/supabase-client');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверить подключение
    const connectionStatus = await checkConnection();
    
    // Получить статистику
    const stats = getStats();

    // Проверить переменные окружения
    const envCheck = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_KEY: !!process.env.SUPABASE_KEY,
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      GROQ_API_KEY: !!process.env.GROQ_API_KEY,
      NODE_ENV: process.env.NODE_ENV || 'development'
    };

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        ...connectionStatus,
        ...stats
      },
      environment: envCheck,
      status: connectionStatus.connected ? 'healthy' : 'degraded',
      message: connectionStatus.connected 
        ? 'All systems operational' 
        : 'Running in fallback mode (in-memory storage)'
    });

  } catch (error) {
    console.error('❌ Health check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
      status: 'unhealthy'
    });
  }
};
