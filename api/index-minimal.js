// Minimal router for debugging
module.exports = async function handler(req, res) {
  return res.json({
    status: 'ok',
    version: '8.6-minimal',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
};
