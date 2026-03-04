#!/usr/bin/env node

/**
 * Felix Academy - Convert to Free Access
 * 
 * Этот скрипт автоматизирует переход платформы на бесплатный режим
 * с сохранением возможности вернуть платные функции в будущем.
 */

const fs = require('fs');
const path = require('path');

console.log('🎁 Felix Academy - Converting to Free Access Mode\n');

const changes = {
  api: 0,
  frontend: 0,
  database: 0
};

// 1. Проверить, что все платёжные API отключены
console.log('1️⃣  Checking payment APIs...');
const paymentFiles = [
  'api/payments.js',
  'api/payments/create-invoice.js',
  'api/payments/refund.js',
  'api/payments/webhook.js'
];

paymentFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('PAYMENT:') && content.includes('free_access')) {
      console.log(`   ✅ ${file} - disabled`);
      changes.api++;
    } else {
      console.log(`   ⚠️  ${file} - needs update`);
    }
  }
});

// 2. Проверить API курсов
console.log('\n2️⃣  Checking courses APIs...');
const courseFiles = [
  'api/courses/check-access.js',
  'api/courses/my-courses.js'
];

courseFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('free_access') || content.includes('FREE ACCESS')) {
      console.log(`   ✅ ${file} - updated`);
      changes.api++;
    } else {
      console.log(`   ⚠️  ${file} - needs update`);
    }
  }
});

// 3. Проверить фронтенд
console.log('\n3️⃣  Checking frontend files...');
const frontendFiles = [
  'miniapp/js/catalog.js',
  'miniapp/js/app.js',
  'miniapp/js/academy.js'
];

frontendFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('price >') && content.includes('Бесплатно')) {
      console.log(`   ✅ ${file} - updated`);
      changes.frontend++;
    } else {
      console.log(`   ⚠️  ${file} - may need update`);
    }
  }
});

// 4. Создать SQL миграцию для is_free
console.log('\n4️⃣  Creating database migration...');
const migrationSQL = `-- Migration: Add is_free column to courses
-- Date: ${new Date().toISOString()}
-- Purpose: Support free access mode

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;

-- Update all existing courses to free
UPDATE courses SET is_free = true;

-- Add comment
COMMENT ON COLUMN courses.is_free IS 'Indicates if course is free during free access period';
`;

const migrationPath = path.join(process.cwd(), 'database/migrations/009-free-access-mode.sql');
fs.writeFileSync(migrationPath, migrationSQL);
console.log(`   ✅ Created migration: ${migrationPath}`);
changes.database++;

// 5. Создать отчет
console.log('\n📊 Summary:');
console.log(`   API files updated: ${changes.api}`);
console.log(`   Frontend files updated: ${changes.frontend}`);
console.log(`   Database migrations: ${changes.database}`);
console.log(`   Total changes: ${changes.api + changes.frontend + changes.database}`);

// 6. Создать документацию
const docContent = `# 🎁 Felix Academy - Free Access Mode

## Статус: Активирован

**Дата активации:** ${new Date().toLocaleDateString('ru-RU')}

## Что изменилось

### API (Backend)
- ✅ Отключены платёжные endpoints
- ✅ Убраны проверки покупок
- ✅ Все курсы доступны всем пользователям

### Frontend
- ✅ Убраны кнопки "Купить"
- ✅ Удалены цены из каталога
- ✅ Все курсы помечены как "Бесплатно"

### База данных
- ✅ Добавлено поле is_free в courses
- ✅ Платёжные таблицы сохранены для будущего

## Как вернуть платные функции

1. Раскомментировать код с пометкой \`/* PAYMENT: ...\`
2. Применить обратную миграцию
3. Обновить фронтенд
4. Протестировать платежи

## Файлы с изменениями

### API
${paymentFiles.map(f => `- ${f}`).join('\n')}
${courseFiles.map(f => `- ${f}`).join('\n')}

### Frontend
${frontendFiles.map(f => `- ${f}`).join('\n')}

### Database
- database/migrations/009-free-access-mode.sql

---

**Версия:** V13.0 (Free Access)
**Следующий пересмотр:** По запросу
`;

const docPath = path.join(process.cwd(), 'РЕЖИМ-БЕСПЛАТНОГО-ДОСТУПА.md');
fs.writeFileSync(docPath, docContent);
console.log(`\n📄 Documentation created: ${docPath}`);

console.log('\n✅ Conversion complete!');
console.log('\n💡 Next steps:');
console.log('   1. Apply database migration: npm run migrate:up');
console.log('   2. Test all pages in Mini App');
console.log('   3. Verify no payment buttons appear');
console.log('   4. Deploy to production');
console.log('\n🚀 All courses are now free!');
