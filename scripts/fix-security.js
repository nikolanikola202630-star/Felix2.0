#!/usr/bin/env node
// Felix Academy - Security Fix Script
// Удаляет хардкоженные токены и подготавливает к деплою

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Файлы для удаления (содержат хардкоженные токены)
const filesToDelete = [
  'test-bot-now.js',
  'set-webhook-now.js'
];

// Файлы для перемещения в local-testing
const filesToMove = [
  'bot-local-polling.js',
  'bot-academy-local.js',
  'api/webhook-test.js'
];

// Файлы для обновления (убрать fallback токены)
const filesToUpdate = {
  'api/webhook-handler.js': {
    find: /const TOKEN = process\.env\.BOT_TOKEN \|\| '8623255560:.*?';/,
    replace: `const TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error('❌ BOT_TOKEN is required');
  throw new Error('BOT_TOKEN is required in environment variables');
}`
  },
  'api/referral-bot.js': {
    find: /const REF_BOT_TOKEN = '8609120719:.*?';/,
    replace: `const REF_BOT_TOKEN = process.env.REFERRAL_BOT_TOKEN;
if (!REF_BOT_TOKEN) {
  console.error('❌ REFERRAL_BOT_TOKEN is required');
  throw new Error('REFERRAL_BOT_TOKEN is required in environment variables');
}`
  },
  'api/referral-bot-v2.js': {
    find: /const TOKEN = process\.env\.REFERRAL_BOT_TOKEN \|\| '8609120719:.*?';/,
    replace: `const TOKEN = process.env.REFERRAL_BOT_TOKEN;
if (!TOKEN) {
  console.error('❌ REFERRAL_BOT_TOKEN is required');
  throw new Error('REFERRAL_BOT_TOKEN is required in environment variables');
}`
  },
  'api/payments/webhook.js': {
    find: /const botToken = process\.env\.TELEGRAM_BOT_TOKEN \|\| '8623255560:.*?';/g,
    replace: `const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }`
  },
  'api/payments/refund.js': {
    find: /const botToken = process\.env\.TELEGRAM_BOT_TOKEN \|\| '8623255560:.*?';/,
    replace: `const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
      if (!botToken) {
        throw new Error('TELEGRAM_BOT_TOKEN is required');
      }`
  },
  'api/payments/create-invoice.js': {
    find: /const botToken = process\.env\.TELEGRAM_BOT_TOKEN \|\| '8623255560:.*?';/,
    replace: `const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
      if (!botToken) {
        throw new Error('TELEGRAM_BOT_TOKEN is required');
      }`
  }
};

