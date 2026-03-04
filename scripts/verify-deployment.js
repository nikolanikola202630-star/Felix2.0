#!/usr/bin/env node
// Проверка деплоя EGOIST ACADEMY

require('dotenv').config();

const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/egoist.html';

async function verify() {
  console.log('\n🔍 Проверка деплоя EGOIST ACADEMY\n');
  
  const checks = [];
  
  // 1. Проверка egoist.html
  console.log('1️⃣ Проверка egoist.html...');
  try {
    const response = await fetch(MINIAPP_URL);
    if (response.ok) {
      const html = await response.text();
      if (html.includes('EGOIST ACADEMY') && html.includes('#0A0A0A')) {
        console.log('✅ egoist.html доступен и содержит правильный контент');
        checks.push(true);
      } else {
        console.log('⚠️  egoist.html доступен, но контент может быть неправильным');
        checks.push(false);
      }
    } else {
      console.log(`❌ egoist.html недоступен (${response.status})`);
      checks.push(false);
    }
  } catch (error) {
    console.log('❌ Ошибка при проверке egoist.html:', error.message);
    checks.push(false);
  }
  
  // 2. Проверка CSS
  console.log('\n2️⃣ Проверка egoist-theme.css...');
  try {
    const cssUrl = MINIAPP_URL.replace('egoist.html', 'css/egoist-theme.css');
    const response = await fetch(cssUrl);
    if (response.ok) {
      const css = await response.text();
      if (css.includes('#0A0A0A') && css.includes('--egoist-bg')) {
        console.log('✅ CSS доступен и содержит правильные стили');
        checks.push(true);
      } else {
        console.log('⚠️  CSS доступен, но стили могут быть неправильными');
        checks.push(false);
      }
    } else {
      console.log(`❌ CSS недоступен (${response.status})`);
      checks.push(false);
    }
  } catch (error) {
    console.log('❌ Ошибка при проверке CSS:', error.message);
    checks.push(false);
  }
  
  // 3. Проверка JS
  console.log('\n3️⃣ Проверка egoist-app.js...');
  try {
    const jsUrl = MINIAPP_URL.replace('egoist.html', 'js/egoist-app.js');
    const response = await fetch(jsUrl);
    if (response.ok) {
      console.log('✅ JavaScript доступен');
      checks.push(true);
    } else {
      console.log(`❌ JavaScript недоступен (${response.status})`);
      checks.push(false);
    }
  } catch (error) {
    console.log('❌ Ошибка при проверке JS:', error.message);
    checks.push(false);
  }
  
  // 4. Проверка данных курсов
  console.log('\n4️⃣ Проверка egoist-courses.json...');
  try {
    const dataUrl = MINIAPP_URL.replace('miniapp/egoist.html', 'data/egoist-courses.json');
    const response = await fetch(dataUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.courses && data.courses.length > 0) {
        console.log(`✅ Данные курсов доступны (${data.courses.length} курсов)`);
        checks.push(true);
      } else {
        console.log('⚠️  Данные курсов пусты');
        checks.push(false);
      }
    } else {
      console.log(`❌ Данные курсов недоступны (${response.status})`);
      checks.push(false);
    }
  } catch (error) {
    console.log('❌ Ошибка при проверке данных:', error.message);
    checks.push(false);
  }
  
  // Итоги
  const passed = checks.filter(c => c).length;
  const total = checks.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Результат: ${passed}/${total} проверок пройдено\n`);
  
  if (passed === total) {
    console.log('✅ Все проверки пройдены! EGOIST ACADEMY готов к использованию.\n');
    console.log('📱 Откройте бота и проверьте:');
    console.log('   1. Отправьте /start');
    console.log('   2. Нажмите "🎓 Открыть Академию"');
    console.log('   3. Должен открыться минималистичный дизайн с черным фоном\n');
  } else {
    console.log('⚠️  Некоторые проверки не прошли. Возможные решения:\n');
    console.log('1. Подождите 2-3 минуты для завершения деплоя');
    console.log('2. Проверьте Vercel Dashboard: https://vercel.com/dashboard');
    console.log('3. Выполните ручной редеплой:');
    console.log('   vercel --prod\n');
  }
  
  console.log('🔗 Прямая ссылка для тестирования:');
  console.log(`   ${MINIAPP_URL}\n`);
}

verify().catch(error => {
  console.error('\n❌ Критическая ошибка:', error);
  process.exit(1);
});
