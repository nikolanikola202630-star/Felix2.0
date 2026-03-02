// Simple test webhook
module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({
      status: 'ok',
      bot: 'Felix v8.6 Test',
      timestamp: new Date().toISOString(),
      message: 'Simple test webhook working!'
    });
  }

  return res.json({ ok: true });
};
