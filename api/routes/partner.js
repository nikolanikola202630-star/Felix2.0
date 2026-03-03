// Роутер для всех partner endpoints

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // /api/partner (главный)
    if (pathname === '/api/partner') {
      return require('../partner')(req, res);
    }

    // /api/partner-stats
    if (pathname === '/api/partner-stats') {
      return require('../partner-stats')(req, res);
    }

    // 404
    return res.status(404).json({
      error: 'Partner endpoint not found',
      path: pathname
    });

  } catch (error) {
    console.error('Partner router error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
