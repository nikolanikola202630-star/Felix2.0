#!/usr/bin/env node
// Скрипт для тестирования подключения к Supabase

require('dotenv').config();
const { 
  getSupabase, 
  checkConnection, 
  query, 
  rpc, 
  getStats 
} = require('../lib/supabase-client');

const { 
  createPurchase, 
  checkPurchase, 
  getUserPurchases,
  processCommissions,
  getPurchaseStats 
} = require('../lib/db-purchases');

async function testSupabaseConnection() {
  console.log('\n🔍 Тестирование подключения к Supabase...\n');

  // 1. Проверить статистику
  console.log('1️⃣ Статистика клиента:');
  const stats = getStats();
  console.log(JSON.stringify(stats, null, 2));

  // 2. Проверить подключение
  console.log('\n2️⃣ Проверка подключения:');
  const connection = await checkConnection();
  console.log(JSON.stringify(connection, null, 2));

  if (!connection.connected) {
    console.log('\n⚠️  Supabase не подключен. Работаем в fallback режиме.');
    console.log('Для подключения:');
    console.log('1. Добавьте SUPABASE_URL и SUPABASE_KEY в .env');
    console.log('2. Запустите: npm install @supabase/supabase-js');
    console.log('3. Перезапустите скрипт\n');
    return testFallbackMode();
  }

  console.log('\n✅ Supabase подключен! Тестируем функции...\n');

  // 3. Тест query - SELECT
  console.log('3️⃣ Тест SELECT:');
  try {
    const users = await query('users', 'select', {
      limit: 5,
      order: { column: 'created_at', ascending: false }
    });
    console.log(`✅ Найдено пользователей: ${users?.length || 0}`);
  } catch (error) {
    console.log(`❌ Ошибка SELECT: ${error.message}`);
  }

  // 4. Тест создания покупки
  console.log('\n4️⃣ Тест создания покупки:');
  try {
    const testPurchase = await createPurchase({
      user_id: 999999,
      course_id: 'test-course',
      amount: 1000,
      currency: 'XTR',
      telegram_payment_charge_id: `test_${Date.now()}`,
      provider_payment_charge_id: `provider_${Date.now()}`,
      referrer_id: null
    });
    console.log('✅ Покупка создана:', testPurchase.id);

    // 5. Тест проверки покупки
    console.log('\n5️⃣ Тест проверки покупки:');
    const hasAccess = await checkPurchase(999999, 'test-course');
    console.log(`✅ Доступ к курсу: ${hasAccess ? 'Да' : 'Нет'}`);

    // 6. Тест получения покупок пользователя
    console.log('\n6️⃣ Тест получения покупок:');
    const purchases = await getUserPurchases(999999);
    console.log(`✅ Покупок пользователя: ${purchases.length}`);

    // 7. Очистка тестовых данных
    console.log('\n7️⃣ Очистка тестовых данных:');
    await query('purchases', 'delete', {
      eq: { user_id: 999999 }
    });
    console.log('✅ Тестовые данные удалены');

  } catch (error) {
    console.log(`❌ Ошибка теста: ${error.message}`);
  }

  // 8. Тест RPC функции
  console.log('\n8️⃣ Тест RPC функции:');
  try {
    // Сначала создать пользователя с обязательными полями
    const client = getSupabase();
    await client.from('users').insert([{
      id: 999999,
      first_name: 'Test',
      language_code: 'ru'
    }]);

    await rpc('update_bonus_balance', {
      p_user_id: 999999,
      p_amount: 500
    });
    console.log('✅ RPC функция работает');

    // Проверить баланс
    const user = await query('users', 'select', {
      eq: { id: 999999 },
      single: true
    });
    console.log(`✅ Баланс бонусов: ${user?.bonus_balance || 0}`);

    // Очистка
    await query('users', 'delete', {
      eq: { id: 999999 }
    });
    console.log('✅ Тестовый пользователь удален');

  } catch (error) {
    console.log(`❌ Ошибка RPC: ${error.message}`);
  }

  // 9. Тест статистики покупок
  console.log('\n9️⃣ Тест статистики:');
  try {
    const purchaseStats = await getPurchaseStats();
    console.log('✅ Статистика покупок:');
    console.log(`   Всего покупок: ${purchaseStats.total_purchases}`);
    console.log(`   Общая выручка: ${purchaseStats.total_revenue}`);
  } catch (error) {
    console.log(`❌ Ошибка статистики: ${error.message}`);
  }

  console.log('\n✅ Все тесты завершены!\n');
}

async function testFallbackMode() {
  console.log('\n🧪 Тестирование fallback режима (in-memory)...\n');

  // Тест создания покупки
  console.log('1️⃣ Создание покупки:');
  const purchase = await createPurchase({
    user_id: 123456,
    course_id: 'test-course',
    amount: 1000,
    currency: 'XTR',
    telegram_payment_charge_id: 'test_123',
    provider_payment_charge_id: 'provider_123'
  });
  console.log('✅ Покупка создана (in-memory):', purchase.id);

  // Тест проверки покупки
  console.log('\n2️⃣ Проверка покупки:');
  const hasAccess = await checkPurchase(123456, 'test-course');
  console.log(`✅ Доступ к курсу: ${hasAccess ? 'Да' : 'Нет'}`);

  // Тест получения покупок
  console.log('\n3️⃣ Получение покупок:');
  const purchases = await getUserPurchases(123456);
  console.log(`✅ Покупок пользователя: ${purchases.length}`);

  // Тест статистики
  console.log('\n4️⃣ Статистика:');
  const stats = await getPurchaseStats();
  console.log('✅ Статистика покупок:');
  console.log(`   Всего покупок: ${stats.total_purchases}`);
  console.log(`   Общая выручка: ${stats.total_revenue}`);

  console.log('\n✅ Fallback режим работает!\n');
  console.log('💡 Для подключения к Supabase:');
  console.log('   1. Добавьте SUPABASE_URL и SUPABASE_KEY в .env');
  console.log('   2. Запустите: npm install @supabase/supabase-js');
  console.log('   3. Перезапустите скрипт\n');
}

// Запуск
testSupabaseConnection()
  .then(() => {
    console.log('🎉 Тестирование завершено успешно!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
