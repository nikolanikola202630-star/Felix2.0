// Unified API Router - v8.6 Working
const webhookHandler = require('./webhook-v8-fixed');

module.exports = async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  console.log('Request:', pathname);
  
  // Route to webhook handler
  if (pathname === '/api/webhook' || pathname.includes('webhook')) {
    return webhookHandler(req, res);
  }
  
  // Default health check
  return res.json({
    status: 'ok',
    version: '8.6-fixed',
    endpoints: ['/api/webhook'],
    pathname,
    timestamp: new Date().toISOString()
  });
};
