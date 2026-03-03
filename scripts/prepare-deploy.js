#!/usr/bin/env node
// Felix Academy - Complete Deploy Preparation Script
// Проверяет все аспекты проекта перед деплоем

const fs = require('fs');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
let warnings = 0;

function check(name, fn) {
  totalChecks++;
  try {
    const result = fn();
    if (result === true) {
      log(`   ✅ ${name}`, 'green');
      passedChecks++;
      return true;
    } else if (result === 'warning') {
      log(`   ⚠️  ${name}`, 'yellow');
      warnings++;
      return false;
    } else {
      log(`   ❌ ${name}`, 'red');
      failedChecks++;
      return false;
    }
  } catch (error) {
    log(`   ❌ ${name}: ${error.message}`, 'red');
    failedChecks++;
    return false;
  }
}

async function main() {
  log('\n🚀 Felix Academy - Deploy Preparation', 'cyan');
  log('⟁ EGOIST ECOSYSTEM v10.3\n', 'cyan');

  // 1. Проверка файловой структуры
  log('📁 Step 1: Checking file structure...', 'cyan');
  
  check('package.json exists', () => fs.existsSync('package.json'));
  check('vercel.json exists', () => fs.existsSync('vercel.json'));
  check('.gitignore exists', () => fs.existsSync('.gitignore'));
  check('api/ directory exists', () => fs.existsSync('api'));
  check('miniapp/ directory exists', () => fs.existsSync('miniapp'));
  check('lib/ directory exists', () => fs.existsSync('lib'));
  check('database/ directory exists', () => fs.existsSync('database'));

  // 2. Проверка критичных файлов
  log('\n📄 Step 2: Checking critical files...', 'cyan');
  
  check('api/webhook.js exists', () => fs.existsSync('api/webhook.js'));
  check('api/referral-bot-v2.js exists', () => fs.existsSync('api/referral-bot-v2.js'));
  check('api/_router.js exists', () => fs.existsSync('api/_router.js'));
  check('lib/db.js exists', () => fs.existsSync('lib/db.js'));
  check('lib/ai.js exists', () => fs.existsSync('lib/ai.js'));
  check('miniapp/index.html exists', () => fs.existsSync('miniapp/index.html'));

  // 3. Проверка безопасности
  log('\n🔒 Step 3: Security checks...', 'cyan');
  
  check('.env not in git', () => {
    try {
      const result = execSync('git ls-files | grep -E "^\\.env$"', { encoding: 'utf8' });
      return result.trim() === '';
    } catch {
      return true; // grep returns non-zero if not found
    }
  });

  check('.env in .gitignore', () => {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    return gitignore.includes('.env');
  });

  check('No hardcoded main bot token in api/', () => {
    try {
      const result = execSync('grep -r "8623255560" api/ 2>/dev/null || true', { encoding: 'utf8' });
      return result.trim() === '';
    } catch {
      return true;
    }
  });

  check('No hardcoded referral bot token in api/', () => {
    try {
      const result = execSync('grep -r "8609120719" api/ 2>/dev/null || true', { encoding: 'utf8' });
      return result.trim() === '';
    } catch {
      return true;
    }
  });

  check('No hardcoded Groq API key in api/', () => {
    try {
      const result = execSync('grep -r "gsk_" api/ 2>/dev/null || true', { encoding: 'utf8' });
      return result.trim() === '';
    } catch {
      return true;
    }
  });

  // 4. Проверка зависимостей
  log('\n📦 Step 4: Checking dependencies...', 'cyan');
  
  check('node_modules exists', () => fs.existsSync('node_modules'));
  
  check('Required dependencies installed', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const required = ['@supabase/supabase-js', 'groq-sdk', 'pg', 'dotenv'];
    return required.every(dep => pkg.dependencies && pkg.dependencies[dep]);
  });

  check('Node.js version specified', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return pkg.engines && pkg.engines.node;
  });

  // 5. Проверка конфигурации
  log('\n⚙️  Step 5: Checking configuration...', 'cyan');
  
  check('vercel.json has correct routes', () => {
    const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    return vercel.routes && vercel.routes.length > 0;
  });

  check('vercel.json has api router', () => {
    const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    return vercel.routes.some(r => r.dest && r.dest.includes('_router.js'));
  });

  // 6. Проверка переменных окружения
  log('\n🔑 Step 6: Checking environment variables...', 'cyan');
  
  check('.env.example exists', () => fs.existsSync('.env.example'));
  
  check('.env.local exists (for local dev)', () => {
    const exists = fs.existsSync('.env.local');
    if (!exists) {
      log('      💡 Create .env.local from .env.example for local development', 'blue');
      return 'warning';
    }
    return true;
  });

  if (fs.existsSync('.env.local')) {
    const env = fs.readFileSync('.env.local', 'utf8');
    check('BOT_TOKEN in .env.local', () => env.includes('BOT_TOKEN='));
    check('GROQ_API_KEY in .env.local', () => env.includes('GROQ_API_KEY='));
    check('DATABASE_URL in .env.local', () => env.includes('DATABASE_URL='));
  }

  // 7. Проверка базы данных
  log('\n🗄️  Step 7: Checking database files...', 'cyan');
  
  check('database/schema.sql exists', () => fs.existsSync('database/schema.sql'));
  check('database/migrations/ exists', () => fs.existsSync('database/migrations'));
  
  check('All migrations exist', () => {
    const migrations = [
      'database/migrations/001-add-ml-tables-safe.sql',
      'database/migrations/002-academy-tables.sql',
      'database/migrations/003-partner-courses.sql',
      'database/migrations/004-referral-system-v2.sql',
      'database/migrations/005-community-system.sql',
      'database/migrations/006-partner-referral-customization-simple.sql',
      'database/migrations/007-ai-chat-folders.sql'
    ];
    return migrations.every(m => fs.existsSync(m));
  });

  // 8. Проверка Mini App
  log('\n📱 Step 8: Checking Mini App...', 'cyan');
  
  const miniappPages = [
    'miniapp/index.html',
    'miniapp/catalog.html',
    'miniapp/course.html',
    'miniapp/profile.html',
    'miniapp/partner-dashboard.html',
    'miniapp/admin-panel.html'
  ];

  check('All critical Mini App pages exist', () => {
    return miniappPages.every(page => fs.existsSync(page));
  });

  check('Mini App has CSS', () => fs.existsSync('miniapp/css'));
  check('Mini App has JS', () => fs.existsSync('miniapp/js'));

  // 9. Проверка API endpoints
  log('\n🌐 Step 9: Checking API endpoints...', 'cyan');
  
  const criticalEndpoints = [
    'api/webhook.js',
    'api/referral-bot-v2.js',
    'api/courses.js',
    'api/admin-api.js',
    'api/payments.js',
    'api/health/database.js'
  ];

  check('All critical API endpoints exist', () => {
    return criticalEndpoints.every(ep => fs.existsSync(ep));
  });

  // 10. Проверка документации
  log('\n📚 Step 10: Checking documentation...', 'cyan');
  
  check('README.md exists', () => fs.existsSync('README.md'));
  check('DEPLOY-CHECKLIST.md exists', () => fs.existsSync('DEPLOY-CHECKLIST.md'));
  check('БОТЫ-ПОЛНЫЙ-АНАЛИЗ.md exists', () => fs.existsSync('БОТЫ-ПОЛНЫЙ-АНАЛИЗ.md'));

  // Итоги
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 Summary:', 'cyan');
  log(`   Total checks: ${totalChecks}`, 'blue');
  log(`   ✅ Passed: ${passedChecks}`, 'green');
  log(`   ⚠️  Warnings: ${warnings}`, 'yellow');
  log(`   ❌ Failed: ${failedChecks}`, 'red');
  log('='.repeat(70) + '\n', 'cyan');

  if (failedChecks > 0) {
    log('❌ Deploy preparation FAILED!', 'red');
    log('   Please fix the errors above before deploying.\n', 'yellow');
    
    log('💡 Quick fixes:', 'cyan');
    log('   1. Run security fix: node scripts/fix-security.js', 'yellow');
    log('   2. Install dependencies: npm install', 'yellow');
    log('   3. Create .env.local from .env.example', 'yellow');
    log('   4. Check database migrations\n', 'yellow');
    
    process.exit(1);
  } else if (warnings > 0) {
    log('⚠️  Deploy preparation completed with warnings!', 'yellow');
    log('   Review warnings above. You can proceed but check them first.\n', 'yellow');
    
    log('📋 Next steps:', 'cyan');
    log('   1. Review warnings above', 'yellow');
    log('   2. Set Vercel environment variables', 'yellow');
    log('   3. Apply database migrations', 'yellow');
    log('   4. Run: git push origin main\n', 'yellow');
  } else {
    log('✅ Deploy preparation PASSED!', 'green');
    log('   Your project is ready for deployment!\n', 'green');
    
    log('📋 Deployment steps:', 'cyan');
    log('   1. Set environment variables in Vercel:', 'green');
    log('      vercel env add BOT_TOKEN', 'green');
    log('      vercel env add REFERRAL_BOT_TOKEN', 'green');
    log('      vercel env add GROQ_API_KEY', 'green');
    log('      vercel env add DATABASE_URL', 'green');
    log('      vercel env add ADMIN_IDS', 'green');
    log('   2. Apply database migrations in Supabase', 'green');
    log('   3. Commit and push:', 'green');
    log('      git add .', 'green');
    log('      git commit -m "feat: ready for production v10.3"', 'green');
    log('      git push origin main', 'green');
    log('   4. Setup webhooks:', 'green');
    log('      node scripts/sync-bots.js', 'green');
    log('   5. Test deployment:', 'green');
    log('      curl https://felix2-0.vercel.app/api/webhook\n', 'green');
  }
}

// Run
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
