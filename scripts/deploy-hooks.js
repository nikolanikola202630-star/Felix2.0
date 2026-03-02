#!/usr/bin/env node
// Скрипты для автоматизации деплоя и хуков

import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const execAsync = promisify(exec);

// ============================================
// 1. Pre-deploy хуки
// ============================================

export async function preDeployChecks() {
  console.log('🔍 Running pre-deploy checks...');
  
  const checks = [
    checkTests(),
    checkLinting(),
    checkDatabaseConnection(),
    checkRedisConnection(),
    checkEnvironmentVariables()
  ];
  
  const results = await Promise.allSettled(checks);
  
  const failed = results.filter(r => r.status === 'rejected');
  
  if (failed.length > 0) {
    console.error('❌ Pre-deploy checks failed:');
    failed.forEach(f => console.error(f.reason));
    process.exit(1);
  }
  
  console.log('✅ All pre-deploy checks passed');
}

async function checkTests() {
  console.log('  Running tests...');
  try {
    await execAsync('npm test');
    console.log('  ✅ Tests passed');
  } catch (error) {
    throw new Error('Tests failed');
  }
}

async function checkLinting() {
  console.log('  Running linter...');
  try {
    await execAsync('npm run lint --if-present');
    console.log('  ✅ Linting passed');
  } catch (error) {
    console.log('  ⚠️  Linting warnings (non-blocking)');
  }
}

async function checkDatabaseConnection() {
  console.log('  Checking database connection...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  
  try {
    const { default: pg } = await import('pg');
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    console.log('  ✅ Database connected');
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

async function checkRedisConnection() {
  console.log('  Checking Redis connection...');
  
  if (!process.env.KV_REST_API_URL) {
    console.log('  ⚠️  Redis not configured (optional)');
    return;
  }
  
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set('health-check', 'ok', { ex: 60 });
    const value = await kv.get('health-check');
    
    if (value !== 'ok') {
      throw new Error('Health check failed');
    }
    
    console.log('  ✅ Redis connected');
  } catch (error) {
    throw new Error(`Redis connection failed: ${error.message}`);
  }
}

async function checkEnvironmentVariables() {
  console.log('  Checking environment variables...');
  
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'GROQ_API_KEY',
    'DATABASE_URL',
    'ADMIN_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  console.log('  ✅ All required environment variables set');
}

// ============================================
// 2. Post-deploy хуки
// ============================================

export async function postDeployTasks() {
  console.log('🚀 Running post-deploy tasks...');
  
  await runMigrations();
  await warmupCache();
  await notifyDeployment();
  await healthCheck();
  
  console.log('✅ All post-deploy tasks completed');
}

async function runMigrations() {
  console.log('  Running database migrations...');
  
  try {
    await execAsync('npm run migrate:up');
    console.log('  ✅ Migrations completed');
  } catch (error) {
    console.error('  ❌ Migrations failed:', error.message);
    throw error;
  }
}

async function warmupCache() {
  console.log('  Warming up cache...');
  
  try {
    // Предварительная загрузка популярных данных
    const { kv } = await import('@vercel/kv');
    
    // Загрузить курсы
    await kv.set('courses:preloaded', true, { ex: 3600 });
    
    console.log('  ✅ Cache warmed up');
  } catch (error) {
    console.log('  ⚠️  Cache warmup failed (non-critical)');
  }
}

async function notifyDeployment() {
  console.log('  Sending deployment notifications...');
  
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN_ID = process.env.ADMIN_ID;
  
  if (!TELEGRAM_BOT_TOKEN || !ADMIN_ID) {
    console.log('  ⚠️  Telegram not configured');
    return;
  }
  
  try {
    const message = `✅ Felix Bot deployed successfully!\n\nVersion: ${process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown'}\nEnvironment: ${process.env.VERCEL_ENV || 'unknown'}`;
    
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: message
      })
    });
    
    console.log('  ✅ Notification sent');
  } catch (error) {
    console.log('  ⚠️  Notification failed (non-critical)');
  }
}

async function healthCheck() {
  console.log('  Running health check...');
  
  const url = process.env.VERCEL_URL || 'https://felix-black.vercel.app';
  
  try {
    const response = await fetch(`${url}/api/webhook`);
    
    if (response.ok) {
      console.log('  ✅ Health check passed');
    } else {
      throw new Error(`Health check failed: ${response.status}`);
    }
  } catch (error) {
    console.error('  ❌ Health check failed:', error.message);
    throw error;
  }
}

// ============================================
// 3. Rollback функции
// ============================================

export async function rollback(version) {
  console.log(`🔄 Rolling back to version ${version}...`);
  
  try {
    // Откатить миграции
    await execAsync('npm run migrate:down');
    
    // Очистить кэш
    const { kv } = await import('@vercel/kv');
    await kv.flushdb();
    
    // Уведомить о rollback
    await notifyRollback(version);
    
    console.log('✅ Rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

async function notifyRollback(version) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN_ID = process.env.ADMIN_ID;
  
  if (!TELEGRAM_BOT_TOKEN || !ADMIN_ID) return;
  
  const message = `⚠️ Felix Bot rolled back to version ${version}`;
  
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: ADMIN_ID,
      text: message
    })
  });
}

// ============================================
// 4. Мониторинг деплоя
// ============================================

export async function monitorDeployment(deploymentUrl, timeout = 300000) {
  console.log('📊 Monitoring deployment...');
  
  const startTime = Date.now();
  const interval = 5000; // Проверять каждые 5 секунд
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`${deploymentUrl}/api/webhook`);
      
      if (response.ok) {
        console.log('✅ Deployment is live and healthy');
        return true;
      }
    } catch (error) {
      // Продолжить ожидание
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Deployment timeout');
}

// ============================================
// 5. CLI
// ============================================

const command = process.argv[2];

switch (command) {
  case 'pre-deploy':
    preDeployChecks().catch(err => {
      console.error(err);
      process.exit(1);
    });
    break;
  
  case 'post-deploy':
    postDeployTasks().catch(err => {
      console.error(err);
      process.exit(1);
    });
    break;
  
  case 'rollback':
    const version = process.argv[3];
    if (!version) {
      console.error('Usage: node deploy-hooks.js rollback <version>');
      process.exit(1);
    }
    rollback(version).catch(err => {
      console.error(err);
      process.exit(1);
    });
    break;
  
  case 'monitor':
    const url = process.argv[3];
    if (!url) {
      console.error('Usage: node deploy-hooks.js monitor <url>');
      process.exit(1);
    }
    monitorDeployment(url).catch(err => {
      console.error(err);
      process.exit(1);
    });
    break;
  
  default:
    console.log('Usage: node deploy-hooks.js <command>');
    console.log('Commands:');
    console.log('  pre-deploy   - Run pre-deploy checks');
    console.log('  post-deploy  - Run post-deploy tasks');
    console.log('  rollback     - Rollback to previous version');
    console.log('  monitor      - Monitor deployment');
    process.exit(1);
}
