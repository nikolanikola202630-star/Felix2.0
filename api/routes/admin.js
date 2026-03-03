// Роутер для всех admin endpoints

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // /api/admin (главный)
    if (pathname === '/api/admin') {
      return require('../admin')(req, res);
    }

    // /api/admin-api
    if (pathname === '/api/admin-api') {
      return require('../admin-api')(req, res);
    }

    // /api/admin-courses
    if (pathname === '/api/admin-courses') {
      return require('../admin-courses')(req, res);
    }

    // /api/admin/courses-manage
    if (pathname === '/api/admin/courses-manage') {
      return require('../admin/courses-manage')(req, res);
    }

    // 404
    return res.status(404).json({
      error: 'Admin endpoint not found',
      path: pathname
    });

  } catch (error) {
    console.error('Admin router error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
