// Роутер для системных endpoints (health, webhook, и т.д.)

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // /api/health/database
    if (pathname === '/api/health/database') {
      return require('../health/database')(req, res);
    }

    // /api/webhook
    if (pathname === '/api/webhook') {
      return require('../webhook-handler')(req, res);
    }

    // /api/webhook-test
    if (pathname === '/api/webhook-test') {
      return require('../webhook-test')(req, res);
    }

    // /api/webhook/index
    if (pathname === '/api/webhook/index') {
      return require('../webhook/index')(req, res);
    }

    // /api/miniapp
    if (pathname === '/api/miniapp') {
      return require('../miniapp')(req, res);
    }

    // /api/miniapp-data
    if (pathname === '/api/miniapp-data') {
      return require('../miniapp-data')(req, res);
    }

    // /api/voice
    if (pathname === '/api/voice') {
      return require('../voice')(req, res);
    }

    // /api/voice/index
    if (pathname === '/api/voice/index') {
      return require('../voice/index')(req, res);
    }

    // /api/analytics
    if (pathname === '/api/analytics') {
      return require('../analytics')(req, res);
    }

    // /api/community - all community endpoints
    if (pathname.startsWith('/api/community')) {
      return require('../community')(req, res);
    }

    // /api/settings
    if (pathname.startsWith('/api/settings')) {
      return require('../settings')(req, res);
    }

    // /api/sync
    if (pathname === '/api/sync') {
      return require('../sync')(req, res);
    }

    // /api/export
    if (pathname === '/api/export') {
      return require('../export')(req, res);
    }

    // /api/stats
    if (pathname === '/api/stats') {
      return require('../stats')(req, res);
    }

    // /api/support
    if (pathname === '/api/support') {
      return require('../support')(req, res);
    }

    // /api/automation
    if (pathname === '/api/automation') {
      return require('../automation')(req, res);
    }

    // 404
    return res.status(404).json({
      error: 'System endpoint not found',
      path: pathname
    });

  } catch (error) {
    console.error('System router error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};


    // /api/ai-chat-folders (все подпути)
    if (pathname.startsWith('/api/ai-chat-folders')) {
      return require('../ai-chat-folders')(req, res);
    }
