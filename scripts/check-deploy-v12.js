#!/usr/bin/env node

// Felix Academy V12 - Check Deploy
// Проверка статуса деплоя

const https = require('https');

const ENDPOINTS = [
  {
    name: 'App V12',
    url: 'https://felix2-0.vercel.app/miniapp/app-v12.html',
    checks: [
      'Felix Academy V12',
      'components-v12.css',
      'pages-v12.js'
    ]
  },
  {
    name: 'Admin Panel',
    url: 'https://felix2-0.vercel.app/miniapp/admin-panel.html',
    checks: [
      'components-v12.css',
      'admin-v12.js'
    ]
  },
  {
    name: 'Partner Dashboard',
    url: 'https://felix2-0.vercel.app/miniapp/partner-dashboard.html',
    checks: [
      'components-v12.css',
      'partner-v12.js'
    ]
  },
  {
    name: 'Components CSS',
    url: 'https://felix2-0.vercel.app/miniapp/css/components-v12.css',
    checks: ['.card-v12', '.btn-v12', '.stat-card-v12']
  },
  {
    name: 'Pages JS',
    url: 'https://felix2-0.vercel.app/miniapp/js/pages-v12.js',
    checks: ['PagesV12', 'renderHome', 'renderAcademy']
  },
  {
    name: 'Admin API',
    url: 'https://felix2-0.vercel.app/api/admin-v12',
    checks: []
  },
  {
    name: 'Partner API',
    url: 'https://felix2-0.vercel.app/api/partner-v12',
    checks: []
  },
  {
    name: 'Automation API',
    url: 'https://felix2-0.vercel.app/api/automation-v12',
    checks: []
  }
];

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout'));
    }, 15000);

    https.get(url, (res) => {
      clearTimeout(timeout);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          content: data
        });
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function checkEndpoint(endpoint) {
  try {
    const response = await httpGet(endpoint.url);
    
    const result = {
      name: endpoint.name,
      url: endpoint.url,
      status: response.statusCode === 200 ? 'OK' : `HTTP ${response.statusCode}`,
      checks: []
    };

    // Проверка содержимого
    if (response.statusCode === 200 && endpoint.checks.length > 0) {
      for (const check of endpoint.checks) {
        const found = response.content.includes(check);
        result.checks.push({
          text: check,
          found
        });
      }
    }

    return result;
  } catch (error) {
    return {
      name: endpoint.name,
      url: endpoint.url,
      status: 'ERROR',
      error: error.message,
      checks: []
    };
  }
}

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Felix Academy V12 - Deploy Check            ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log('🔍 Проверка деплоя...');
  console.log('');

  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    process.stdout.write(`   Проверка ${endpoint.name}... `);
    const result = await checkEndpoint(endpoint);
    results.push(result);
    
    if (result.status === 'OK') {
      console.log('✅');
    } else if (result.status.startsWith('HTTP')) {
      console.log(`⚠️ ${result.status}`);
    } else {
      console.log(`❌ ${result.status}`);
    }
  }

  console.log('');
  console.log('━'.repeat(50));
  console.log('');
  console.log('📊 Детальные результаты:');
  console.log('');

  for (const result of results) {
    console.log(`${result.status === 'OK' ? '✅' : '❌'} ${result.name}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Статус: ${result.status}`);
    
    if (result.error) {
      console.log(`   Ошибка: ${result.error}`);
    }
    
    if (result.checks.length > 0) {
      console.log('   Проверки:');
      for (const check of result.checks) {
        console.log(`      ${check.found ? '✓' : '✗'} ${check.text}`);
      }
    }
    
    console.log('');
  }

  console.log('━'.repeat(50));
  console.log('');

  // Статистика
  const total = results.length;
  const ok = results.filter(r => r.status === 'OK').length;
  const errors = results.filter(r => r.status === 'ERROR').length;

  console.log('📈 Статистика:');
  console.log(`   Всего проверок: ${total}`);
  console.log(`   Успешно: ${ok} (${Math.round(ok/total*100)}%)`);
  console.log(`   Ошибок: ${errors}`);
  console.log('');

  if (ok === total) {
    console.log('🎉 Деплой успешен! Все системы работают.');
  } else if (ok > total / 2) {
    console.log('⚠️ Деплой частично успешен. Есть проблемы.');
  } else {
    console.log('❌ Деплой не завершен или есть критические ошибки.');
  }

  console.log('');
  console.log('🔗 Ссылки:');
  console.log('   App V12: https://felix2-0.vercel.app/miniapp/app-v12.html');
  console.log('   Admin: https://felix2-0.vercel.app/miniapp/admin-panel.html');
  console.log('   Partner: https://felix2-0.vercel.app/miniapp/partner-dashboard.html');
  console.log('');

  process.exit(ok === total ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
