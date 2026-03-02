// Unified API Router - All endpoints in one
const webhookHandler = require('./webhook-v8');
const appHandler = require('./app/index');
const voiceHandler = require('./voice/index');

module.exports = async function handler(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  // Route to appropriate handler
  if (pathname.startsWith('/api/webhook')) {
    return webhookHandler(req, res);
  }
  
  if (pathname.startsWith('/api/app')) {
    return appHandler(req, res);
  }
  
  if (pathname.startsWith('/api/voice')) {
    return voiceHandler(req, res);
  }
  
  // Default health check
  return res.json({
    status: 'ok',
    version: '8.0',
    endpoints: ['/api/webhook', '/api/app', '/api/voice']
  });
};
