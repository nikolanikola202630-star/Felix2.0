#!/usr/bin/env node
// Felix Academy - Database Migrations Script
// Применяет все миграции в правильном порядке

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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

// Миграции в правильном порядке
const migrations = [
  '001-add-ml-tables-safe.sql',
  '002-academy-tables.sql',
  '003-partner-courses.sql',
  '004-referral-system-v2.sql',
  '005-community-system.sql',
  '006-partner-referral-customization-simple.sql',
  '007-ai-chat-folders.sql'
];

async function checkConnection(pool) {
  try {
    const result = await pool.query('SELECT NOW() as time, version() as version');
    log(`✅ Database connected`, 'green');
    log(`   Time: ${result.rows[0].time}`, 'blue');
    log(`   Version: ${result.rows[0].version.split(' ')[0]}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function createMigrationsTable(pool) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);
    log(`✅ Migrations table ready`, 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to create migrations table: ${error.message}`, 'red');
    return false;
  }
}

async function getAppliedMigrations(pool) {
  try {
    const result = await pool.query('SELECT name FROM migrations ORDER BY id');
    return result.rows.map(row => row.name);
  } catch (error) {
    log(`⚠️  Could not get applied migrations: ${error.message}`, 'yellow');
    return [];
  }
}

async function applyMigration(pool, migrationName) {
  const migrationPath = path.join('database', 'migrations', migrationName);
  
  if (!fs.existsSync(migrationPath)) {
    log(`   ❌ Migration file not found: ${migrationName}`, 'red');
    return false;
  }

  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Начать транзакцию
    await pool.query('BEGIN');
    
    // Выполнить миграцию
    await pool.query(sql);
    
    // Записать в таблицу миграций
    await pool.query(
      'INSERT INTO migrations (name) VALUES ($1)',
      [migrationName]
    );
    
    // Закоммитить
    await pool.query('COMMIT');
    
    log(`   ✅ Applied: ${migrationName}`, 'green');
    return true;
  } catch (error) {
    // Откатить при ошибке
    await pool.query('ROLLBACK');
    log(`   ❌ Failed: ${migrationName}`, 'red');
    log(`      Error: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🗄️  Felix Academy - Database Migrations', 'cyan');
  log('⟁ EGOIST ECOSYSTEM v10.3\n', 'cyan');

  // Проверить DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    log('❌ DATABASE_URL not found in environment variables!', 'red');
    log('\n💡 Solutions:', 'yellow');
    log('   1. Create .env.local file', 'yellow');
    log('   2. Add: DATABASE_URL=postgresql://...', 'yellow');
    log('   3. Or set environment variable\n', 'yellow');
    process.exit(1);
  }

  log('📍 Database URL: ' + databaseUrl.substring(0, 30) + '...', 'blue');

  // Создать pool
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : false
  });

  try {
    // 1. Проверить подключение
    log('\n🔍 Step 1: Checking database connection...', 'cyan');
    const connected = await checkConnection(pool);
    if (!connected) {
      process.exit(1);
    }

    // 2. Создать таблицу миграций
    log('\n📝 Step 2: Creating migrations table...', 'cyan');
    const tableCreated = await createMigrationsTable(pool);
    if (!tableCreated) {
      process.exit(1);
    }

    // 3. Получить примененные миграции
    log('\n📋 Step 3: Checking applied migrations...', 'cyan');
    const appliedMigrations = await getAppliedMigrations(pool);
    
    if (appliedMigrations.length > 0) {
      log(`   Found ${appliedMigrations.length} applied migration(s):`, 'blue');
      appliedMigrations.forEach(name => {
        log(`   ✓ ${name}`, 'green');
      });
    } else {
      log('   No migrations applied yet', 'yellow');
    }

    // 4. Применить новые миграции
    log('\n🚀 Step 4: Applying new migrations...', 'cyan');
    
    const pendingMigrations = migrations.filter(m => !appliedMigrations.includes(m));
    
    if (pendingMigrations.length === 0) {
      log('   ✅ All migrations already applied!', 'green');
    } else {
      log(`   Found ${pendingMigrations.length} pending migration(s):\n`, 'yellow');
      
      let applied = 0;
      let failed = 0;
      
      for (const migration of pendingMigrations) {
        const success = await applyMigration(pool, migration);
        if (success) {
          applied++;
        } else {
          failed++;
          break; // Остановиться при первой ошибке
        }
      }
      
      log('\n' + '='.repeat(60), 'cyan');
      log('📊 Summary:', 'cyan');
      log(`   ✅ Applied: ${applied}`, 'green');
      log(`   ❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
      log(`   ⏭️  Skipped: ${appliedMigrations.length}`, 'blue');
      log('='.repeat(60) + '\n', 'cyan');
      
      if (failed > 0) {
        log('❌ Migration failed!', 'red');
        log('   Please check the error above and fix it.\n', 'yellow');
        process.exit(1);
      } else {
        log('✅ All migrations applied successfully!', 'green');
      }
    }

    // 5. Проверить таблицы
    log('\n🔍 Step 5: Verifying tables...', 'cyan');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    log(`   Found ${tablesResult.rows.length} tables:`, 'blue');
    tablesResult.rows.forEach(row => {
      log(`   • ${row.table_name}`, 'blue');
    });

    log('\n✅ Database migrations completed successfully!\n', 'green');
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
