// Роутер для всех endpoints связанных с курсами

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // /api/courses-full
    if (pathname === '/api/courses-full') {
      return require('../courses-full')(req, res);
    }

    // /api/courses
    if (pathname === '/api/courses') {
      return require('../courses')(req, res);
    }

    // /api/courses/check-access
    if (pathname === '/api/courses/check-access') {
      return require('../courses/check-access')(req, res);
    }

    // /api/courses/my-courses
    if (pathname === '/api/courses/my-courses') {
      return require('../courses/my-courses')(req, res);
    }

    // /api/lessons
    if (pathname === '/api/lessons') {
      return require('../lessons')(req, res);
    }

    // /api/learning
    if (pathname === '/api/learning') {
      return require('../learning')(req, res);
    }

    // /api/history
    if (pathname === '/api/history') {
      return require('../history')(req, res);
    }

    // /api/search
    if (pathname === '/api/search') {
      return require('../search')(req, res);
    }

    // 404
    return res.status(404).json({
      error: 'Courses endpoint not found',
      path: pathname
    });

  } catch (error) {
    console.error('Courses router error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
