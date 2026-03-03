#!/usr/bin/env node
// Felix Academy - Automatic Setup and Deploy
// EGOIST ECOSYSTEM Edition v10.3
// Автоматическая установка переменных окружения и деплой

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

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

function exec(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return result;
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

async function setupVercelEnv() {
  log('\n🔧 Setting up Vercel environment variables...', 'cyan');
  
  const envVars = {
    BOT_TOKEN: process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN,
    REFERRAL_BOT_TOKEN: process.env.REFERRAL_BOT_TOKEN,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_ID: process.env.ADMIN_ID
  };

  // Check if all variables are present
  const missing = [];
  for (const [key, value] of Object.entries(envVars)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    log(`\n❌ Missing environment variables in .env.local:`, 'red');
    missing.forEach(key => log(`   - ${key}`, 'red'));
    log('\nPlease add them to .env.local and try again.', 'yellow');
    process.exit(1);
  }

  log('\n✅ All environment variables found in .env.local', 'green');
  
  // Set each variable in Vercel
  for (const [key, value] of Object.entries(envVars)) {
    log(`\n📝 Setting ${key}...`, 'blue');
    
    try {
      // Remove existing variable if it exists
      exec(`echo "${value}" | vercel env rm ${key} production`, { 
        ignoreError: true, 
        silent: true 
      });
      
      // Add new variable
      exec(`echo "${value}" | vercel env add ${key} production`, { silent: true });
      log(`   ✅ ${key} set successfully`, 'green');
    } catch (error) {
      log(`   ⚠️  ${key} might already exist or error occurred`, 'yellow');
    }
  }

  log('\n✅ All environment variables configured!', 'green');
}

async function commitAndPush() {
  log('\n📦 Committing changes...', 'cyan');
  
  try {
    // Check if there are changes
    const status = exec('git status --porcelain', { silent: true });
    
    if (!status || status.trim() === '') {
      log('   ℹ️  No changes to commit', 'blue');
      return;
    }

    // Add all changes
    exec('git add .');
    log('   ✅ Changes staged', 'green');

    // Commit
    const timestamp = new Date().toISOString().split('T')[0];
    exec(`git commit -m "feat: production ready - database migrations applied (${timestamp})"`);
    log('   ✅ Changes committed', 'green');

    // Push
    log('\n🚀 Pushing to GitHub...', 'cyan');
    exec('git push origin main');
    log('   ✅ Pushed to GitHub', 'green');
    
  } catch (error) {
    log('\n⚠️  Git operations failed. You may need to push manually.', 'yellow');
    log('   Run: git push origin main', 'yellow');
  }
}

async function waitForDeployment() {
  log('\n⏳ Waiting for Vercel deployment...', 'cyan');
  log('   This may take 2-3 minutes...', 'blue');
  
  // Wait 30 seconds for deployment to start
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  try {
    // Get latest deployment
    const deployments = exec('vercel ls --json', { silent: true });
    const deploymentsData = JSON.parse(deployments);
    
    if (deploymentsData && deploymentsData.length > 0) {
      const latestDeployment = deploymentsData[0];
      log(`\n✅ Deployment URL: ${latestDeployment.url}`, 'green');
      return `https://${latestDeployment.url}`;
    }
  } catch (error) {
    log('\n⚠️  Could not get deployment URL automatically', 'yellow');
  }
  
  return null;
}

async function setupWebhooks(deploymentUrl) {
  if (!deploymentUrl) {
    log('\n⚠️  Skipping webhook setup - no deployment URL', 'yellow');
    log('   Run manually after deployment: node scripts/sync-bots.js', 'yellow');
    return;
  }

  log('\n🔗 Setting up webhooks...', 'cyan');
  
  try {
    process.env.WEBHOOK_URL = deploymentUrl;
    exec('node scripts/sync-bots.js');
    log('\n✅ Webhooks configured!', 'green');
  } catch (error) {
    log('\n⚠️  Webhook setup failed', 'yellow');
    log('   Run manually: node scripts/sync-bots.js', 'yellow');
  }
}

async function main() {
  log('\n🚀 Felix Academy - Automatic Setup and Deploy', 'cyan');
  log('⟁ EGOIST ECOSYSTEM v10.3\n', 'cyan');

  try {
    // Step 1: Setup Vercel environment variables
    await setupVercelEnv();

    // Step 2: Commit and push changes
    await commitAndPush();

    // Step 3: Wait for deployment
    const deploymentUrl = await waitForDeployment();

    // Step 4: Setup webhooks
    await setupWebhooks(deploymentUrl);

    log('\n🎉 Deployment complete!', 'green');
    log('\n📋 Next steps:', 'cyan');
    log('   1. Check Vercel Dashboard for deployment status', 'blue');
    log('   2. Test your bot: @fel12x_bot', 'blue');
    log('   3. Test referral bot: @felix_inputbot', 'blue');
    
    if (deploymentUrl) {
      log(`\n🌐 Your app: ${deploymentUrl}`, 'green');
    }

  } catch (error) {
    log('\n❌ Deployment failed!', 'red');
    log(`   Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
