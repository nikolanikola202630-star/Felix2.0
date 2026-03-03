// Роутер для всех endpoints связанных с платежами

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // /api/payments (главный)
    if (pathname === '/api/payments') {
      return require('../payments')(req, res);
    }

    // /api/payments/create-invoice
    if (pathname === '/api/payments/create-invoice') {
      return require('../payments/create-invoice')(req, res);
    }

    // /api/payments/webhook
    if (pathname === '/api/payments/webhook') {
      return require('../payments/webhook')(req, res);
    }

    // /api/payments/refund
    if (pathname === '/api/payments/refund') {
      return require('../payments/refund')(req, res);
    }

    // 404
    return res.status(404).json({
      error: 'Payments endpoint not found',
      path: pathname
    });

  } catch (error) {
    console.error('Payments router error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
