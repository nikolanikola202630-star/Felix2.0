#!/usr/bin/env node
// Скрипт для проверки состояния базы данных

require('dotenv').config();
const { getSupabase } = require('../lib/supabase-client');

async function checkDatabase() {
  console.log('\n🔍 Проверка состояния базы данных...\n');

  const supabase = getSupabase();
  
  if (!supabase) {
    console.log('❌ Supabase не подключен');
    return;
  }

  // Проверить таблицы
  console.log('📊 Проверка таблиц:\n');

  const tables = [
    'users',
    'courses',
    'lessons',
    'lesson_progress',
    'purchases',
    'bonus_transactions',
    'partner_payouts',
    'partners',
    'course_partners',
    'course_students',
    'partner_chats',
    'partner_messages',
    'partner_notifications'
  ];

  const results = {
    existing: [],
    missing: []
  };

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST205') {
          results.missing.push(table);
          console.log(`❌ ${table} - не существует`);
        } else {
          console.log(`⚠️  ${table} - ошибка: ${error.message}`);
        }
      } else {
        results.existing.push(table);
        console.log(`✅ ${table} - существует`);
      }
    } catch (err) {
      console.log(`⚠️  ${table} - ошибка: ${err.message}`);
    }
  }

  console.log(`\n📈 Итого:`);
  console.log(`   Существует: ${results.existing.length}/${tables.length}`);
  console.log(`   Отсутствует: ${results.missing.length}/${tables.length}`);

  if (results.missing.length > 0) {
    console.log(`\n⚠️  Отсутствующие таблицы:`);
    results.missing.forEach(table => console.log(`   - ${table}`));
    console.log(`\n💡 Нужно применить миграции:`);
    console.log(`   1. Открыть Supabase Dashboard → SQL Editor`);
    console.log(`   2. Выполнить файлы из database/migrations/`);
  }

  // Проверить функции
  console.log(`\n🔧 Проверка SQL функций:\n`);

  try {
    const { data, error } = await supabase.rpc('update_bonus_balance', {
      p_user_id: 999999,
      p_amount: 0
    });

    if (error) {
      if (error.code === 'PGRST202') {
        console.log(`❌ update_bonus_balance - не существует`);
        console.log(`\n💡 Нужно создать функцию:`);
        console.log(`   1. Открыть Supabase Dashboard → SQL Editor`);
        console.log(`   2. Выполнить database/functions/update_bonus_balance.sql`);
      } else {
        console.log(`⚠️  update_bonus_balance - ошибка: ${error.message}`);
      }
    } else {
      console.log(`✅ update_bonus_balance - существует`);
    }
  } catch (err) {
    console.log(`⚠️  Ошибка проверки функций: ${err.message}`);
  }

  console.log('\n✅ Проверка завершена!\n');
}

checkDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  });
