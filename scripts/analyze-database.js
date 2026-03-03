#!/usr/bin/env node
// Скрипт для полного анализа структуры базы данных

require('dotenv').config();
const { getSupabase } = require('../lib/supabase-client');

async function analyzeDatabase() {
  console.log('\n🔍 Полный анализ базы данных Felix Academy\n');

  const supabase = getSupabase();
  
  if (!supabase) {
    console.log('❌ Supabase не подключен');
    return;
  }

  // Получить список всех таблиц
  console.log('📊 Анализ таблиц:\n');

  const tablesList = [
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

  const analysis = {};

  for (const tableName of tablesList) {
    console.log(`\n📋 Таблица: ${tableName}`);
    console.log('─'.repeat(60));

    try {
      // Получить структуру таблицы через SQL
      const { data: columns, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        console.log(`❌ Ошибка: ${error.message}`);
        analysis[tableName] = { exists: false, error: error.message };
        continue;
      }

      // Получить количество записей
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      console.log(`✅ Существует`);
      console.log(`📊 Записей: ${count || 0}`);

      // Попробовать получить одну запись для анализа структуры
      const { data: sample, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (sample && sample.length > 0) {
        console.log(`🔑 Колонки:`);
        Object.keys(sample[0]).forEach(col => {
          const value = sample[0][col];
          const type = value === null ? 'null' : typeof value;
          console.log(`   - ${col}: ${type}`);
        });
      } else {
        console.log(`ℹ️  Таблица пустая, структура не определена`);
      }

      analysis[tableName] = {
        exists: true,
        count: count || 0,
        columns: sample && sample.length > 0 ? Object.keys(sample[0]) : []
      };

    } catch (err) {
      console.log(`❌ Ошибка: ${err.message}`);
      analysis[tableName] = { exists: false, error: err.message };
    }
  }

  // Итоговая сводка
  console.log('\n\n📈 Итоговая сводка:\n');
  console.log('─'.repeat(60));

  const existing = Object.keys(analysis).filter(t => analysis[t].exists);
  const missing = Object.keys(analysis).filter(t => !analysis[t].exists);

  console.log(`✅ Существующие таблицы: ${existing.length}/${tablesList.length}`);
  existing.forEach(t => {
    console.log(`   - ${t} (${analysis[t].count} записей, ${analysis[t].columns?.length || 0} колонок)`);
  });

  if (missing.length > 0) {
    console.log(`\n❌ Отсутствующие таблицы: ${missing.length}`);
    missing.forEach(t => console.log(`   - ${t}`));
  }

  // Проверить критические колонки
  console.log('\n\n🔍 Проверка критических колонок:\n');
  console.log('─'.repeat(60));

  const criticalColumns = {
    users: ['id', 'first_name', 'bonus_balance', 'referrer_id'],
    courses: ['id', 'title', 'price'],
    lessons: ['id', 'course_id', 'title', 'order_num'],
    purchases: ['id', 'user_id', 'course_id', 'amount', 'status'],
    bonus_transactions: ['id', 'user_id', 'amount', 'type']
  };

  for (const [table, requiredCols] of Object.entries(criticalColumns)) {
    if (analysis[table]?.exists && analysis[table].columns) {
      const missing = requiredCols.filter(col => !analysis[table].columns.includes(col));
      if (missing.length === 0) {
        console.log(`✅ ${table}: все критические колонки присутствуют`);
      } else {
        console.log(`⚠️  ${table}: отсутствуют колонки: ${missing.join(', ')}`);
      }
    }
  }

  console.log('\n✅ Анализ завершен!\n');

  return analysis;
}

analyzeDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  });
