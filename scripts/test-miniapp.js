#!/usr/bin/env node
// Скрипт для тестирования Mini App V12

const https = require('https');

const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000';

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Тестовые запросы
const tests = [
  {
    name: 'Получить список курсов',
    url: '/api/app?action=getCourses&userId=123',
    method: 'GET',
    expected: (data) => data.success && Array.isArray(data.courses)
  },
  {
    name: 'Получить прогресс пользователя',
    url: '/api/app?action=getUserProgress&userId=123',
    method: 'GET',
    expected: (data) => data.success && data.progress
  },
  {
    name: 'Получить профиль',
    url: '/api/app?action=getProfile&userId=123',
    method: 'GET',
    expected: (data) => data.success && data.profile
  },
  {
    name: 'Получить настройки',
    url: '/api/app?action=getSettings&userId=123',
    method: 'GET',
    expected: (data) => data.success && data.settings
  },
  {
    name: 'Получить достижения',
    url: '/api/app?action=getAchievements&userId=123',
    method: 'GET',
    expected: (data) => data.success && Array.isArray(data.achievements)
  },
  {
    name: 'Получить ежедневные задания',
    url: '/api/app?action=getDailyTasks&userId=123',
    method: 'GET',
    expected: (data) => data.success && Array.isArray(data.tasks)
  }
];

// Выполнить запрос
async function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(BASE_URL + url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Запустить тесты
async function runTests() {
  log('\n🧪 Тестирование Felix Academy V12 Mini App\n', 'blue');
  log(`📡 Base URL: ${BASE_URL}\n`, 'yellow');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log(`▶️  ${test.name}...`, 'yellow');

      const response = await makeRequest(test.url, test.method);

      if (response.status === 200 && test.expected(response.data)) {
        log(`✅ PASSED: ${test.name}`, 'green');
        passed++;
      } else {
        log(`❌ FAILED: ${test.name}`, 'red');
        log(`   Status: ${response.status}`, 'red');
        log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`❌ ERROR: ${test.name}`, 'red');
      log(`   ${error.message}`, 'red');
      failed++;
    }

    console.log('');
  }

  // Итоги
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log(`\n📊 Результаты тестирования:\n`, 'blue');
  log(`✅ Пройдено: ${passed}`, 'green');
  log(`❌ Провалено: ${failed}`, 'red');
  log(`📈 Всего: ${tests.length}\n`, 'yellow');

  if (failed === 0) {
    log('🎉 Все тесты пройдены успешно!', 'green');
  } else {
    log('⚠️  Некоторые тесты провалены. Проверьте логи.', 'yellow');
  }

  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  process.exit(failed > 0 ? 1 : 0);
}

// Проверка доступности сервера
async function checkServer() {
  try {
    log('🔍 Проверка доступности сервера...', 'yellow');
    await makeRequest('/api/app?action=getCourses');
    log('✅ Сервер доступен\n', 'green');
    return true;
  } catch (error) {
    log('❌ Сервер недоступен', 'red');
    log(`   ${error.message}\n`, 'red');
    return false;
  }
}

// Главная функция
async function main() {
  const serverAvailable = await checkServer();

  if (!serverAvailable) {
    log('⚠️  Запустите сервер перед тестированием', 'yellow');
    log('   npm run dev', 'yellow');
    process.exit(1);
  }

  await runTests();
}

// Запуск
main().catch((error) => {
  log(`💥 Критическая ошибка: ${error.message}`, 'red');
  process.exit(1);
});
