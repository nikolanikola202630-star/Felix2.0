// Felix Academy - Local HTTP Server для Mini App
// Запуск: node server-local.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = '0.0.0.0';

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Определяем путь к файлу
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './miniapp/index.html';
  }

  // Получаем расширение файла
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = MIME_TYPES[extname] || 'application/octet-stream';

  // Читаем файл
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Файл не найден
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Файл не найден</h1>', 'utf-8');
      } else {
        // Ошибка сервера
        res.writeHead(500);
        res.end(`Ошибка сервера: ${error.code}`, 'utf-8');
      }
    } else {
      // Успешно
      res.writeHead(200, { 
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log('\n🚀 Felix Academy - Local Server Started!\n');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 Mini App: http://localhost:${PORT}/miniapp/index.html`);
  console.log(`\n📱 Доступные страницы:`);
  console.log(`   • http://localhost:${PORT}/miniapp/index.html - Главная (флагман)`);
  console.log(`   • http://localhost:${PORT}/miniapp/catalog.html - Каталог`);
  console.log(`   • http://localhost:${PORT}/miniapp/course.html - Курс`);
  console.log(`   • http://localhost:${PORT}/miniapp/lesson.html - Урок`);
  console.log(`   • http://localhost:${PORT}/miniapp/my-courses.html - Мои курсы`);
  console.log(`   • http://localhost:${PORT}/miniapp/profile.html - Профиль`);
  console.log(`   • http://localhost:${PORT}/miniapp/partner.html - Партнерка`);
  console.log(`   • http://localhost:${PORT}/miniapp/ai-chat.html - AI чат`);
  console.log(`\n🤖 Для тестирования с ботом:`);
  console.log(`   1. Запустите бота: node bot.js`);
  console.log(`   2. Откройте бота в Telegram`);
  console.log(`   3. Отправьте /start`);
  console.log(`   4. Нажмите "Открыть Академию"`);
  console.log(`\n⏹️  Ctrl+C для остановки\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Остановка сервера...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Остановка сервера...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});
