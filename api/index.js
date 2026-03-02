// Unified API router for Vercel routes
const routeHandlers = {
  '/api/webhook': require('./webhook-test.js'),
  '/api/app': require('./app/index.js'),
  '/api/voice': require('./voice/index.js'),
  '/api/admin': require('./admin-api.js'),
  '/api/miniapp-data': require('./miniapp-data.js'),
  '/api/sync': require('./sync.js'),
  '/api/stats': require('./stats.js'),
  '/api/automation': require('./automation.js'),
  '/api/partner': require('./partner.js'),
  '/api/support': require('./support.js')
};

module.exports = async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    const matchedRoute = Object.keys(routeHandlers).find((route) => pathname === route || pathname.startsWith(`${route}/`));

    if (matchedRoute) {
      return routeHandlers[matchedRoute](req, res);
    }

    return res.status(200).json({
      status: 'ok',
      version: '9.0',
      bot: 'Felix v9.0',
      pathname,
      availableRoutes: Object.keys(routeHandlers),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Router error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal router error',
      details: error.message
    });
  }
};
