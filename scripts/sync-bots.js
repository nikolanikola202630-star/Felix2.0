#!/usr/bin/env node
// Felix Academy - Bot Synchronization Script
// EGOIST ECOSYSTEM Edition v10.3
// Синхронизирует оба бота с базой данных и проверяет их работоспособность

const { db } = require('../lib/db');

const MAIN_BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const REF_BOT_TOKEN = process.env.REFERRAL_BOT_TOKEN || '8609120719:AAHsLIpWnc3i7MwcEsmfkNTeFIucZqukx9g';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://felix2-0.vercel.app';

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check bot info
async function checkBot(token, name) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      log(`✅ ${name}: @${data.result.username} (ID: ${data.result.id})`, 'green');
      return data.result;
    } else {
      log(`❌ ${name}: ${data.description}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ ${name}: ${error.message}`, 'red');
    return null;
  }
}

// Get webhook info
async function getWebhookInfo(token, name) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await response.json();
    
    if (data.ok) {
      const info = data.result;
      log(`\n📡 ${name} Webhook:`, 'cyan');
      log(`   URL: ${info.url || 'Not set'}`, info.url ? 'green' : 'yellow');
      log(`   Pending: ${info.pending_update_count || 0}`, 'blue');
      if (info.last_error_date) {
        log(`   Last Error: ${new Date(info.last_error_date * 1000).toLocaleString()}`, 'red');
        log(`   Error: ${info.last_error_message}`, 'red');
      }
      return info;
    }
  } catch (error) {
    log(`❌ ${name} webhook info error: ${error.message}`, 'red');
  }
  return null;
}

// Set webhook
async function setWebhook(token, name, webhookPath) {
  try {
    const url = `${WEBHOOK_URL}${webhookPath}`;
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: false
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      log(`✅ ${name} webhook set: ${url}`, 'green');
      return true;
    } else {
      log(`❌ ${name} webhook error: ${data.description}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${name} webhook error: ${error.message}`, 'red');
    return false;
  }
}

// Check database connection
async function checkDatabase() {
  try {
    const result = await db.query('SELECT NOW() as time, version() as version');
    log(`✅ Database connected`, 'green');
    log(`   Time: ${result.rows[0].time}`, 'blue');
    log(`   Version: ${result.rows[0].version.split(' ')[0]}`, 'blue');
    
    // Check tables
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    log(`\n📊 Database Tables (${tables.rows.length}):`, 'cyan');
    tables.rows.forEach(row => {
      log(`   • ${row.table_name}`, 'blue');
    });
    
    return true;
  } catch (error) {
    log(`❌ Database error: ${error.message}`, 'red');
    return false;
  }
}

// Get bot statistics
async function getBotStats() {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(DISTINCT id) as total_users,
        COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN id END) as new_users_24h,
        COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN id END) as new_users_7d
      FROM users
    `);
    
    const messages = await db.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as messages_24h
      FROM history
    `);
    
    const partners = await db.query(`
      SELECT 
        COUNT(*) as total_partners,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_partners
      FROM partner_accounts
    `);
    
    log(`\n📈 Statistics:`, 'cyan');
    log(`   Users: ${stats.rows[0].total_users} (24h: +${stats.rows[0].new_users_24h}, 7d: +${stats.rows[0].new_users_7d})`, 'blue');
    log(`   Messages: ${messages.rows[0].total_messages} (24h: ${messages.rows[0].messages_24h})`, 'blue');
    log(`   Partners: ${partners.rows[0].total_partners} (Active: ${partners.rows[0].active_partners})`, 'blue');
    
    return true;
  } catch (error) {
    log(`⚠️  Stats error: ${error.message}`, 'yellow');
    return false;
  }
}

// Main sync function
async function syncBots() {
  log('\n🤖 Felix Academy - Bot Synchronization', 'cyan');
  log('⟁ EGOIST ECOSYSTEM v10.3\n', 'cyan');
  
  // Check tokens
  if (!MAIN_BOT_TOKEN) {
    log('❌ MAIN_BOT_TOKEN not set!', 'red');
    process.exit(1);
  }
  
  if (!REF_BOT_TOKEN) {
    log('⚠️  REFERRAL_BOT_TOKEN not set, skipping referral bot', 'yellow');
  }
  
  // Check bots
  log('🔍 Checking bots...', 'cyan');
  const mainBot = await checkBot(MAIN_BOT_TOKEN, 'Main Bot');
  const refBot = REF_BOT_TOKEN ? await checkBot(REF_BOT_TOKEN, 'Referral Bot') : null;
  
  if (!mainBot) {
    log('\n❌ Main bot check failed!', 'red');
    process.exit(1);
  }
  
  // Check database
  log('\n🔍 Checking database...', 'cyan');
  const dbOk = await checkDatabase();
  
  if (!dbOk) {
    log('\n❌ Database check failed!', 'red');
    process.exit(1);
  }
  
  // Get statistics
  await getBotStats();
  
  // Check webhooks
  log('\n🔍 Checking webhooks...', 'cyan');
  await getWebhookInfo(MAIN_BOT_TOKEN, 'Main Bot');
  if (refBot) {
    await getWebhookInfo(REF_BOT_TOKEN, 'Referral Bot');
  }
  
  // Ask to set webhooks
  log('\n❓ Set webhooks? (y/n)', 'yellow');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('> ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      log('\n🔧 Setting webhooks...', 'cyan');
      await setWebhook(MAIN_BOT_TOKEN, 'Main Bot', '/api/webhook');
      if (refBot) {
        await setWebhook(REF_BOT_TOKEN, 'Referral Bot', '/api/referral-bot-v2');
      }
      
      log('\n✅ Synchronization complete!', 'green');
      log('🚀 Both bots are ready to use\n', 'green');
    } else {
      log('\n⏭️  Skipped webhook setup', 'yellow');
    }
    
    rl.close();
    process.exit(0);
  });
}

// Run
syncBots().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
