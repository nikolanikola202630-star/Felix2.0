// Главный роутер API - объединяет все endpoints
// Решает проблему лимита Vercel (12 функций на Hobby плане)

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Роутинг по группам
    
    // 1. Courses группа
    if (pathname.startsWith('/api/courses') || 
        pathname.startsWith('/api/lessons') ||
        pathname.startsWith('/api/learning') ||
        pathname.startsWith('/api/history') ||
        pathname.startsWith('/api/search')) {
      return require('./routes/courses')(req, res);
    }

    // 2. Payments группа
    if (pathname.startsWith('/api/payments')) {
      return require('./routes/payments')(req, res);
    }

    // 3. Admin группа
    if (pathname.startsWith('/api/admin')) {
      return require('./routes/admin')(req, res);
    }

    // 4. Partner группа
    if (pathname.startsWith('/api/partner-enhanced')) {
      return require('./partner-enhanced')(req, res);
    }
    
    if (pathname.startsWith('/api/partner')) {
      return require('./routes/partner')(req, res);
    }

    // 5. Admin Enhanced
    if (pathname.startsWith('/api/admin-enhanced')) {
      return require('./admin-enhanced')(req, res);
    }

    // 6. Referral Bot
    if (pathname.startsWith('/api/referral-bot')) {
      return require('./referral-bot')(req, res);
    }

    // 7. Health & System группа
    if (pathname.startsWith('/api/health') ||
        pathname.startsWith('/api/webhook') ||
        pathname.startsWith('/api/miniapp') ||
        pathname.startsWith('/api/voice') ||
        pathname.startsWith('/api/analytics') ||
        pathname.startsWith('/api/community') ||
        pathname.startsWith('/api/settings') ||
        pathname.startsWith('/api/sync') ||
        pathname.startsWith('/api/export')) {
      return require('./routes/system')(req, res);
    }

    // 404 - endpoint не найден
    return res.status(404).json({
      error: 'Endpoint not found',
      path: pathname
    });

  } catch (error) {
    console.error('Router error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
