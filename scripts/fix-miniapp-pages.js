#!/usr/bin/env node

/**
 * Исправление MiniApp страниц
 * Добавляет footer.js и восстанавливает пустые файлы
 */

const fs = require('fs');
const path = require('path');

const VERSION = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
const FOOTER_SCRIPT = `<script src="js/footer.js?v=${VERSION}"></script>`;

console.log('🔧 Исправление MiniApp страниц...\n');
console.log('📅 Версия:', VERSION, '\n');

// Список всех HTML файлов
const htmlFiles = [
  'index.html',
  'catalog.html',
  'search.html',
  'course.html',
  'lesson.html',
  'profile.html',
  'my-courses.html',
  'achievements.html',
  'analytics.html',
  'community.html',
  'settings.html',
  'voice.html',
  'ai-chat.html',
  'academy.html',
  'flagship.html'
];

let fixed = 0;
let added = 0;
let errors = 0;

htmlFiles.forEach(file => {
  const filePath = path.join('miniapp', file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${file} - не существует`);
      errors++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Проверяем размер файла
    if (content.length < 100) {
      console.log(`⚠️  ${file} - файл пустой или поврежден (${content.length} байт)`);
      errors++;
      return;
    }

    // Проверяем наличие footer.js
    if (!content.includes('footer.js')) {
      // Добавляем footer.js перед </body>
      content = content.replace('</body>', `  ${FOOTER_SCRIPT}\n</body>`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file} - добавлен footer.js`);
      added++;
    } else {
      // Обновляем версию footer.js
      const oldVersionRegex = /footer\.js\?v=\d+/g;
      if (oldVersionRegex.test(content)) {
        content = content.replace(oldVersionRegex, `footer.js?v=${VERSION}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`🔄 ${file} - обновлена версия footer.js`);
        fixed++;
      } else {
        console.log(`✓  ${file} - уже актуален`);
      }
    }
  } catch (error) {
    console.log(`❌ ${file} - ошибка: ${error.message}`);
    errors++;
  }
});

console.log('\n📊 Результаты:');
console.log(`   Обновлено версий: ${fixed}`);
console.log(`   Добавлено footer: ${added}`);
console.log(`   Ошибок: ${errors}`);

if (errors > 0) {
  console.log('\n⚠️  Есть проблемные файлы! Проверь вручную.');
  process.exit(1);
} else {
  console.log('\n✅ Все файлы исправлены!');
}