async function main() {
  log('\n🔒 Felix Academy - Security Fix Script', 'cyan');
  log('⟁ EGOIST ECOSYSTEM v10.3\n', 'cyan');

  let errors = 0;
  let warnings = 0;
  let fixed = 0;

  // 1. Удалить тестовые файлы
  log('📝 Step 1: Deleting test files with hardcoded tokens...', 'cyan');
  for (const file of filesToDelete) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        log(`   ✅ Deleted: ${file}`, 'green');
        fixed++;
      } else {
        log(`   ⏭️  Not found: ${file}`, 'yellow');
      }
    } catch (error) {
      log(`   ❌ Error deleting ${file}: ${error.message}`, 'red');
      errors++;
    }
  }

  // 2. Создать папку local-testing и переместить файлы
  log('\n📁 Step 2: Moving local testing files...', 'cyan');
  const localTestingDir = 'local-testing';
  
  if (!fs.existsSync(localTestingDir)) {
    fs.mkdirSync(localTestingDir);
    log(`   ✅ Created directory: ${localTestingDir}`, 'green');
  }

  for (const file of filesToMove) {
    try {
      if (fs.existsSync(file)) {
        const fileName = path.basename(file);
        const destPath = path.join(localTestingDir, fileName);
        fs.renameSync(file, destPath);
        log(`   ✅ Moved: ${file} → ${destPath}`, 'green');
        fixed++;
      } else {
        log(`   ⏭️  Not found: ${file}`, 'yellow');
      }
    } catch (error) {
      log(`   ❌ Error moving ${file}: ${error.message}`, 'red');
      errors++;
    }
  }

  // 3. Обновить файлы (убрать fallback токены)
  log('\n🔧 Step 3: Updating files to remove fallback tokens...', 'cyan');
  for (const [file, config] of Object.entries(filesToUpdate)) {
    try {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;
        
        content = content.replace(config.find, config.replace);
        
        if (content !== originalContent) {
          fs.writeFileSync(file, content, 'utf8');
          log(`   ✅ Updated: ${file}`, 'green');
          fixed++;
        } else {
          log(`   ⏭️  No changes needed: ${file}`, 'yellow');
        }
      } else {
        log(`   ⚠️  Not found: ${file}`, 'yellow');
        warnings++;
      }
    } catch (error) {
      log(`   ❌ Error updating ${file}: ${error.message}`, 'red');
      errors++;
    }
  }

  // 4. Обновить .gitignore
  log('\n📝 Step 4: Updating .gitignore...', 'cyan');
  try {
    let gitignore = fs.readFileSync('.gitignore', 'utf8');
    const additions = [
      '\n# Local testing files',
      'local-testing/',
      'test-*.js',
      'set-*.js'
    ];

    let updated = false;
    for (const line of additions) {
      if (!gitignore.includes(line.trim())) {
        gitignore += '\n' + line;
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync('.gitignore', gitignore, 'utf8');
      log('   ✅ Updated .gitignore', 'green');
      fixed++;
    } else {
      log('   ⏭️  .gitignore already up to date', 'yellow');
    }
  } catch (error) {
    log(`   ❌ Error updating .gitignore: ${error.message}`, 'red');
    errors++;
  }

  // 5. Создать README для local-testing
  log('\n📄 Step 5: Creating README for local-testing...', 'cyan');
  try {
    const readmeContent = `# Local Testing Files

⚠️ **WARNING:** These files contain hardcoded tokens and are for LOCAL TESTING ONLY!

## Files

- \`bot-local-polling.js\` - Local polling bot for testing
- \`bot-academy-local.js\` - Academy bot for local testing
- \`webhook-test.js\` - Webhook testing

## Usage

\`\`\`bash
# Run local bot
node bot-local-polling.js

# Or academy bot
node bot-academy-local.js
\`\`\`

## Security

❌ **NEVER commit these files to git!**
❌ **NEVER deploy these files to production!**
✅ Use environment variables in production

---

⟁ EGOIST ECOSYSTEM © 2026
`;

    fs.writeFileSync(path.join(localTestingDir, 'README.md'), readmeContent, 'utf8');
    log('   ✅ Created README.md in local-testing/', 'green');
  } catch (error) {
    log(`   ❌ Error creating README: ${error.message}`, 'red');
    errors++;
  }

  // 6. Проверить оставшиеся токены
  log('\n🔍 Step 6: Checking for remaining hardcoded tokens...', 'cyan');
  
  const tokensToCheck = [
    '8623255560',
    '8609120719',
    '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'
  ];

  const filesToCheck = [
    'api',
    'lib',
    'miniapp/js',
    'scripts'
  ];

  let foundTokens = false;

  for (const dir of filesToCheck) {
    if (!fs.existsSync(dir)) continue;

    const files = getAllFiles(dir);
    
    for (const file of files) {
      if (file.includes('node_modules') || file.includes('.git') || file.includes('local-testing')) {
        continue;
      }

      try {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const token of tokensToCheck) {
          if (content.includes(token)) {
            log(`   ⚠️  Found token in: ${file}`, 'yellow');
            foundTokens = true;
            warnings++;
          }
        }
      } catch (error) {
        // Skip binary files
      }
    }
  }

  if (!foundTokens) {
    log('   ✅ No hardcoded tokens found in main codebase', 'green');
  }

  // Итоги
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Summary:', 'cyan');
  log(`   ✅ Fixed: ${fixed}`, 'green');
  log(`   ⚠️  Warnings: ${warnings}`, 'yellow');
  log(`   ❌ Errors: ${errors}`, 'red');
  log('='.repeat(60) + '\n', 'cyan');

  if (errors > 0) {
    log('❌ Security fix completed with errors!', 'red');
    log('   Please review the errors above and fix manually.\n', 'yellow');
    process.exit(1);
  } else if (warnings > 0) {
    log('⚠️  Security fix completed with warnings!', 'yellow');
    log('   Please review the warnings above.\n', 'yellow');
    log('📋 Next steps:', 'cyan');
    log('   1. Review files with warnings', 'yellow');
    log('   2. Set environment variables in Vercel', 'yellow');
    log('   3. Run: node scripts/sync-bots.js', 'yellow');
    log('   4. Deploy: git push origin main\n', 'yellow');
  } else {
    log('✅ Security fix completed successfully!', 'green');
    log('\n📋 Next steps:', 'cyan');
    log('   1. Set environment variables in Vercel:', 'green');
    log('      vercel env add BOT_TOKEN', 'green');
    log('      vercel env add REFERRAL_BOT_TOKEN', 'green');
    log('      vercel env add GROQ_API_KEY', 'green');
    log('      vercel env add DATABASE_URL', 'green');
    log('   2. Commit changes:', 'green');
    log('      git add .', 'green');
    log('      git commit -m "security: remove hardcoded tokens"', 'green');
    log('   3. Deploy:', 'green');
    log('      git push origin main\n', 'green');
  }
}

// Helper: Get all files recursively
function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Run
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
