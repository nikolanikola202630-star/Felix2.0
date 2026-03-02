// Unified API Router - v8.6 Working
const webhookHandler = require('./webhook-test-simple');
const miniappDataHandler = require('./miniapp-data');

module.exports = async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  console.log('Request:', pathname);
  
  // Route to webhook handler
  if (pathname === '/api/webhook' || pathname.includes('webhook')) {
    return webhookHandler(req, res);
  }
  
  // Route to miniapp data handler
  if (pathname === '/api/miniapp-data' || pathname.includes('miniapp-data')) {
    return miniappDataHandler(req, res);
  }
  
  // Default health check
  return res.json({
    status: 'ok',
    version: '8.6-test',
    endpoints: ['/api/webhook', '/api/miniapp-data'],
    pathname,
    timestamp: new Date().toISOString()
  });
};
