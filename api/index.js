// Unified API Router - All endpoints in one
const webhookHandler = require('./webhook-simple-v8');
const appHandler = require('./app/index');
const voiceHandler = require('./voice/index');

module.exports = async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  console.log('Request:', pathname);
  
  // Route to appropriate handler
  if (pathname === '/api/webhook' || pathname.includes('webhook')) {
    return webhookHandler(req, res);
  }
  
  if (pathname === '/api/app' || pathname.includes('/app')) {
    return appHandler(req, res);
  }
  
  if (pathname === '/api/voice' || pathname.includes('/voice')) {
    return voiceHandler(req, res);
  }
  
  // Default health check
  return res.json({
    status: 'ok',
    version: '8.3',
    endpoints: ['/api/webhook', '/api/app', '/api/voice'],
    pathname
  });
};
