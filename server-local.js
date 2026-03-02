// Felix Bot v9.0 - Local Development Server
// Запуск: node server-local.js

const http = require('http');
const webhookHandler = require('./api/webhook-test.js');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Собираем body для POST запросов
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      // Парсим body если есть
      if (body) {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      // Добавляем Express-like методы для совместимости
      res.status = function(code) {
        this.statusCode = code;
        return this;
      };

      res.json = function(data) {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(data));
        return this;
      };

      res.setHeader = res.setHeader || function(name, value) {
        this.writeHead(this.statusCode || 200, { [name]: value });
      };

      // Вызываем webhook handler
      await webhookHandler(req, res);
    } catch (error) {
      console.error('Server error:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Internal server error',
          message: error.message 
        }));
      }
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log('\n🚀 Felix Bot v9.0 - Local Server Started!\n');
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`📍 Webhook endpoint: http://localhost:${PORT}/api/webhook`);
  console.log(`\n🧪 Test commands:`);
  console.log(`   Health check: curl http://localhost:${PORT}/api/webhook`);
  console.log(`   Or: Invoke-RestMethod -Uri "http://localhost:${PORT}/api/webhook"`);
  console.log(`\n🔗 To connect Telegram:`);
  console.log(`   1. Install ngrok: https://ngrok.com/download`);
  console.log(`   2. Run: ngrok http ${PORT}`);
  console.log(`   3. Copy HTTPS URL from ngrok`);
  console.log(`   4. Set webhook: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<NGROK_URL>/api/webhook`);
  console.log(`\n⏹️  Press Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
